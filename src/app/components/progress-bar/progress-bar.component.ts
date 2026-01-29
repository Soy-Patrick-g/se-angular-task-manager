import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-progress-bar",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./progress-bar.component.html",
})
export class ProgressBarComponent {
  @Input() total: number = 0;
  @Input() completed: number = 0;

  get percentage(): number {
    if (this.total === 0) return 0;
    return Math.round((this.completed / this.total) * 100);
  }
}
