import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './App.css';

const EMPTY_TASK = {
  title: '',
  description: '',
  dueDate: '',
};

const FILTERS = {
  all: 'all',
  active: 'active',
  completed: 'completed',
};

const formatDueDate = (rawDueDate) => {
  if (!rawDueDate) {
    return 'No due date';
  }

  const date = new Date(`${rawDueDate}T00:00:00`);
  return Number.isNaN(date.getTime()) ? rawDueDate : date.toLocaleDateString();
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState(FILTERS.all);
  const [newTask, setNewTask] = useState(EMPTY_TASK);
  const [editTask, setEditTask] = useState(null);

  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);

  const fetchTasks = useCallback(async (nextFilter) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?status=${nextFilter}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const result = await response.json();
      setTasks(result);
      setError('');
    } catch (requestError) {
      setError(`Unable to load tasks: ${requestError.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(filter);
  }, [fetchTasks, filter]);

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!newTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to create task');
      }

      setNewTask(EMPTY_TASK);
      setError('');
      await fetchTasks(filter);
    } catch (requestError) {
      setError(`Unable to create task: ${requestError.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to delete task');
      }

      setError('');
      await fetchTasks(filter);
    } catch (requestError) {
      setError(`Unable to delete task: ${requestError.message}`);
    }
  };

  const handleToggleTask = async (task) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to update task status');
      }

      setError('');
      await fetchTasks(filter);
    } catch (requestError) {
      setError(`Unable to update task: ${requestError.message}`);
    }
  };

  const handleSaveTask = async () => {
    if (!editTask.title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${editTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTask.title,
          description: editTask.description,
          dueDate: editTask.dueDate || null,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error || 'Failed to update task');
      }

      setEditTask(null);
      setError('');
      await fetchTasks(filter);
    } catch (requestError) {
      setError(`Unable to save task changes: ${requestError.message}`);
    }
  };

  return (
    <Container maxWidth="md" className="app-root">
      <Stack spacing={3}>
        <Box component="header">
          <Typography variant="h4" component="h1" gutterBottom>
            Todo App
          </Typography>
          <Typography variant="body1">Track tasks, due dates, and completion status.</Typography>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper component="section" sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Create Task
          </Typography>
          <Box component="form" onSubmit={handleCreateTask}>
            <Stack spacing={2}>
              <TextField
                required
                label="Task Title"
                value={newTask.title}
                onChange={(event) => setNewTask({ ...newTask, title: event.target.value })}
              />
              <TextField
                label="Description"
                multiline
                minRows={2}
                value={newTask.description}
                onChange={(event) => setNewTask({ ...newTask, description: event.target.value })}
              />
              <TextField
                label="Due Date"
                type="date"
                value={newTask.dueDate}
                onChange={(event) => setNewTask({ ...newTask, dueDate: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <Box>
                <Button variant="contained" type="submit">
                  Create Task
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>

        <Paper component="section" sx={{ p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Tasks
          </Typography>

          <Tabs
            aria-label="Task status filter"
            value={filter}
            onChange={(event, nextFilter) => setFilter(nextFilter)}
            sx={{ mb: 2 }}
          >
            <Tab label="All" value={FILTERS.all} />
            <Tab label="Active" value={FILTERS.active} />
            <Tab label="Completed" value={FILTERS.completed} />
          </Tabs>

          {loading ? (
            <Box aria-label="Loading tasks" sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {!hasTasks && (
                <Typography className="no-tasks" variant="body2">
                  No tasks found for this filter.
                </Typography>
              )}

              {hasTasks && (
                <List>
                  {tasks.map((task) => (
                    <ListItem
                      key={task.id}
                      divider
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            aria-label={`Edit task ${task.title}`}
                            onClick={() =>
                              setEditTask({
                                id: task.id,
                                title: task.title,
                                description: task.description || '',
                                dueDate: task.dueDate || '',
                              })
                            }
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            aria-label={`Delete task ${task.title}`}
                            color="error"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={() => handleToggleTask(task)}
                        inputProps={{ 'aria-label': `Mark ${task.title} as complete` }}
                      />
                      <ListItemText
                        primary={
                          <span className={task.completed ? 'task-title-complete' : ''}>{task.title}</span>
                        }
                        secondary={`${task.description || 'No description'} • ${formatDueDate(task.dueDate)}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </>
          )}
        </Paper>
      </Stack>

      <Dialog open={Boolean(editTask)} onClose={() => setEditTask(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        {editTask && (
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                required
                label="Task Title"
                value={editTask.title}
                onChange={(event) => setEditTask({ ...editTask, title: event.target.value })}
              />
              <TextField
                label="Description"
                multiline
                minRows={2}
                value={editTask.description}
                onChange={(event) => setEditTask({ ...editTask, description: event.target.value })}
              />
              <TextField
                label="Due Date"
                type="date"
                value={editTask.dueDate}
                onChange={(event) => setEditTask({ ...editTask, dueDate: event.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </DialogContent>
        )}
        <DialogActions>
          <Button onClick={() => setEditTask(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default App;