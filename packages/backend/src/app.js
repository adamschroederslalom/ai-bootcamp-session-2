const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

const DEFAULT_DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'todos.db');

const mapTask = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  dueDate: row.due_date,
  completed: Boolean(row.completed),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const isValidDueDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const toTaskId = (rawId) => {
  const id = Number.parseInt(rawId, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const initializeDatabase = (db) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
};

const createApp = ({ dbPath = DEFAULT_DB_PATH } = {}) => {
  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(dbPath);
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);
  initializeDatabase(db);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Todo backend server is running' });
  });

  app.get('/api/tasks', (req, res) => {
    try {
      const { status = 'all' } = req.query;
      if (!['all', 'active', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Status must be one of: all, active, completed' });
      }

      let whereClause = '';
      if (status === 'active') {
        whereClause = 'WHERE completed = 0';
      }

      if (status === 'completed') {
        whereClause = 'WHERE completed = 1';
      }

      const rows = db
        .prepare(
          `
            SELECT *
            FROM tasks
            ${whereClause}
            ORDER BY
              completed ASC,
              CASE WHEN due_date IS NULL THEN 1 ELSE 0 END ASC,
              due_date ASC,
              created_at ASC,
              id ASC
          `
        )
        .all();

      res.status(200).json(rows.map(mapTask));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });

  app.post('/api/tasks', (req, res) => {
    try {
      const { title, description = '', dueDate = null } = req.body;

      if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Task title is required' });
      }

      if (description !== null && typeof description !== 'string') {
        return res.status(400).json({ error: 'Task description must be a string' });
      }

      if (dueDate !== null && dueDate !== '' && !isValidDueDate(dueDate)) {
        return res.status(400).json({ error: 'Task due date must be in YYYY-MM-DD format' });
      }

      const normalizedDescription = description || '';
      const normalizedDueDate = dueDate === '' ? null : dueDate;

      const result = db
        .prepare(
          `
            INSERT INTO tasks (title, description, due_date, completed)
            VALUES (?, ?, ?, 0)
          `
        )
        .run(title.trim(), normalizedDescription.trim(), normalizedDueDate);

      const createdTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(mapTask(createdTask));
    } catch (error) {
      console.error('Error creating task:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }
  });

  app.patch('/api/tasks/:id', (req, res) => {
    try {
      const id = toTaskId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      const existingTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!existingTask) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updates = [];
      const values = [];
      const { title, description, dueDate, completed } = req.body;

      if (title !== undefined) {
        if (typeof title !== 'string' || title.trim() === '') {
          return res.status(400).json({ error: 'Task title must be a non-empty string' });
        }
        updates.push('title = ?');
        values.push(title.trim());
      }

      if (description !== undefined) {
        if (description !== null && typeof description !== 'string') {
          return res.status(400).json({ error: 'Task description must be a string' });
        }
        updates.push('description = ?');
        values.push(description || '');
      }

      if (dueDate !== undefined) {
        if (dueDate !== null && dueDate !== '' && !isValidDueDate(dueDate)) {
          return res.status(400).json({ error: 'Task due date must be in YYYY-MM-DD format' });
        }
        updates.push('due_date = ?');
        values.push(dueDate === '' ? null : dueDate);
      }

      if (completed !== undefined) {
        if (typeof completed !== 'boolean') {
          return res.status(400).json({ error: 'Task completed must be a boolean' });
        }
        updates.push('completed = ?');
        values.push(completed ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'At least one updatable field is required' });
      }

      values.push(id);

      db.prepare(
        `
          UPDATE tasks
          SET ${updates.join(', ')}, updated_at = datetime('now')
          WHERE id = ?
        `
      ).run(...values);

      const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      return res.status(200).json(mapTask(updatedTask));
    } catch (error) {
      console.error('Error updating task:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }
  });

  app.delete('/api/tasks/:id', (req, res) => {
    try {
      const id = toTaskId(req.params.id);
      if (!id) {
        return res.status(400).json({ error: 'Valid task ID is required' });
      }

      const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      return res.status(200).json({ message: 'Task deleted successfully', id });
    } catch (error) {
      console.error('Error deleting task:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }
  });

  return {
    app,
    db,
    close: () => db.close(),
  };
};

const { app, db, close } = createApp();

module.exports = {
  app,
  db,
  close,
  createApp,
  DEFAULT_DB_PATH,
};