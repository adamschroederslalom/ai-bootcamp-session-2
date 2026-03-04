const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

const uniqueTitle = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const waitForBackendReady = async (request) => {
  let lastError;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await request.get('http://127.0.0.1:3030/api/tasks?status=all');
      if (response.ok()) {
        return;
      }

      lastError = new Error(`Backend readiness check returned ${response.status()}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw lastError || new Error('Backend readiness check failed');
};

test.describe('Todo workflow journeys', () => {
  test('creates a new task', async ({ page, request }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('create-task');

    await waitForBackendReady(request);
    await todoPage.goto();
    await todoPage.createTask({ title, description: 'E2E description' });

    await expect(todoPage.taskText(title)).toBeVisible();

    const response = await request.get('/api/tasks?status=all');
    expect(response.ok()).toBeTruthy();
    const tasks = await response.json();
    expect(tasks.some((task) => task.title === title && task.description === 'E2E description')).toBeTruthy();
  });

  test('validates required title on create', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.createButton.click();

    await expect(todoPage.titleInput).toBeFocused();
    const isValid = await todoPage.titleInput.evaluate((input) => input.checkValidity());
    expect(isValid).toBeFalsy();
  });

  test('toggles completion and appears in completed filter', async ({ page, request }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('toggle-task');

    await waitForBackendReady(request);
    await todoPage.goto();
    await todoPage.createTask({ title });
    await todoPage.completeTaskCheckbox(title).click();
    await todoPage.switchFilter('Completed');

    await expect(todoPage.taskText(title)).toBeVisible();

    const response = await request.get('/api/tasks?status=completed');
    expect(response.ok()).toBeTruthy();
    const completedTasks = await response.json();
    expect(completedTasks.some((task) => task.title === title && task.completed)).toBeTruthy();
  });

  test('edits an existing task', async ({ page, request }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('edit-task');
    const updatedTitle = `${title}-updated`;

    await waitForBackendReady(request);
    await todoPage.goto();
    await todoPage.createTask({ title });
    await todoPage.editTaskButton(title).click();

    const editTitleInput = page.getByLabel('Task Title').nth(1);
    await editTitleInput.fill(updatedTitle);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(todoPage.taskText(updatedTitle)).toBeVisible();

    const response = await request.get('/api/tasks?status=all');
    expect(response.ok()).toBeTruthy();
    const tasks = await response.json();
    expect(tasks.some((task) => task.title === updatedTitle)).toBeTruthy();
  });

  test('deletes a task', async ({ page, request }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('delete-task');

    await waitForBackendReady(request);
    await todoPage.goto();
    await todoPage.createTask({ title });
    await todoPage.deleteTaskButton(title).click();

    await expect(todoPage.taskText(title)).toHaveCount(0);

    const response = await request.get('/api/tasks?status=all');
    expect(response.ok()).toBeTruthy();
    const tasks = await response.json();
    expect(tasks.some((task) => task.title === title)).toBeFalsy();
  });
});
