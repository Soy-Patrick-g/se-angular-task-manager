export interface Task {
  id: number;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  status: boolean; // false = active, true = completed
  createdAt: Date;
  updatedAt: Date;
}
