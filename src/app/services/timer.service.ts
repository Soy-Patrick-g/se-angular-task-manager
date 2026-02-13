import { Injectable } from "@angular/core";
import { BehaviorSubject, interval, Subscription } from "rxjs";
import { Task } from "../models/task.model";
import { TaskService } from "./task.service";

interface ActiveTimer {
  taskId: number;
  startTime: number;
  elapsedSeconds: number;
}

@Injectable({
  providedIn: "root",
})
export class TimerService {
  private activeTimers = new Map<number, ActiveTimer>();
  private timersSubject = new BehaviorSubject<Map<number, number>>(new Map());
  public timers$ = this.timersSubject.asObservable();

  private updateSubscription?: Subscription;

  constructor(private taskService: TaskService) {}

  startTimer(task: Task): void {
    if (this.activeTimers.has(task.id)) return;

    this.activeTimers.set(task.id, {
      taskId: task.id,
      startTime: Date.now(),
      elapsedSeconds: (task.timeSpent || 0) * 60,
    });

    this.startGlobalUpdate();
  }

  stopTimer(task: Task): void {
    const timer = this.activeTimers.get(task.id);
    if (!timer) return;

    const finalElapsedSeconds =
      timer.elapsedSeconds + Math.floor((Date.now() - timer.startTime) / 1000);
    const timeSpentMinutes = Math.floor(finalElapsedSeconds / 60);

    // Save to backend
    this.taskService.updateTask(task.id, { timeSpent: timeSpentMinutes });

    this.activeTimers.delete(task.id);
    this.timersSubject.next(new Map(this.timersSubject.value).set(task.id, 0));

    if (this.activeTimers.size === 0) {
      this.stopGlobalUpdate();
    }
  }

  isTimerRunning(taskId: number): boolean {
    return this.activeTimers.has(taskId);
  }

  getElapsedSeconds(taskId: number): number {
    const timer = this.activeTimers.get(taskId);
    if (!timer) return 0;
    return (
      timer.elapsedSeconds + Math.floor((Date.now() - timer.startTime) / 1000)
    );
  }

  private startGlobalUpdate(): void {
    if (this.updateSubscription) return;

    this.updateSubscription = interval(1000).subscribe(() => {
      const updates = new Map<number, number>();
      this.activeTimers.forEach((timer, taskId) => {
        updates.set(taskId, this.getElapsedSeconds(taskId));
      });
      this.timersSubject.next(updates);
    });
  }

  private stopGlobalUpdate(): void {
    this.updateSubscription?.unsubscribe();
    this.updateSubscription = undefined;
  }
}
