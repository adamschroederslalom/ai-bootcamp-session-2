const { test, expect } = require('@playwright/test');
const { TodoPage } = require('./pages/TodoPage');

const uniqueTitle = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

test.describe('Todo workflow journeys', () => {
  test('creates a new task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('create-task');

    await todoPage.goto();
    await todoPage.createTask({ title, description: 'E2E description' });

    await expect(todoPage.taskText(title)).toBeVisible();
  });

  test('validates required title on create', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.goto();
    await todoPage.createButton.click();

    await expect(page.getByText('Task title is required')).toBeVisible();
  });

  test('toggles completion and appears in completed filter', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('toggle-task');

    await todoPage.goto();
    await todoPage.createTask({ title });
    await todoPage.completeTaskCheckbox(title).check();
    await todoPage.switchFilter('Completed');

    await expect(todoPage.taskText(title)).toBeVisible();
  });

  test('edits an existing task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('edit-task');
    const updatedTitle = `${title}-updated`;

    await todoPage.goto();
    await todoPage.createTask({ title });
    await todoPage.editTaskButton(title).click();

    const editTitleInput = page.getByLabel('Task Title').nth(1);
    await editTitleInput.fill(updatedTitle);
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(todoPage.taskText(updatedTitle)).toBeVisible();
  });

  test('deletes a task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const title = uniqueTitle('delete-task');

    await todoPage.goto();
    await todoPage.createTask({ title });
    await todoPage.deleteTaskButton(title).click();

    await expect(todoPage.taskText(title)).toHaveCount(0);
  });
});
