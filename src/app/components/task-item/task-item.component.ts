import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Task } from "../../models/task.model";
import { TaskService } from "../../services/task.service";
import { FormsModule } from "@angular/forms"; // For checkbox

@Component({
  selector: "app-task-item",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./task-item.component.html",
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Output() edit = new EventEmitter<Task>();
  isEditing = false; // To handle inline edit if we want, or open form.
  // Using TaskFormComponent for edit as per plan ("User clicks Add Task -> Form opens").
  // But our plan is to "Edit a task".
  // Let's assume Edit button opens Form with data.
  // But TaskFormComponent is separate.
  // Maybe TaskItem emits 'edit' event to TaskList which opens Form?
  // Or TaskForm is a modal?
  // Let's simplify: Form is always visible at top and "User clicks 'Add Task' -> Form opens" implies modal or toggle.

  // For Edit: "User clicks Edit -> Form opens".
  // I'll emit 'edit' event, and TaskList handles opening Form?
  // Or I inject a Service to handle "Current Editing Task" state?
  // Let's stick to simple: TaskItem handles "Delete" and "Toggle Status" directly via Service.
  // "Edit" might need coordination.

  // Actually, I'll put "isEditing" local state in TaskItem?
  // No, plan says form.

  // Let's assume Edit is: click Edit -> populates the shared form?
  // I'll emit an edit event for now, parent can decide.
  // Or inject TaskService and have a `setTaskToEdit(task)` method? That's clean.
  // I'll add `taskToEdit` Subject in Service?
  // Or simple @Input/Output.

  constructor(private taskService: TaskService) {}

  toggleStatus() {
    this.taskService.updateTask(this.task.id, { status: !this.task.status });
  }

  deleteTask() {
    this.taskService.deleteTask(this.task.id);
  }

  onEdit() {
    this.edit.emit(this.task);
  }
}
