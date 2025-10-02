import { useState, useEffect } from "react";
import './App.css';
import config from './config';

function App() {
  const [todos, setTodos] = useState([]);
  const [task, setTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, completed
  const [showDebug, setShowDebug] = useState(false);
  const [debugData, setDebugData] = useState(null);

  const API_URL = config.API_URL;

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/todos`);
      if (!res.ok) throw new Error('Failed to fetch todos');
      const data = await res.json();
      setTodos(data);
      setError("");
    } catch (err) {
      setError("Error loading todos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      const newTodo = await res.json();
      setTodos([...todos, newTodo]);
      setTask("");
      setError("");
    } catch (err) {
      setError("Error adding todo: " + err.message);
    }
  };

  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      setTodos(todos.filter(todo => todo.id !== id));
      setError("");
    } catch (err) {
      setError("Error deleting todo: " + err.message);
    }
  };

  const toggleTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/todos/${id}/toggle`, {
        method: "PATCH",
      });
      if (!res.ok) throw new Error('Failed to toggle todo');
      const updatedTodo = await res.json();
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ));
      setError("");
    } catch (err) {
      setError("Error toggling todo: " + err.message);
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditTask(todo.task);
  };

  const saveEdit = async () => {
    if (!editTask.trim()) return;
    
    try {
      const res = await fetch(`${API_URL}/todos/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: editTask }),
      });
      if (!res.ok) throw new Error('Failed to update todo');
      const updatedTodo = await res.json();
      setTodos(todos.map(todo => 
        todo.id === editingId ? updatedTodo : todo
      ));
      setEditingId(null);
      setEditTask("");
      setError("");
    } catch (err) {
      setError("Error updating todo: " + err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTask("");
  };

  const fetchDebugData = async () => {
    try {
      const [queriesRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/debug/queries`),
        fetch(`${API_URL}/debug/stats`)
      ]);
      const queries = await queriesRes.json();
      const stats = await statsRes.json();
      setDebugData({ queries, stats });
    } catch (err) {
      setError("Error fetching debug data: " + err.message);
    }
  };

  const clearQueryLog = async () => {
    try {
      await fetch(`${API_URL}/debug/queries`, { method: "DELETE" });
      fetchDebugData();
    } catch (err) {
      setError("Error clearing query log: " + err.message);
    }
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "pending") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = todos.length - completedCount;

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading todos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>✅ Todo App</h1>
          <p>Stay organized and productive</p>
          <div className="stats">
            <span className="stat">📝 Total: {todos.length}</span>
            <span className="stat">⏳ Pending: {pendingCount}</span>
            <span className="stat">✅ Completed: {completedCount}</span>
          </div>
        </header>

        {error && (
          <div className="error">
            <span>❌ {error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        <form onSubmit={addTodo} className="add-form">
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="What needs to be done?"
            className="task-input"
          />
          <button type="submit" className="add-btn">
            Add Task
          </button>
        </form>

        <div className="filters">
          <button 
            className={filter === "all" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("all")}
          >
            All ({todos.length})
          </button>
          <button 
            className={filter === "pending" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("pending")}
          >
            Pending ({pendingCount})
          </button>
          <button 
            className={filter === "completed" ? "filter-btn active" : "filter-btn"}
            onClick={() => setFilter("completed")}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="todos-container">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>No todos {filter === "all" ? "" : filter}</h3>
              <p>
                {filter === "all" 
                  ? "Add your first task above!" 
                  : `No ${filter} tasks found.`
                }
              </p>
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <div className="todo-content">
                    <input
                      type="checkbox"
                      checked={todo.completed || false}
                      onChange={() => toggleTodo(todo.id)}
                      className="todo-checkbox"
                    />
                    {editingId === todo.id ? (
                      <div className="edit-form">
                        <input
                          type="text"
                          value={editTask}
                          onChange={(e) => setEditTask(e.target.value)}
                          className="edit-input"
                          onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                          autoFocus
                        />
                        <div className="edit-actions">
                          <button onClick={saveEdit} className="save-btn">💾</button>
                          <button onClick={cancelEdit} className="cancel-btn">❌</button>
                        </div>
                      </div>
                    ) : (
                      <div className="todo-text">
                        <span className={todo.completed ? 'text-completed' : ''}>{todo.task}</span>
                        <div className="todo-actions">
                          <button onClick={() => startEdit(todo)} className="edit-btn" title="Edit">
                            ✏️
                          </button>
                          <button onClick={() => deleteTodo(todo.id)} className="delete-btn" title="Delete">
                            🗑️
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="todo-meta">
                    <small>
                      Created: {new Date(todo.created_at).toLocaleDateString()}
                      {todo.updated_at && todo.updated_at !== todo.created_at && (
                        <> • Updated: {new Date(todo.updated_at).toLocaleDateString()}</>
                      )}
                    </small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="debug-section">
          <button 
            onClick={() => {
              setShowDebug(!showDebug);
              if (!showDebug) fetchDebugData();
            }}
            className="debug-toggle"
          >
            🔍 {showDebug ? 'Hide' : 'Show'} Debug Panel
          </button>

          {showDebug && debugData && (
            <div className="debug-panel">
              <div className="debug-header">
                <h3>🔍 Debug Panel (Telescope-like)</h3>
                <button onClick={clearQueryLog} className="clear-btn">Clear Logs</button>
              </div>
              
              <div className="debug-stats">
                <div className="stat-card">
                  <h4>📊 Database Stats</h4>
                  <p>Total Todos: {debugData.stats.database.totalTodos}</p>
                  <p>Completed: {debugData.stats.database.completedTodos}</p>
                  <p>Pending: {debugData.stats.database.pendingTodos}</p>
                </div>
                <div className="stat-card">
                  <h4>🔧 Query Stats</h4>
                  <p>Total Queries: {debugData.stats.queries.totalExecuted}</p>
                  <p>Successful: {debugData.stats.queries.successfulQueries}</p>
                  <p>Failed: {debugData.stats.queries.failedQueries}</p>
                  <p>Avg Time: {debugData.stats.queries.averageExecutionTime}ms</p>
                </div>
              </div>

              <div className="query-log">
                <h4>📜 Recent Queries</h4>
                <div className="queries">
                  {debugData.queries.queries.slice(0, 10).map(query => (
                    <div key={query.id} className={`query-item ${query.status}`}>
                      <div className="query-header">
                        <span className="query-time">{new Date(query.timestamp).toLocaleTimeString()}</span>
                        <span className={`query-status ${query.status}`}>
                          {query.status === 'success' ? '✅' : '❌'} {query.status}
                        </span>
                        <span className="query-duration">{query.executionTime}ms</span>
                      </div>
                      <code className="query-sql">{query.query}</code>
                      {query.params.length > 0 && (
                        <div className="query-params">Params: [{query.params.join(', ')}]</div>
                      )}
                      {query.error && <div className="query-error">Error: {query.error}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
