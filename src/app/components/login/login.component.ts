import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./login.component.html",
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = "";
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = "";

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(["/"]);
        },
        error: (err) => {
          this.loading = false;
          this.error = this.authService.extractErrorMessage(err);
          console.error("Login error:", err);
        },
      });
    }
  }
}
