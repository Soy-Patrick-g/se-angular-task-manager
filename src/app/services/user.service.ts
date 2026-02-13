import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface User {
  id: number;
  username: string;
}

@Injectable({
  providedIn: "root",
})
export class UserService {
  private mockUsers: User[] = [
    { id: 1, username: "User A" },
    { id: 2, username: "User B" },
    { id: 3, username: "Guest" },
  ];

  private currentUserSubject = new BehaviorSubject<User>(this.mockUsers[0]);
  public currentUser$ = this.currentUserSubject.asObservable();

  getUsers(): User[] {
    return this.mockUsers;
  }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
}
