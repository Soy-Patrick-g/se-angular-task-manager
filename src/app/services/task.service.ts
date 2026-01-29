import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap, catchError, of } from "rxjs";
import { Task } from "../models/task.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {
    this.loadTasks();
  }

  private loadTasks() {
    this.http
      .get<Task[]>(this.apiUrl)
      .pipe(
        tap((tasks) => this.tasksSubject.next(tasks)),
        catchError((error) => {
          console.error("Error loading tasks:", error);
          return of([]);
        }),
      )
      .subscribe();
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(
    task: Omit<Task, "id" | "createdAt" | "updatedAt" | "status" | "order">,
  ) {
    this.http
      .post<Task>(this.apiUrl, task)
      .pipe(
        tap(() => this.loadTasks()),
        catchError((error) => {
          console.error("Error adding task:", error);
          return of(null);
        }),
      )
      .subscribe();
  }

  updateTask(id: number, changes: Partial<Task>) {
    this.http
      .put<Task>(`${this.apiUrl}/${id}`, changes)
      .pipe(
        tap(() => this.loadTasks()),
        catchError((error) => {
          console.error("Error updating task:", error);
          return of(null);
        }),
      )
      .subscribe();
  }

  deleteTask(id: number) {
    this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.loadTasks()),
        catchError((error) => {
          console.error("Error deleting task:", error);
          return of(null);
        }),
      )
      .subscribe();
  }

  filterTasks(status: "all" | "active" | "completed"): Observable<Task[]> {
    return this.tasks$.pipe(
      tap((tasks) => {
        if (status === "all") return tasks;
        if (status === "active") return tasks.filter((t: Task) => !t.status);
        if (status === "completed") return tasks.filter((t: Task) => t.status);
        return tasks;
      }),
    );
  }

  reorderTasks(tasks: Task[]) {
    // Update order for all tasks
    const updates = tasks.map((task, index) =>
      this.http
        .put<Task>(`${this.apiUrl}/${task.id}`, { order: index })
        .toPromise(),
    );

    Promise.all(updates).then(() => this.loadTasks());
  }
}
