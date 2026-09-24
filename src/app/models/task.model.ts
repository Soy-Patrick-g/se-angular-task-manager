export type TaskStatus = "todo" | "in-progress" | "in-review" | "done";
export type TaskPriority = "urgent" | "high" | "medium" | "low";

export interface Task {
  id: number;
  title: string;
  project: string;
  priority: TaskPriority;
  status: TaskStatus;
  due: string;
  estimate: string;
  description: string;
  done: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  order?: number;
  dueDate?: Date | string;
  startDate?: Date | string;
  endDate?: Date | string;
  estimatedTime?: number;
  timeSpent?: number;
  tags?: string[];
}

export const normalizePriority = (
  priority: unknown,
  fallback: TaskPriority = "medium",
): TaskPriority => {
  const normalized = String(priority ?? fallback).trim().toLowerCase();

  switch (normalized) {
    case "urgent":
    case "critical":
      return "urgent";
    case "high":
      return "high";
    case "low":
      return "low";
    case "medium":
    case "normal":
    default:
      return "medium";
  }
};

export const normalizeTaskStatus = (
  status: unknown,
  fallbackDone = false,
): TaskStatus => {
  if (typeof status === "boolean") {
    return status ? "done" : "todo";
  }

  const normalized = String(status ?? "").trim().toLowerCase();

  if (["done", "completed", "complete", "finished", "true", "1"].includes(normalized) || fallbackDone) {
    return "done";
  }

  if (["in progress", "in-progress", "progress", "active"].includes(normalized)) {
    return "in-progress";
  }

  if (["in review", "in-review", "review"].includes(normalized)) {
    return "in-review";
  }

  return "todo";
};

export const normalizeTask = (task: Partial<Task> | any): Task => {
  const rawStatus = task?.status;
  const computedStatus = normalizeTaskStatus(rawStatus, Boolean(task?.done));
  const done = task?.done ?? computedStatus === "done";

  return {
    id: Number(task?.id ?? Date.now()),
    title: String(task?.title ?? "Untitled task"),
    project: String(task?.project ?? task?.tags?.[0] ?? "General"),
    priority: normalizePriority(task?.priority),
    status: computedStatus,
    due: String(
      task?.due ??
        (task?.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"),
    ),
    estimate: String(
      task?.estimate ??
        (typeof task?.estimatedTime === "number"
          ? `${task.estimatedTime}h`
          : "1h"),
    ),
    description: String(task?.description ?? ""),
    done,
    createdAt: task?.createdAt ?? new Date(),
    updatedAt: task?.updatedAt ?? new Date(),
    order: Number(task?.order ?? 0),
    dueDate: task?.dueDate ?? undefined,
    startDate: task?.startDate ?? undefined,
    endDate: task?.endDate ?? undefined,
    estimatedTime: task?.estimatedTime ?? undefined,
    timeSpent: task?.timeSpent ?? 0,
    tags: Array.isArray(task?.tags) ? task.tags : [],
  };
};
