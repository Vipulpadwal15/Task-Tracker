import React, { useState, useEffect, useMemo, useId, useRef } from 'react';
import './App.css';

const STORAGE_KEY = 'jtronix_task_tracker_items';

/** Validates the shape of data read from localStorage */
function isValidTaskArray(data) {
  if (!Array.isArray(data)) return false;
  return data.every(
    item =>
      item &&
      typeof item === 'object' &&
      typeof item.id === 'string' &&
      typeof item.text === 'string' &&
      typeof item.completed === 'boolean'
  );
}

/** Loads tasks safely from localStorage */
function loadTasksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (isValidTaskArray(parsed)) return parsed;
    console.warn('Storage data corrupted, defaulting to empty list.');
    return [];
  } catch (err) {
    console.error('Failed to read tasks from localStorage:', err);
    return [];
  }
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasksFromStorage);
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState('all');
  const [validationError, setValidationError] = useState('');
  const [storageStatus, setStorageStatus] = useState('saved');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Track the ID of the most-recently-added task (for entrance animation only)
  const [newestTaskId, setNewestTaskId] = useState(null);

  // Map of taskId → 'exiting' for deletion animation state
  const [exitingIds, setExitingIds] = useState({});
  const exitTimers = useRef({});

  const inputId = useId();

  // Persist tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      setStorageStatus('saved');
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
      setStorageStatus('error');
    }
  }, [tasks]);

  // Derived statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.reduce((acc, t) => (t.completed ? acc + 1 : acc), 0);
    const pending = total - completed;
    return { total, completed, pending };
  }, [tasks]);

  // Derived visible tasks based on filter
  const visibleTasks = useMemo(() => {
    if (filter === 'completed') return tasks.filter(t => t.completed);
    if (filter === 'pending') return tasks.filter(t => !t.completed);
    return tasks;
  }, [tasks, filter]);

  // Handle adding a new task
  const handleAddTask = e => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const trimmed = inputText.trim();

    if (!trimmed) {
      setValidationError('Please enter a task description.');
      setIsSubmitting(false);
      return;
    }

    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newTask = { id: newId, text: trimmed, completed: false };

    setTasks(prev => [...prev, newTask]);
    setNewestTaskId(newId);
    setInputText('');
    setValidationError('');
    setIsSubmitting(false);

    // Clear newest marker after animation completes
    setTimeout(() => setNewestTaskId(null), 450);
  };

  // Toggle Completed / Pending
  const handleToggleTask = id => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Delete with slide-left animation
  const handleDeleteTask = id => {
    if (exitingIds[id]) return; // prevent double trigger

    // Mark as exiting
    setExitingIds(prev => ({ ...prev, [id]: true }));

    // Remove from state after animation duration (260ms)
    exitTimers.current[id] = setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== id));
      setExitingIds(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      delete exitTimers.current[id];
    }, 260);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(exitTimers.current).forEach(clearTimeout);
    };
  }, []);

  const handleInputChange = e => {
    setInputText(e.target.value);
    if (validationError) setValidationError('');
  };

  // Build inline style for a task row
  const getTaskItemStyle = task => {
    const isExiting = !!exitingIds[task.id];
    const isNew = task.id === newestTaskId;

    if (isExiting) {
      return {
        opacity: 0,
        transform: 'translateX(-36px)',
        maxHeight: '0px',
        paddingTop: '0px',
        paddingBottom: '0px',
        marginTop: '0px',
        marginBottom: '0px',
        borderTopWidth: '0px',
        borderBottomWidth: '0px',
        backgroundColor: '#fff1f2',
        borderColor: '#fecdd3',
        boxShadow: '0 4px 12px rgba(239,68,68,0.1)',
        pointerEvents: 'none',
        transition:
          'opacity 240ms ease, transform 220ms ease, max-height 260ms ease, padding 260ms ease, margin 260ms ease, border-width 260ms ease, background-color 120ms ease, border-color 120ms ease, box-shadow 120ms ease',
      };
    }

    if (isNew) {
      return {}; // animation class handles entrance
    }

    return {};
  };

  return (
    <div className="app-wrapper">
      {/* Header */}
      <header className="app-header" role="banner">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon" aria-hidden="true">✓</span>
            <h1 className="brand-title">Task Tracker</h1>
          </div>
        </div>
      </header>

      <main className="main-container">
        <div className="tracker-card">
          {/* Task Creation */}
          <section aria-labelledby="add-task-heading">
            <h2 id="add-task-heading" className="card-section-title">
              Add a New Task
            </h2>
            <form onSubmit={handleAddTask} className="task-form" noValidate>
              <div className="input-group">
                <label htmlFor={inputId} className="sr-only">
                  Task description
                </label>
                <input
                  id={inputId}
                  type="text"
                  className={`task-input ${validationError ? 'has-error' : ''}`}
                  placeholder="Enter a task..."
                  value={inputText}
                  onChange={handleInputChange}
                  aria-invalid={validationError ? 'true' : 'false'}
                  aria-describedby={validationError ? 'task-error-msg' : undefined}
                />
                <button
                  type="submit"
                  className="btn-add"
                  disabled={isSubmitting}
                  aria-label="Add task"
                >
                  Add Task
                </button>
              </div>
              <div
                id="task-error-msg"
                className="form-feedback"
                role="alert"
                aria-live="polite"
              >
                {validationError && (
                  <span className="feedback-error">{validationError}</span>
                )}
              </div>
            </form>
          </section>

          {/* Statistics */}
          <section aria-label="Task statistics">
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-label">Total Tasks</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item stat-completed">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{stats.completed}</span>
              </div>
              <div className="stat-item stat-pending">
                <span className="stat-label">Pending</span>
                <span className="stat-value">{stats.pending}</span>
              </div>
            </div>
          </section>

          {/* Filters & Sync Status */}
          <section className="toolbar-section" aria-label="Task filters and status">
            <div className="filter-group">
              <span className="filter-label" id="filter-group-label">
                Filter by:
              </span>
              <div className="filter-tabs" role="group" aria-labelledby="filter-group-label">
                {['all', 'pending', 'completed'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="sync-status" aria-live="polite">
              {storageStatus === 'saved' ? (
                <>
                  <svg
                    className="sync-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  <span>Auto-saving enabled</span>
                </>
              ) : (
                <span style={{ color: 'var(--danger-text)' }}>Storage write error</span>
              )}
            </div>
          </section>

          {/* Task List */}
          <section className="task-list-section" aria-label="Tasks list">
            {visibleTasks.length === 0 ? (
              <div className="empty-state">
                <svg
                  className="empty-state-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
                <p className="empty-state-title">
                  {tasks.length === 0 ? 'No tasks yet' : `No ${filter} tasks`}
                </p>
                <p className="empty-state-desc">
                  {tasks.length === 0
                    ? 'Add a task using the input above to get started.'
                    : `There are currently no tasks matching the "${filter}" filter.`}
                </p>
              </div>
            ) : (
              <ul className="task-list">
                {visibleTasks.map((task, index) => {
                  const checkboxId = `task-chk-${task.id}`;
                  const isExiting = !!exitingIds[task.id];
                  const isNew = task.id === newestTaskId;

                  return (
                    <li
                      key={task.id}
                      className={[
                        'task-item',
                        task.completed ? 'completed' : '',
                        isNew ? 'task-entering' : '',
                        isExiting ? 'task-exiting' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={isExiting ? getTaskItemStyle(task) : undefined}
                    >
                      {/* Checkbox */}
                      <input
                        id={checkboxId}
                        type="checkbox"
                        className="task-checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        aria-label={`Mark "${task.text}" as ${task.completed ? 'pending' : 'completed'}`}
                        title={task.completed ? 'Mark as pending' : 'Mark as completed'}
                      />

                      {/* Task Text */}
                      <span className="task-text">{task.text}</span>

                      {/* Status Badge */}
                      <span
                        className={`status-badge ${task.completed ? 'badge-completed' : 'badge-pending'}`}
                        aria-label={`Status: ${task.completed ? 'Completed' : 'Pending'}`}
                      >
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>

                      {/* Delete Button */}
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task.id)}
                        aria-label={`Delete task: ${task.text}`}
                        title="Delete task"
                      >
                        <svg
                          className="delete-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
