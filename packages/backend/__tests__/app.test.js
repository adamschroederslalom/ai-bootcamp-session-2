const request = require('supertest');
const { createApp } = require('../src/app');

describe('Task API basic behavior', () => {
  let testApp;
  let close;

  beforeEach(() => {
    const appContext = createApp({ dbPath: ':memory:' });
    testApp = appContext.app;
    close = appContext.close;
  });

  afterEach(() => {
    close();
  });

  it('creates and returns a task', async () => {
    const response = await request(testApp).post('/api/tasks').send({
      title: 'Write tests',
      description: 'Add coverage for task API',
      dueDate: '2026-03-15',
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Write tests',
      description: 'Add coverage for task API',
      dueDate: '2026-03-15',
      completed: false,
    });
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('createdAt');
  });

  it('returns 400 when title is missing', async () => {
    const response = await request(testApp).post('/api/tasks').send({ description: 'No title' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Task title is required' });
  });

  it('updates a task and toggles completion', async () => {
    const created = await request(testApp).post('/api/tasks').send({ title: 'Initial title' });

    const update = await request(testApp)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ title: 'Updated title', completed: true });

    expect(update.status).toBe(200);
    expect(update.body.title).toBe('Updated title');
    expect(update.body.completed).toBe(true);
  });

  it('deletes an existing task', async () => {
    const created = await request(testApp).post('/api/tasks').send({ title: 'Delete me' });

    const deletion = await request(testApp).delete(`/api/tasks/${created.body.id}`);
    expect(deletion.status).toBe(200);
    expect(deletion.body).toEqual({
      message: 'Task deleted successfully',
      id: created.body.id,
    });

    const missing = await request(testApp).delete(`/api/tasks/${created.body.id}`);
    expect(missing.status).toBe(404);
    expect(missing.body).toEqual({ error: 'Task not found' });
  });
});