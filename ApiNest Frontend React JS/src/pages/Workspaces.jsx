import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Workspaces() {
  const { user, logout } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const load = async () => {
    try {
      setWorkspaces(await api('/portal/workspaces'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api('/portal/workspaces', { method: 'POST', body: { name, description } });
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (w) => {
    setEditingId(w._id);
    setEditName(w.name);
    setEditDescription(w.description);
  };

  const handleSave = async (id) => {
    setError('');
    try {
      await api(`/portal/workspaces/${id}`, {
        method: 'PATCH',
        body: { name: editName, description: editDescription },
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workspace? Its keys will stop working.')) return;
    setError('');
    try {
      await api(`/portal/workspaces/${id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Workspaces</h1>
      <p>
        Logged in as {user.firstName} {user.lastName}{' '}
        <button onClick={logout}>Log out</button>
      </p>

      <h2>Create a workspace</h2>
      <form onSubmit={handleCreate}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Create</button>
      </form>

      {error && <p>{error}</p>}

      <h2>Your workspaces</h2>
      {loading && <p>Loading...</p>}
      {!loading && workspaces.length === 0 && <p>No workspaces yet.</p>}
      <ul>
        {workspaces.map((w) => (
          <li key={w._id}>
            {editingId === w._id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                <button onClick={() => handleSave(w._id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </>
            ) : (
              <>
                <Link to={`/workspaces/${w._id}`}>{w.name}</Link> {w.description}{' '}
                <button onClick={() => startEdit(w)}>Edit</button>
                <button onClick={() => handleDelete(w._id)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}