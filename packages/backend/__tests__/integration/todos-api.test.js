const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../../src/app');

describe('Task API integration behavior', () => {
  let app;
  let close;
  let dbFile;

  beforeEach(() => {
    dbFile = path.join(os.tmpdir(), `todos-api-${Date.now()}-${Math.random()}.db`);
    const context = createApp({ dbPath: dbFile });
    app = context.app;
    close = context.close;
  });

  afterEach(() => {
    try {
      close();
    } catch (error) {
      // already closed in test
    }
    if (fs.existsSync(dbFile)) {
      fs.unlinkSync(dbFile);
    }
  });

  it('sorts tasks as active first, due date ascending, then no due date', async () => {
    await request(app).post('/api/tasks').send({ title: 'No due date active' });
    await request(app).post('/api/tasks').send({ title: 'Due later active', dueDate: '2026-04-20' });
    const completed = await request(app).post('/api/tasks').send({ title: 'Completed task', dueDate: '2026-03-10' });
    await request(app).patch(`/api/tasks/${completed.body.id}`).send({ completed: true });
    await request(app).post('/api/tasks').send({ title: 'Due sooner active', dueDate: '2026-03-05' });

    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(response.body.map((task) => task.title)).toEqual([
      'Due sooner active',
      'Due later active',
      'No due date active',
      'Completed task',
    ]);
  });

  it('filters tasks by status', async () => {
    const activeTask = await request(app).post('/api/tasks').send({ title: 'Active one' });
    const completedTask = await request(app).post('/api/tasks').send({ title: 'Complete one' });
    await request(app).patch(`/api/tasks/${completedTask.body.id}`).send({ completed: true });

    const activeResponse = await request(app).get('/api/tasks?status=active');
    const completedResponse = await request(app).get('/api/tasks?status=completed');

    expect(activeResponse.status).toBe(200);
    expect(activeResponse.body).toHaveLength(1);
    expect(activeResponse.body[0].id).toBe(activeTask.body.id);

    expect(completedResponse.status).toBe(200);
    expect(completedResponse.body).toHaveLength(1);
    expect(completedResponse.body[0].id).toBe(completedTask.body.id);
  });

  it('persists tasks to disk across app re-instantiation', async () => {
    await request(app).post('/api/tasks').send({ title: 'Persist me' });
    close();

    const secondContext = createApp({ dbPath: dbFile });
    const listResponse = await request(secondContext.app).get('/api/tasks');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((task) => task.title === 'Persist me')).toBe(true);

    secondContext.close();
  });
});
