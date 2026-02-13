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
  selector: "app-register",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: "./register.component.html",
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = "";
  loading: boolean = false;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.registerForm = this.fb.group(
      {
        username: ["", [Validators.required, Validators.minLength(3)]],
        email: ["", [Validators.required, Validators.email]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator,
          ],
        ],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  passwordStrengthValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const errors: any = {};

    if (!hasNumber) {
      errors.missingNumber = true;
    }

    if (!hasSpecialChar) {
      errors.missingSpecialChar = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get("password")?.value === g.get("confirmPassword")?.value
      ? null
      : { mismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = "";

      const { username, email, password } = this.registerForm.value;

      this.authService.register({ username, email, password }).subscribe({
        next: () => {
          this.router.navigate(["/"]);
        },
        error: (err) => {
          this.loading = false;
          this.error = this.authService.extractErrorMessage(err);
          console.error("Registration error:", err);
        },
      });
    }
  }
}
