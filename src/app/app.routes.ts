import { Routes } from "@angular/router";
import { TaskListComponent } from "./components/task-list/task-list.component";
import { LoginComponent } from "./components/login/login.component";
import { RegisterComponent } from "./components/register/register.component";
import { authGuard } from "./guards/auth.guard";

export const routes: Routes = [
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "", component: TaskListComponent, canActivate: [authGuard] },
  { path: "**", redirectTo: "login" },
];
