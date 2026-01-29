import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Observable, combineLatest, map } from "rxjs";
import { Task } from "../../models/task.model";
import { TaskService } from "../../services/task.service";
import { TaskItemComponent } from "../task-item/task-item.component";
import { TaskFormComponent } from "../task-form/task-form.component";
import {
  SearchBarComponent,
  SearchFilters,
} from "../search-bar/search-bar.component";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";

@Component({
  selector: "app-task-list",
  standalone: true,
  imports: [
    CommonModule,
    TaskItemComponent,
    TaskFormComponent,
    SearchBarComponent,
    ProgressBarComponent,
  ],
  templateUrl: "./task-list.component.html",
})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]>;
  currentFilter: "all" | "active" | "completed" = "all";
  searchFilters: SearchFilters = { keyword: "" };

  totalTasks: number = 0;
  completedTasks: number = 0;

  taskToEdit: Task | null = null;

  constructor(private taskService: TaskService) {
    this.tasks$ = this.taskService.getTasks();

    // Subscribe to calculate progress
    this.tasks$.subscribe((tasks) => {
      this.totalTasks = tasks.length;
      this.completedTasks = tasks.filter((t) => t.status).length;
    });
  }

  ngOnInit(): void {}

  onEditTask(task: Task) {
    this.taskToEdit = task;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  onCancelEdit() {
    this.taskToEdit = null;
  }

  filter(status: "all" | "active" | "completed") {
    this.currentFilter = status;
    this.applyFilters();
  }

  onSearchFiltersChanged(filters: SearchFilters) {
    this.searchFilters = filters;
    this.applyFilters();
  }

  private applyFilters() {
    this.tasks$ = combineLatest([
      this.taskService.filterTasks(this.currentFilter),
    ]).pipe(
      map(([tasks]) => {
        let filtered = tasks;

        // Apply keyword search
        if (this.searchFilters.keyword) {
          const keyword = this.searchFilters.keyword.toLowerCase();
          filtered = filtered.filter(
            (task) =>
              task.title.toLowerCase().includes(keyword) ||
              task.description.toLowerCase().includes(keyword),
          );
        }

        // Apply priority filter
        if (this.searchFilters.priority) {
          filtered = filtered.filter(
            (task) => task.priority === this.searchFilters.priority,
          );
        }

        // Apply date range filter
        if (this.searchFilters.startDate) {
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= this.searchFilters.startDate!;
          });
        }

        if (this.searchFilters.endDate) {
          filtered = filtered.filter((task) => {
            const taskDate = new Date(task.createdAt);
            return taskDate <= this.searchFilters.endDate!;
          });
        }

        // Sort by order
        return filtered.sort((a, b) => a.order - b.order);
      }),
    );
  }
}
