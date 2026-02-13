import { Request, Response } from "express";
import pool from "../config/database";

export const getAllTasks = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    let query = `
      SELECT 
        id, title, description, priority, status, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        "order", 
        due_date as "dueDate", 
        start_date as "startDate", 
        end_date as "endDate", 
        estimated_time as "estimatedTime", 
        time_spent as "timeSpent",
        tags, user_id as "userId"
       FROM tasks 
    `;
    const params: any[] = [];

    if (userId) {
      query += " WHERE user_id = $1 ";
      params.push(userId);
    }

    query += ' ORDER BY "order" ASC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

export const getTaskById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT 
        id, title, description, priority, status, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        "order", 
        due_date as "dueDate", 
        start_date as "startDate", 
        end_date as "endDate", 
        estimated_time as "estimatedTime", 
        time_spent as "timeSpent",
        tags, user_id as "userId"
       FROM tasks WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ error: "Failed to fetch task" });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      startDate,
      endDate,
      estimatedTime,
      tags,
      userId,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // Get current max order
    const orderResult = await pool.query(
      'SELECT COALESCE(MAX("order"), -1) + 1 as next_order FROM tasks',
    );
    const nextOrder = orderResult.rows[0].next_order;

    const result = await pool.query(
      `INSERT INTO tasks (
        title, description, priority, "order", due_date, start_date, end_date, estimated_time, time_spent, tags, user_id
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING 
        id, title, description, priority, status, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        "order", 
        due_date as "dueDate", 
        start_date as "startDate", 
        end_date as "endDate", 
        estimated_time as "estimatedTime", 
        time_spent as "timeSpent",
        tags, user_id as "userId"`,
      [
        title,
        description || "",
        priority || "medium",
        nextOrder,
        dueDate || null,
        startDate || null,
        endDate || null,
        estimatedTime || null,
        0, // time_spent
        tags || null,
        userId || null,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      status,
      order,
      dueDate,
      startDate,
      endDate,
      estimatedTime,
      timeSpent,
      tags,
    } = req.body;

    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           priority = COALESCE($3, priority),
           status = COALESCE($4, status),
           "order" = COALESCE($5, "order"),
           due_date = COALESCE($6, due_date),
           start_date = COALESCE($7, start_date),
           end_date = COALESCE($8, end_date),
           estimated_time = COALESCE($9, estimated_time),
           time_spent = COALESCE($10, time_spent),
           tags = COALESCE($11, tags),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $12
       RETURNING 
        id, title, description, priority, status, 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        "order", 
        due_date as "dueDate", 
        start_date as "startDate", 
        end_date as "endDate", 
        estimated_time as "estimatedTime", 
        time_spent as "timeSpent",
        tags, user_id as "userId"`,
      [
        title,
        description,
        priority,
        status,
        order,
        dueDate,
        startDate,
        endDate,
        estimatedTime,
        timeSpent,
        tags,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully", task: result.rows[0] });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
};
