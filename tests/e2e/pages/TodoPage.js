class TodoPage {
  constructor(page) {
    this.page = page;
    this.titleInput = page.getByLabel('Task Title').first();
    this.descriptionInput = page.getByLabel('Description').first();
    this.dueDateInput = page.getByLabel('Due Date').first();
    this.createButton = page.getByRole('button', { name: 'Create Task' });
  }

  async goto() {
    await this.page.goto('/');
  }

  async createTask({ title, description = '', dueDate = '' }) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.dueDateInput.fill(dueDate);
    await this.createButton.click();
  }

  taskText(title) {
    return this.page.getByText(title);
  }

  deleteTaskButton(title) {
    return this.page.getByRole('button', { name: `Delete task ${title}` });
  }

  editTaskButton(title) {
    return this.page.getByRole('button', { name: `Edit task ${title}` });
  }

  completeTaskCheckbox(title) {
    return this.page.getByLabel(`Mark ${title} as complete`);
  }

  async switchFilter(name) {
    await this.page.getByRole('tab', { name }).click();
  }
}

module.exports = { TodoPage };
