import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

let tasks = [];

const buildTask = (overrides = {}) => ({
  id: overrides.id ?? Math.floor(Math.random() * 100000),
  title: overrides.title ?? 'Task title',
  description: overrides.description ?? '',
  dueDate: overrides.dueDate ?? null,
  completed: overrides.completed ?? false,
  createdAt: overrides.createdAt ?? '2026-03-01 09:00:00',
  updatedAt: overrides.updatedAt ?? '2026-03-01 09:00:00',
});

const server = setupServer(
  rest.get('/api/tasks', (req, res, ctx) => {
    const status = req.url.searchParams.get('status') || 'all';
    const filteredTasks = tasks.filter((task) => {
      if (status === 'active') {
        return !task.completed;
      }

      if (status === 'completed') {
        return task.completed;
      }

      return true;
    });

    return res(ctx.status(200), ctx.json(filteredTasks));
  }),
  rest.post('/api/tasks', async (req, res, ctx) => {
    const { title, description = '', dueDate = null } = await req.json();

    if (!title || !title.trim()) {
      return res(ctx.status(400), ctx.json({ error: 'Task title is required' }));
    }

    const createdTask = buildTask({
      id: tasks.length + 1,
      title,
      description,
      dueDate,
      completed: false,
    });
    tasks.push(createdTask);

    return res(ctx.status(201), ctx.json(createdTask));
  }),
  rest.patch('/api/tasks/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const updates = await req.json();
    const task = tasks.find((entry) => entry.id === id);

    if (!task) {
      return res(ctx.status(404), ctx.json({ error: 'Task not found' }));
    }

    Object.assign(task, updates);
    if (Object.prototype.hasOwnProperty.call(updates, 'dueDate') && updates.dueDate === '') {
      task.dueDate = null;
    }

    return res(ctx.status(200), ctx.json(task));
  }),
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    tasks = tasks.filter((task) => task.id !== id);
    return res(ctx.status(200), ctx.json({ message: 'Task deleted successfully', id }));
  })
);

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());

describe('App Component', () => {
  beforeEach(() => {
    tasks = [
      buildTask({ id: 1, title: 'Plan sprint', description: 'Prepare board', dueDate: '2026-03-10' }),
      buildTask({ id: 2, title: 'Ship release', completed: true }),
    ];
  });

  test('renders header and initial tasks', async () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Todo App' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tasks' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Plan sprint')).toBeInTheDocument();
      expect(screen.getByText('Ship release')).toBeInTheDocument();
    });
  });

  test('creates a task', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Task Title'), 'Write documentation');
    await user.click(screen.getByRole('button', { name: 'Create Task' }));

    await waitFor(() => {
      expect(screen.getByText('Write documentation')).toBeInTheDocument();
    });
  });

  test('edits an existing task', async () => {
    const user = userEvent.setup();
    render(<App />);

    const row = await screen.findByText('Plan sprint');
    const listItem = row.closest('li');
    await user.click(within(listItem).getByRole('button', { name: /edit task plan sprint/i }));

    const titleInput = screen.getAllByLabelText('Task Title')[1];
    await user.clear(titleInput);
    await user.type(titleInput, 'Plan release sprint');
    await user.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('Plan release sprint')).toBeInTheDocument();
    });
  });

  test('toggles completion and filters by status', async () => {
    const user = userEvent.setup();
    render(<App />);

    const row = await screen.findByText('Plan sprint');
    const listItem = row.closest('li');
    const checkbox = within(listItem).getByRole('checkbox');
    await user.click(checkbox);

    await waitFor(() => {
      expect(tasks.find((task) => task.title === 'Plan sprint').completed).toBe(true);
    });

    await user.click(screen.getByRole('tab', { name: 'Active' }));
    await waitFor(() => {
      expect(screen.queryByText('Plan sprint')).not.toBeInTheDocument();
    });
  });

  test('shows API error message', async () => {
    server.use(
      rest.get('/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Unable to load tasks/)).toBeInTheDocument();
    });
  });
});