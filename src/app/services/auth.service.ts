import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap } from "rxjs";
import { Router } from "@angular/router";

export interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface DecodedToken {
  id: number;
  username: string;
  email: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = "http://localhost:3000/api/auth";
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadUserFromStorage();
    this.checkTokenExpiration();
  }

  private loadUserFromStorage() {
    const user = localStorage.getItem("user");
    if (user && user !== "undefined" && user !== "null") {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        console.error("Failed to parse user from storage:", error);
        localStorage.removeItem("user");
      }
    }
  }

  private checkTokenExpiration() {
    const token = this.getToken();
    if (token && this.isTokenExpired(token)) {
      console.log("Token expired, logging out");
      this.logout();
    }
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    const expirationTime = decoded.exp * 1000; // Convert to milliseconds
    return Date.now() >= expirationTime;
  }

  login(credentials: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          this.setSession(response);
        }),
      );
  }

  register(user: {
    username: string;
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, user).pipe(
      tap((response) => {
        this.setSession(response);
      }),
    );
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem("token", authResult.token);
    localStorage.setItem("user", JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.currentUserSubject.next(null);
    this.router.navigate(["/login"]);
  }

  getToken(): string | null {
    return localStorage.getItem("token");
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    // Check if token is expired
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Extract error message from HTTP error response
  extractErrorMessage(error: any): string {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.message) {
      return error.message;
    }
    if (error.status === 0) {
      return "Cannot connect to server. Please check your connection.";
    }
    return "An unexpected error occurred. Please try again.";
  }
}
