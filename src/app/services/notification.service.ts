import { Injectable } from "@angular/core";
import { Task } from "../models/task.model";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private notificationPermission: NotificationPermission = "default";
  private checkInterval: any;

  constructor() {
    this.requestPermission();
  }

  async requestPermission(): Promise<void> {
    if ("Notification" in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  startMonitoring(tasks: Task[]): void {
    // Check every 5 minutes
    this.checkInterval = setInterval(
      () => {
        this.checkTaskReminders(tasks);
      },
      5 * 60 * 1000,
    );

    // Check immediately
    this.checkTaskReminders(tasks);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private checkTaskReminders(tasks: Task[]): void {
    if (this.notificationPermission !== "granted") return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    tasks.forEach((task) => {
      if (task.status || !task.dueDate) return; // Skip completed or tasks without due dates

      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      // Notify if due within 24 hours
      if (hoursDiff > 0 && hoursDiff <= 24) {
        this.sendNotification(
          "Task Due Soon!",
          `"${task.title}" is due ${this.formatTimeRemaining(hoursDiff)}`,
        );
      }
      // Notify if overdue
      else if (hoursDiff < 0) {
        this.sendNotification(
          "Overdue Task!",
          `"${task.title}" was due ${this.formatTimeRemaining(Math.abs(hoursDiff))} ago`,
        );
      }
    });
  }

  private sendNotification(title: string, body: string): void {
    if (this.notificationPermission === "granted") {
      new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
      });
    }
  }

  private formatTimeRemaining(hours: number): string {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `in ${minutes} minute${minutes !== 1 ? "s" : ""}`;
    } else if (hours < 24) {
      const roundedHours = Math.round(hours);
      return `in ${roundedHours} hour${roundedHours !== 1 ? "s" : ""}`;
    } else {
      const days = Math.round(hours / 24);
      return `in ${days} day${days !== 1 ? "s" : ""}`;
    }
  }

  notifyTaskCreated(task: Task): void {
    if (this.notificationPermission === "granted") {
      this.sendNotification(
        "Task Created",
        `"${task.title}" has been added to your list`,
      );
    }
  }

  notifyTaskCompleted(task: Task): void {
    if (this.notificationPermission === "granted") {
      this.sendNotification(
        "Task Completed!",
        `Great job completing "${task.title}"!`,
      );
    }
  }
}
