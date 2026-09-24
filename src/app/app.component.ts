import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";

type ViewName = "today" | "tasks" | "kanban";

interface Task {
  id: number;
  title: string;
  project: string;
  priority: "Urgent" | "High" | "Medium" | "Low";
  status: "To do" | "In progress" | "In review" | "Done";
  due: string;
  estimate: string;
  description: string;
  done: boolean;
}

@Component({
  selector: "app-root",
  standalone: true,
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
  imports: [CommonModule, FormsModule],
})
export class AppComponent {
  activeView: ViewName = "today";
  statuses: Task["status"][] = ["To do", "In progress", "In review", "Done"];
  searchTerm = "";
  drawerOpen = false;
  selectedTask: Task | null = null;

  tasks: Task[] = [
    { id: 1, title: "Finalize Q4 roadmap", project: "Product launch", priority: "Urgent", status: "In progress", due: "Today, 4:00 PM", estimate: "2h", description: "Lock the release milestones and share the final roadmap with the product team.", done: false },
    { id: 2, title: "Review analytics dashboard", project: "Product launch", priority: "High", status: "To do", due: "Today, 5:30 PM", estimate: "45m", description: "Check the activation funnel and annotate the largest changes since last week.", done: false },
    { id: 3, title: "Update onboarding copy", project: "Growth experiments", priority: "Medium", status: "In review", due: "Tomorrow", estimate: "1h", description: "Polish the empty states and the first-run checklist before the experiment goes live.", done: false },
    { id: 4, title: "Prepare team retro", project: "Operations", priority: "Low", status: "Done", due: "Yesterday", estimate: "30m", description: "Collect notes and prepare the discussion prompts for Friday's retrospective.", done: true },
    { id: 5, title: "Connect billing webhooks", project: "Product launch", priority: "High", status: "To do", due: "Friday", estimate: "3h", description: "Add retry handling and verify the subscription lifecycle events in staging.", done: false },
    { id: 6, title: "Audit keyboard shortcuts", project: "Operations", priority: "Medium", status: "In progress", due: "Friday", estimate: "1h", description: "Document the command palette actions and remove conflicting browser shortcuts.", done: false },
  ];

  setView(view: ViewName): void { this.activeView = view; this.drawerOpen = false; }
  openTask(task: Task): void { this.selectedTask = task; this.drawerOpen = true; }
  closeDrawer(): void { this.drawerOpen = false; }
  toggleTask(task: Task): void { task.done = !task.done; task.status = task.done ? "Done" : "To do"; }
  filteredTasks(): Task[] {
    const query = this.searchTerm.trim().toLowerCase();
    return query ? this.tasks.filter((task) => `${task.title} ${task.project}`.toLowerCase().includes(query)) : this.tasks;
  }
  tasksByStatus(status: Task["status"]): Task[] { return this.filteredTasks().filter((task) => task.status === status); }
  priorityClass(priority: Task["priority"]): string { return priority.toLowerCase(); }
}

