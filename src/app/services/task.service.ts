import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, catchError, map, of, tap } from "rxjs";
import { Task, normalizeTask } from "../models/task.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/tasks`;
  private readonly storageKey = "taskflow.tasks";

  constructor(private http: HttpClient) {
    this.loadTasks();
  }

  private getDeviceId(): string {
    const key = "task_manager_device_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
        const random = (Math.random() * 16) | 0;
        const value = character === "x" ? random : (random & 0x3) | 0x8;
        return value.toString(16);
      });
      localStorage.setItem(key, id);
    }
    return id;
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      "Content-Type": "application/json",
      "X-Device-ID": this.getDeviceId(),
    });
  }

  private persistTasks(tasks: Task[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(tasks));
  }

  private readStoredTasks(): Task[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as any[];
      return parsed.map((task) => normalizeTask(task));
    } catch {
      return [];
    }
  }

  private loadTasks(): void {
    this.http
      .get<any[]>(this.apiUrl, { headers: this.getHeaders() })
      .pipe(
        map((tasks) => tasks.map((task) => normalizeTask(task))),
        tap((tasks) => {
          this.tasksSubject.next(tasks);
          this.persistTasks(tasks);
        }),
        catchError((error) => {
          console.warn("Falling back to local task storage.", error);
          const fallbackTasks = this.readStoredTasks();
          this.tasksSubject.next(fallbackTasks);
          return of(fallbackTasks);
        }),
      )
      .subscribe();
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Partial<Task>): Observable<Task | null> {
    const nextTask = normalizeTask({
      ...task,
      id: task.id ?? Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: normalizeTask(task.status ?? task.done ?? false).status,
    });

    const current = this.tasksSubject.value;
    const updated = [nextTask, ...current];
    this.tasksSubject.next(updated);
    this.persistTasks(updated);

    return this.http
      .post<any>(this.apiUrl, nextTask, { headers: this.getHeaders() })
      .pipe(
        map((created) => normalizeTask(created)),
        tap((created) => {
          const merged = this.tasksSubject.value.map((item) =>
            item.id === nextTask.id ? created : item,
          );
          this.tasksSubject.next(merged);
          this.persistTasks(merged);
        }),
        catchError(() => of(nextTask)),
      );
  }

  updateTask(id: number, changes: Partial<Task>): Observable<Task | null> {
    const current = this.tasksSubject.value;
    const updated = current.map((task) =>
      task.id === id ? normalizeTask({ ...task, ...changes, updatedAt: new Date().toISOString() }) : task,
    );
    this.tasksSubject.next(updated);
    this.persistTasks(updated);

    return this.http
      .put<any>(`${this.apiUrl}/${id}`, changes, { headers: this.getHeaders() })
      .pipe(
        map((task) => normalizeTask(task)),
        tap((updatedTask) => {
          const merged = this.tasksSubject.value.map((item) =>
            item.id === id ? updatedTask : item,
          );
          this.tasksSubject.next(merged);
          this.persistTasks(merged);
        }),
        catchError(() => of(updated.find((task) => task.id === id) ?? null)),
      );
  }

  deleteTask(id: number): Observable<boolean> {
    const remaining = this.tasksSubject.value.filter((task) => task.id !== id);
    this.tasksSubject.next(remaining);
    this.persistTasks(remaining);

    return this.http
      .delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(() => true),
        catchError(() => of(true)),
      );
  }

  filterTasks(status: "all" | "active" | "completed"): Observable<Task[]> {
    return this.tasks$.pipe(
      map((tasks) => {
        if (status === "all") return tasks;
        if (status === "active") return tasks.filter((task) => !task.done);
        if (status === "completed") return tasks.filter((task) => task.done);
        return tasks;
      }),
    );
  }

  reorderTasks(tasks: Task[]): void {
    const updated = tasks.map((task, index) => ({ ...task, order: index }));
    this.tasksSubject.next(updated);
    this.persistTasks(updated);
  }

  refreshTasks(): void {
    this.loadTasks();
  }
}
