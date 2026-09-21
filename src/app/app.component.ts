import { Component, signal } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./app.component.html",
})
export class AppComponent {
  activeView = signal("Today Dashboard");
  focusRunning = signal(false);
  completedTaskIds = signal<number[]>([2]);

  navItems = [
    { label: "Today Dashboard", icon: "sunny" },
    { label: "All Tasks", icon: "checklist" },
    { label: "Board", icon: "view_kanban" },
    { label: "Calendar", icon: "calendar_month" },
    { label: "Planner", icon: "map" },
    { label: "Focus Mode", icon: "center_focus_strong" },
    { label: "Habits", icon: "autorenew" },
    { label: "Analytics", icon: "insights" },
    { label: "Gamification Hub", icon: "emoji_events" },
    { label: "Templates", icon: "dashboard_customize" },
    { label: "Settings", icon: "settings" },
  ];

  tasks = [
    { id: 1, title: "Finish Embedded Systems lab report", description: "Run timing analysis benchmarks for RTOS thread prioritization and generate graphs.", tag: "School", priority: "High", due: "Today, 5:00 PM", progress: 75 },
    { id: 2, title: "Push Angular task manager update", description: "Code review and staging test for the task manager release.", tag: "Coding", priority: "Urgent", due: "11:00 AM - 12:00 PM", progress: 50 },
    { id: 3, title: "Rehearse Echoes of Praise set list", description: "Run through the updated vocal arrangements before rehearsal.", tag: "Choir", priority: "Medium", due: "Tomorrow, 9:00 AM", progress: 0 },
    { id: 4, title: "Prepare data structures revision notes", description: "Create a compact reference for trees, graphs, and red-black nodes.", tag: "School", priority: "Low", due: "Friday, 3:00 PM", progress: 0 },
  ];

  setView(view: string) { this.activeView.set(view); }

  toggleTask(taskId: number) {
    this.completedTaskIds.update((ids) => ids.includes(taskId) ? ids.filter((id) => id !== taskId) : [...ids, taskId]);
  }

  isComplete(taskId: number) { return this.completedTaskIds().includes(taskId); }

  toggleFocus() { this.focusRunning.update((running) => !running); }
}
