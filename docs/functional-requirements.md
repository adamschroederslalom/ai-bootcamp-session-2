# Functional Requirements

## Core Task Management

1. The system shall allow a user to create a new task with a required title.
2. The system shall allow a user to view all existing tasks.
3. The system shall allow a user to edit an existing task.
4. The system shall allow a user to delete an existing task.
5. The system shall allow a user to mark a task as complete.
6. The system shall allow a user to mark a completed task as incomplete.

## Task Details

7. The system shall allow a user to add an optional description to a task.
8. The system shall allow a user to add an optional due date to a task.
9. The system shall allow a user to update or remove a task due date.
10. The system shall store task status (complete/incomplete) for each task.

## Task Ordering and Filtering

11. The system shall display tasks in a consistent, predefined order.
12. The default sort order shall show incomplete tasks before completed tasks.
13. Within each status group, tasks shall be sorted by due date (earliest first); tasks without due dates shall appear after tasks with due dates.
14. Tasks with identical sort keys shall be ordered by creation time (oldest first) to ensure stable ordering.
15. The system shall allow users to filter tasks by status (all, active, completed).

## Persistence

16. The system shall persist tasks so they remain available after the application is reloaded.
17. The system shall persist all task attributes, including title, description, due date, status, and creation metadata used for sorting.
