import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Task } from "../models/task.model";

@Injectable({
  providedIn: "root",
})
export class TaskService {
  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();
  private localStorageKey = "tasks";

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    const tasksJson = localStorage.getItem(this.localStorageKey);
    if (tasksJson) {
      try {
        const tasks = JSON.parse(tasksJson);
        this.tasksSubject.next(tasks);
      } catch (e) {
        console.error("Error parsing tasks", e);
        this.tasksSubject.next([]);
      }
    }
  }

  private saveTasks(tasks: Task[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(tasks));
    this.tasksSubject.next(tasks);
  }

  getTasks(): Observable<Task[]> {
    return this.tasks$;
  }

  addTask(task: Omit<Task, "id" | "createdAt" | "updatedAt" | "status">) {
    const currentTasks = this.tasksSubject.value;
    const newTask: Task = {
      ...task,
      id: Date.now(),
      status: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.saveTasks([...currentTasks, newTask]);
  }

  updateTask(id: number, changes: Partial<Task>) {
    const currentTasks = this.tasksSubject.value;
    const taskIndex = currentTasks.findIndex((t: Task) => t.id === id);
    if (taskIndex > -1) {
      const updatedTask = {
        ...currentTasks[taskIndex],
        ...changes,
        updatedAt: new Date(),
      };
      const updatedTasks = [...currentTasks];
      updatedTasks[taskIndex] = updatedTask;
      this.saveTasks(updatedTasks);
    }
  }

  deleteTask(id: number) {
    const currentTasks = this.tasksSubject.value;
    const updatedTasks = currentTasks.filter((t: Task) => t.id !== id);
    this.saveTasks(updatedTasks);
  }

  filterTasks(status: "all" | "active" | "completed"): Observable<Task[]> {
    return this.tasks$.pipe(
      map((tasks: Task[]) => {
        if (status === "all") return tasks;
        if (status === "active") return tasks.filter((t: Task) => !t.status);
        if (status === "completed") return tasks.filter((t: Task) => t.status);
        return tasks;
      }),
    );
  }
}
