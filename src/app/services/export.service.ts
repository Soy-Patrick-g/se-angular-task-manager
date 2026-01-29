import { Injectable } from "@angular/core";
import { Task } from "../models/task.model";

@Injectable({
  providedIn: "root",
})
export class ExportService {
  exportToCSV(tasks: Task[]): void {
    const headers = [
      "ID",
      "Title",
      "Description",
      "Priority",
      "Status",
      "Created",
      "Updated",
      "Due Date",
      "Tags",
    ];
    const csvData = tasks.map((task) => [
      task.id,
      `"${task.title.replace(/"/g, '""')}"`, // Escape quotes
      `"${task.description.replace(/"/g, '""')}"`,
      task.priority,
      task.status ? "Completed" : "Active",
      new Date(task.createdAt).toLocaleDateString(),
      new Date(task.updatedAt).toLocaleDateString(),
      task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "",
      task.tags ? task.tags.join("; ") : "",
    ]);

    const csv = [headers, ...csvData].map((row) => row.join(",")).join("\n");

    this.downloadFile(csv, "tasks.csv", "text/csv");
  }

  exportToPDF(tasks: Task[]): void {
    // Note: This requires jsPDF library to be installed
    // For now, creating a simple HTML-based PDF approach
    const htmlContent = this.generatePDFHTML(tasks);

    // Create a printable window
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  private generatePDFHTML(tasks: Task[]): string {
    const taskRows = tasks
      .map(
        (task) => `
      <tr>
        <td>${task.id}</td>
        <td>${task.title}</td>
        <td>${task.description}</td>
        <td>${task.priority}</td>
        <td>${task.status ? "Completed" : "Active"}</td>
        <td>${new Date(task.createdAt).toLocaleDateString()}</td>
        <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}</td>
      </tr>
    `,
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tasks Export</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4CAF50; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>
        <h1>Task Manager Export</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Description</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            ${taskRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  private downloadFile(
    content: string,
    filename: string,
    mimeType: string,
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
