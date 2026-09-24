import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Task, TaskPriority, TaskStatus, normalizeTask } from "./models/task.model";
import { TaskService } from "./services/task.service";

type ViewName = "today" | "tasks" | "analytics";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="app-shell min-h-screen flex" [class.dark-mode]="darkMode">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-mark material-symbols-outlined">check</span>
          <span>TaskFlow</span>
        </div>

        <button class="workspace-switch" type="button">
          <span class="workspace-avatar">A</span>
          <span>
            <strong>Acme workspace</strong>
            <small>Personal projects</small>
          </span>
          <span class="material-symbols-outlined">expand_more</span>
        </button>

        <nav class="side-nav">
          <button type="button" [class.active]="activeView === 'today'" (click)="setView('today')">
            <span class="material-symbols-outlined">today</span>Today
          </button>
          <button type="button" [class.active]="activeView === 'tasks'" (click)="setView('tasks')">
            <span class="material-symbols-outlined">checklist</span>All tasks <span class="nav-count">{{ tasks.length }}</span>
          </button>
          <button type="button" [class.active]="activeView === 'analytics'" (click)="setView('analytics')">
            <span class="material-symbols-outlined">analytics</span>Analytics
          </button>
        </nav>

        <div class="projects-label">
          <span>Projects</span>
          <button type="button">+</button>
        </div>

        <div class="project-list">
          <span><i class="dot dot-purple"></i>Product launch<em>{{ projectCount('Product launch') }}</em></span>
          <span><i class="dot dot-red"></i>Growth experiments<em>{{ projectCount('Growth experiments') }}</em></span>
          <span><i class="dot dot-cyan"></i>Operations<em>{{ projectCount('Operations') }}</em></span>
        </div>

        <div class="profile-card">
          <div class="profile-row">
            <span class="avatar">JD</span>
            <span><strong>Jordan Davis</strong><small>Product designer</small></span>
            <span class="streak"><span class="material-symbols-outlined">local_fire_department</span> 7</span>
          </div>
          <div class="xp-row"><span>Weekly progress</span><b>{{ progressPercent }}%</b></div>
          <div class="xp-track"><span [style.width.%]="progressPercent"></span></div>
          <span class="synced"><i></i>Synced just now</span>
        </div>
      </aside>

      <section class="workspace">
        <header class="topbar">
          <label class="search">
            <span class="material-symbols-outlined">search</span>
            <input [(ngModel)]="searchTerm" placeholder="Search tasks..." aria-label="Search tasks" />
            <kbd>⌘ K</kbd>
          </label>

          <div class="view-tabs">
            <button type="button" [class.selected]="activeView === 'today'" (click)="setView('today')">Today</button>
            <button type="button" [class.selected]="activeView === 'tasks'" (click)="setView('tasks')">List</button>
            <button type="button" [class.selected]="activeView === 'analytics'" (click)="setView('analytics')">Board</button>
          </div>

          <div class="top-actions">
            <span class="sync-status"><i></i>All changes saved</span>
            <button class="icon-button theme-toggle" type="button" [attr.aria-label]="darkMode ? 'Switch to light mode' : 'Switch to dark mode'" (click)="toggleDarkMode()">
              <span class="material-symbols-outlined">{{ darkMode ? 'light_mode' : 'dark_mode' }}</span>
            </button>
            <button class="new-task" type="button" (click)="openNewTask()"><span>+</span>New task</button>
            <span class="avatar">JD</span>
          </div>
        </header>

        <main *ngIf="activeView === 'today'" class="content">
          <div class="page-heading">
            <div>
              <div class="eyebrow">Thursday, Oct 24 <b></b><span>Focus mode active</span></div>
              <h1>Good morning, Jordan <span class="material-symbols-outlined">auto_awesome</span></h1>
              <p>Here is your focused plan for the day.</p>
            </div>
            <button class="secondary-button" type="button" (click)="openNewTask()"><span class="material-symbols-outlined">tune</span>Customize</button>
          </div>

          <section class="metrics-grid">
            <article class="metric-card">
              <label>Tasks completed</label>
              <span class="metric-number">{{ completedCount }} <small>/ {{ tasks.length }}</small></span>
              <span class="positive"><span class="material-symbols-outlined">trending_up</span> {{ progressPercent }}% on pace</span>
            </article>
            <article class="metric-card daily-card">
              <div>
                <label>Daily goal</label>
                <span class="metric-number">{{ progressPercent }}%</span>
              </div>
              <div class="progress-ring">
                <svg viewBox="0 0 68 68">
                  <circle cx="34" cy="34" r="30"></circle>
                  <circle class="ring-value" cx="34" cy="34" r="30" [style.stroke-dashoffset]="ringOffset"></circle>
                </svg>
                <span>{{ completedCount }}/{{ tasks.length }}</span>
              </div>
            </article>
            <article class="metric-card">
              <label>Focus time</label>
              <span class="xp-value">3h 42m</span>
              <div class="bar"><span class="amber-fill"></span></div>
            </article>
            <article class="metric-card">
              <label>Current streak</label>
              <div class="streak-value"><span><span class="material-symbols-outlined">local_fire_department</span></span><strong>7 days</strong></div>
              <div class="bar"><span class="aqua-fill"></span></div>
            </article>
          </section>

          <section class="focus-banner">
            <div class="focus-copy">
              <span class="focus-icon material-symbols-outlined">bolt</span>
              <div>
                <div class="eyebrow">Your focus window <span>09:00 — 11:00</span></div>
                <p>You have <strong>{{ urgentTasks.length }} high-priority tasks</strong> due today.</p>
              </div>
            </div>
            <button class="primary-button" type="button" (click)="openNewTask()"><span class="material-symbols-outlined">play_arrow</span>Start focus</button>
          </section>

          <div class="dashboard-grid">
            <section class="task-sections" *ngFor="let status of statuses">
              <div class="section-heading">
                <h2>{{ statusLabel(status) }} <small>{{ tasksByStatus(status).length }} tasks</small></h2>
                <button class="text-button" type="button" (click)="openNewTask(status)">+ Add</button>
              </div>

              <article class="task-card" *ngFor="let task of tasksByStatus(status)" (click)="openTask(task)">
                <div class="task-title-row">
                  <button class="check-button" [class.checked]="task.done" type="button" (click)="$event.stopPropagation(); toggleTask(task)"><span class="material-symbols-outlined">check</span></button>
                  <strong [class.completed-text]="task.done">{{ task.title }}</strong>
                </div>
                <p>{{ task.description || 'No description provided yet.' }}</p>
                <div class="task-meta">
                  <span><i class="dot dot-purple"></i>{{ task.project }}</span>
                  <span>{{ task.due }}</span>
                </div>
                <div class="board-card-meta">
                  <span class="tag" [ngClass]="priorityClass(task.priority)">{{ task.priority }}</span>
                  <span class="status-chip" [ngClass]="statusClass(task.status)">{{ statusLabel(task.status) }}</span>
                </div>
              </article>
            </section>
          </div>
        </main>

        <main *ngIf="activeView === 'tasks'" class="mode-content">
          <div class="mode-heading">
            <div>
              <div class="eyebrow">Workspace <b></b>All tasks</div>
              <h1><span class="material-symbols-outlined">checklist</span>All tasks</h1>
              <p>Everything you are working on, in one clear list.</p>
            </div>
            <button class="primary-button" type="button" (click)="openNewTask()"><span>+</span>New task</button>
          </div>

          <div class="list-toolbar">
            <span>{{ filteredTasks().length }} tasks</span>
            <button type="button">All projects⌄</button>
            <button type="button">Any status⌄</button>
          </div>

          <div class="task-table">
            <div class="table-head">
              <span>Task</span>
              <span>Project</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Due date</span>
            </div>

            <article class="table-row" *ngFor="let task of filteredTasks()" (click)="openTask(task)">
              <button class="check-button" [class.checked]="task.done" type="button" (click)="$event.stopPropagation(); toggleTask(task)"><span class="material-symbols-outlined">check</span></button>
              <strong [class.completed-text]="task.done">{{ task.title }}</strong>
              <span><i class="dot dot-purple"></i>{{ task.project }}</span>
              <span class="status-chip" [ngClass]="statusClass(task.status)">{{ statusLabel(task.status) }}</span>
              <span class="tag" [ngClass]="priorityClass(task.priority)">{{ task.priority }}</span>
              <span class="due-date">{{ task.due }}</span>
            </article>
          </div>
        </main>

        <main *ngIf="activeView === 'analytics'" class="mode-content analytics-page">
          <div class="mode-heading">
            <div>
              <div class="eyebrow">Workspace <b></b>Performance</div>
              <h1><span class="material-symbols-outlined">analytics</span>Analytics</h1>
              <p>Understand your pace, focus, and delivery health.</p>
            </div>
            <button class="secondary-button" type="button"><span class="material-symbols-outlined">calendar_month</span>Last 30 days</button>
          </div>

          <section class="analytics-kpis">
            <article class="metric-card">
              <label>Tasks completed</label>
              <strong>{{ completedCount }}</strong>
              <span class="positive">+ 18.4% vs last month</span>
            </article>
            <article class="metric-card">
              <label>Completion rate</label>
              <strong>{{ progressPercent }}%</strong>
              <span class="positive">+ 6.2% vs last month</span>
            </article>
            <article class="metric-card">
              <label>Focus hours</label>
              <strong>94.5h</strong>
              <span class="positive">+ 12.8% vs last month</span>
            </article>
            <article class="metric-card">
              <label>Avg. cycle time</label>
              <strong>2.4d</strong>
              <span class="analytics-muted">- 0.6d faster</span>
            </article>
          </section>

          <section class="analytics-grid">
            <article class="widget analytics-chart">
              <div class="widget-title">
                <div>
                  <h2>Task completion</h2>
                  <small>Completed tasks over time</small>
                </div>
                <span class="teal-label">+18.4%</span>
              </div>
              <div class="chart-bars">
                <i style="height:42%"></i><i style="height:58%"></i><i style="height:51%"></i><i style="height:70%"></i>
                <i style="height:63%"></i><i style="height:82%"></i><i style="height:91%"></i><i style="height:76%"></i>
                <i style="height:98%"></i><i style="height:86%"></i><i style="height:100%"></i><i style="height:94%"></i>
              </div>
              <div class="chart-labels"><span>Jun 1</span><span>Jun 15</span><span>Jun 30</span></div>
            </article>

            <article class="widget">
              <div class="widget-title">
                <h2>Work by project</h2>
                <span class="reward-label">{{ tasks.length }} total</span>
              </div>
              <div class="analytics-progress">
                <span><b>Product launch</b><em>{{ projectShare('Product launch') }}%</em></span>
                <div><i class="purple-fill" [style.width.%]="projectShare('Product launch')"></i></div>
                <span><b>Growth experiments</b><em>{{ projectShare('Growth experiments') }}%</em></span>
                <div><i class="red-fill" [style.width.%]="projectShare('Growth experiments')"></i></div>
                <span><b>Operations</b><em>{{ projectShare('Operations') }}%</em></span>
                <div><i class="cyan-fill" [style.width.%]="projectShare('Operations')"></i></div>
              </div>
            </article>
          </section>
        </main>
      </section>
    </div>

    <div class="drawer-backdrop" *ngIf="drawerOpen" (click)="closeDrawer()"></div>
    <aside class="task-drawer" [class.open]="drawerOpen" *ngIf="selectedTask" aria-label="Task details">
      <div class="drawer-header">
        <span class="eyebrow">Task detail</span>
        <button class="icon-button" type="button" aria-label="Close task detail" (click)="closeDrawer()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="drawer-body">
        <div class="drawer-project">
          <i class="dot dot-purple"></i>{{ selectedTask.project }}
          <span class="tag" [ngClass]="priorityClass(selectedTask.priority)">{{ selectedTask.priority }}</span>
        </div>
        <h2>{{ selectedTask.title }}</h2>
        <p class="drawer-description">{{ selectedTask.description }}</p>

        <div class="detail-field">
          <label>Status</label>
          <div class="detail-value">
            <span class="status-chip" [ngClass]="statusClass(selectedTask.status)">{{ statusLabel(selectedTask.status) }}</span>
          </div>
        </div>

        <div class="detail-field">
          <label>Due date</label>
          <div class="detail-value"><span class="material-symbols-outlined">calendar_today</span>{{ selectedTask.due }}</div>
        </div>

        <div class="detail-field">
          <label>Estimate</label>
          <div class="detail-value"><span class="material-symbols-outlined">schedule</span>{{ selectedTask.estimate }}</div>
        </div>

        <div class="subtask-heading">
          <label>Subtasks</label>
          <span>2/4 complete</span>
        </div>
        <div class="subtask"><button class="check-button checked" type="button"><span class="material-symbols-outlined">check</span></button>Gather project notes</div>
        <div class="subtask"><button class="check-button" type="button"></button>Share with stakeholders</div>
      </div>

      <div class="drawer-footer">
        <button class="secondary-button" type="button" (click)="startEdit(selectedTask)">Edit</button>
        <button class="secondary-button" type="button" (click)="deleteTask(selectedTask)">Delete</button>
        <button class="primary-button" type="button" (click)="toggleTask(selectedTask)"><span class="material-symbols-outlined">check</span>{{ selectedTask.done ? 'Reopen task' : 'Mark complete' }}</button>
      </div>
    </aside>

    <div class="drawer-backdrop" *ngIf="isFormOpen" (click)="closeForm()"></div>
    <aside class="task-drawer" [class.open]="isFormOpen" *ngIf="isFormOpen" aria-label="Task editor">
      <div class="drawer-header">
        <span class="eyebrow">{{ editingTask ? 'Edit task' : 'New task' }}</span>
        <button class="icon-button" type="button" aria-label="Close task editor" (click)="closeForm()">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>

      <div class="drawer-body">
        <form (ngSubmit)="saveTask()">
          <div class="detail-field">
            <label>Title</label>
            <input class="detail-select" [(ngModel)]="taskDraft.title" name="title" placeholder="Task title" required />
          </div>
          <div class="detail-field">
            <label>Project</label>
            <select class="detail-select" [(ngModel)]="taskDraft.project" name="project">
              <option value="Product launch">Product launch</option>
              <option value="Growth experiments">Growth experiments</option>
              <option value="Operations">Operations</option>
              <option value="Personal">Personal</option>
            </select>
          </div>
          <div class="detail-field">
            <label>Priority</label>
            <select class="detail-select" [(ngModel)]="taskDraft.priority" name="priority">
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="detail-field">
            <label>Status</label>
            <select class="detail-select" [(ngModel)]="taskDraft.status" name="status">
              <option value="todo">To do</option>
              <option value="in-progress">In progress</option>
              <option value="in-review">In review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div class="detail-field">
            <label>Due</label>
            <input class="detail-select" [(ngModel)]="taskDraft.due" name="due" placeholder="Today, 4:00 PM" />
          </div>
          <div class="detail-field">
            <label>Estimate</label>
            <input class="detail-select" [(ngModel)]="taskDraft.estimate" name="estimate" placeholder="2h" />
          </div>
          <div class="detail-field">
            <label>Description</label>
            <textarea class="detail-select" [(ngModel)]="taskDraft.description" name="description" rows="4" placeholder="Add a task summary..."></textarea>
          </div>
        </form>
      </div>

      <div class="drawer-footer">
        <button class="secondary-button" type="button" (click)="closeForm()">Cancel</button>
        <button class="primary-button" type="submit" (click)="saveTask()">{{ editingTask ? 'Save changes' : 'Create task' }}</button>
      </div>
    </aside>
  `,
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit {
  activeView: ViewName = "today";
  darkMode = false;
  searchTerm = "";
  drawerOpen = false;
  selectedTask: Task | null = null;
  isFormOpen = false;
  editingTask: Task | null = null;

  statuses: TaskStatus[] = ["todo", "in-progress", "in-review", "done"];
  tasks: Task[] = [];

  taskDraft: {
    title: string;
    project: string;
    priority: TaskPriority;
    status: TaskStatus;
    due: string;
    estimate: string;
    description: string;
  } = {
    title: "",
    project: "Product launch",
    priority: "medium",
    status: "todo",
    due: "Today",
    estimate: "1h",
    description: "",
  };

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      this.tasks = tasks.map((task) => normalizeTask(task));
    });
  }

  get completedCount(): number {
    return this.tasks.filter((task) => task.done).length;
  }

  get progressPercent(): number {
    if (!this.tasks.length) {
      return 0;
    }
    return Math.round((this.completedCount / this.tasks.length) * 100);
  }

  get ringOffset(): number {
    const circumference = 188.5;
    const offset = circumference - (this.progressPercent / 100) * circumference;
    return offset;
  }

  get urgentTasks(): Task[] {
    return this.tasks.filter((task) => task.priority === "urgent" || task.priority === "high");
  }

  setView(view: ViewName): void {
    this.activeView = view;
    this.drawerOpen = false;
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }

  openTask(task: Task): void {
    this.selectedTask = task;
    this.drawerOpen = true;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
    this.selectedTask = null;
  }

  openNewTask(status: TaskStatus = "todo"): void {
    this.editingTask = null;
    this.taskDraft = {
      title: "",
      project: "Product launch",
      priority: "medium",
      status,
      due: "Today",
      estimate: "1h",
      description: "",
    };
    this.isFormOpen = true;
  }

  startEdit(task: Task): void {
    this.editingTask = task;
    this.taskDraft = {
      title: task.title,
      project: task.project,
      priority: task.priority,
      status: task.status,
      due: task.due,
      estimate: task.estimate,
      description: task.description,
    };
    this.isFormOpen = true;
    this.drawerOpen = false;
  }

  closeForm(): void {
    this.isFormOpen = false;
    this.editingTask = null;
  }

  saveTask(): void {
    if (!this.taskDraft.title.trim()) {
      return;
    }

    const baseTask: Partial<Task> = {
      title: this.taskDraft.title.trim(),
      project: this.taskDraft.project,
      priority: this.taskDraft.priority,
      status: this.taskDraft.status,
      due: this.taskDraft.due,
      estimate: this.taskDraft.estimate,
      description: this.taskDraft.description,
      done: this.taskDraft.status === "done",
    };

    if (this.editingTask) {
      const updated = normalizeTask({ ...this.editingTask, ...baseTask });
      this.taskService.updateTask(updated.id, updated).subscribe();
      this.closeForm();
      this.drawerOpen = false;
      return;
    }

    this.taskService.addTask(baseTask).subscribe();
    this.closeForm();
    this.drawerOpen = false;
  }

  toggleTask(task: Task): void {
    const nextStatus: TaskStatus = task.done ? "todo" : "done";
    const updated = normalizeTask({ ...task, done: !task.done, status: nextStatus });
    this.taskService.updateTask(updated.id, updated).subscribe();
  }

  deleteTask(task: Task): void {
    this.taskService.deleteTask(task.id).subscribe();
    this.closeDrawer();
    this.closeForm();
  }

  filteredTasks(): Task[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) {
      return this.tasks;
    }
    return this.tasks.filter((task) => `${task.title} ${task.project}`.toLowerCase().includes(query));
  }

  tasksByStatus(status: TaskStatus): Task[] {
    return this.filteredTasks().filter((task) => task.status === status);
  }

  projectCount(projectName: string): number {
    return this.tasks.filter((task) => task.project === projectName).length;
  }

  projectShare(projectName: string): number {
    if (!this.tasks.length) {
      return 0;
    }
    return Math.round((this.projectCount(projectName) / this.tasks.length) * 100);
  }

  statusLabel(status: TaskStatus): string {
    switch (status) {
      case "todo":
        return "To do";
      case "in-progress":
        return "In progress";
      case "in-review":
        return "In review";
      case "done":
        return "Done";
      default:
        return "To do";
    }
  }

  statusClass(status: TaskStatus): string {
    switch (status) {
      case "done":
        return "done";
      case "in-progress":
        return "in-progress";
      case "in-review":
        return "in-review";
      default:
        return "to-do";
    }
  }

  priorityClass(priority: TaskPriority): string {
    return priority.toLowerCase();
  }
}
