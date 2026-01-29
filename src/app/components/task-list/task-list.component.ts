import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TaskService } from "../../services/task.service";
import { Task } from "../../models/task.model";
import { Observable } from "rxjs";
import { TaskItemComponent } from "../task-item/task-item.component";
import { TaskFormComponent } from "../task-form/task-form.component";

@Component({
  selector: "app-task-list",
  standalone: true,
  imports: [CommonModule, TaskItemComponent, TaskFormComponent],
  templateUrl: "./task-list.component.html",
})
export class TaskListComponent implements OnInit {
  tasks$: Observable<Task[]>;
  currentFilter: "all" | "active" | "completed" = "all";

  taskToEdit: Task | null = null;

  constructor(private taskService: TaskService) {
    this.tasks$ = this.taskService.getTasks();
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
    this.tasks$ = this.taskService.filterTasks(status);
  }
}
