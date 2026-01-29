import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  isDarkMode = signal(false);

  toggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }

  toggleTheme() {
    this.isDarkMode.update((v) => !v);
    if (this.isDarkMode()) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
}
