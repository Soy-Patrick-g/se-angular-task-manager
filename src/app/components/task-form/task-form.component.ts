import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { TaskService } from "../../services/task.service";
import { Task } from "../../models/task.model";

@Component({
  selector: "app-task-form",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./task-form.component.html",
  styleUrls: ["./task-form.component.css"],
})
export class TaskFormComponent implements OnChanges {
  @Input() taskToEdit: Task | null = null;
  @Output() cancelEdit = new EventEmitter<void>();

  taskForm: FormGroup;
  showForm = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
  ) {
    this.taskForm = this.fb.group({
      title: ["", Validators.required],
      description: [""],
      priority: ["medium", Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["taskToEdit"] && this.taskToEdit) {
      this.isEditMode = true;
      this.showForm = true;
      this.taskForm.patchValue({
        title: this.taskToEdit.title,
        description: this.taskToEdit.description,
        priority: this.taskToEdit.priority,
      });
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.isEditMode = false;
    this.taskToEdit = null;
    this.taskForm.reset({ priority: "medium" });
    this.cancelEdit.emit();
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formValue = this.taskForm.value;

      if (this.isEditMode && this.taskToEdit) {
        this.taskService.updateTask(this.taskToEdit.id, formValue);
      } else {
        this.taskService.addTask(formValue);
      }

      this.resetForm();
      this.showForm = false;
    }
  }
}
