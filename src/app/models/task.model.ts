export interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: boolean; // false = active, true = completed
  createdAt: Date;
  updatedAt: Date;
  order: number; // for drag-and-drop ordering
  dueDate?: Date; // optional due date for reminders
  startDate?: Date;
  endDate?: Date;
  estimatedTime?: number;
  timeSpent?: number;
  tags?: string[]; // optional tags for filtering
}
