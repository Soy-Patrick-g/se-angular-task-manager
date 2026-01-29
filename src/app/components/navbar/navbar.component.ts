import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ExportService } from "../../services/export.service";
import { TaskService } from "../../services/task.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  isMenuOpen = signal(false);
  isDarkMode = signal(false);
  showExportMenu = signal(false);

  constructor(
    private exportService: ExportService,
    private taskService: TaskService,
  ) {}

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

  toggleExportMenu() {
    this.showExportMenu.update((v) => !v);
  }

  exportToCSV() {
    this.taskService.getTasks().subscribe((tasks) => {
      this.exportService.exportToCSV(tasks);
      this.showExportMenu.set(false);
    });
  }

  exportToPDF() {
    this.taskService.getTasks().subscribe((tasks) => {
      this.exportService.exportToPDF(tasks);
      this.showExportMenu.set(false);
    });
  }
}
