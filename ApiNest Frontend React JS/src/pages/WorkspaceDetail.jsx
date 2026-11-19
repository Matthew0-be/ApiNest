import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

export default function WorkspaceDetail() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [keys, setKeys] = useState([]);
  const [label, setLabel] = useState('');
  const [newKey, setNewKey] = useState(null); // the full key lives here, in memory only
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadKeys = useCallback(async () => {
    setKeys(await api(`/portal/workspaces/${id}/keys`));
  }, [id]);

  useEffect(() => {
    const load = async () => {
      try {
        setWorkspace(await api(`/portal/workspaces/${id}`));
        await loadKeys();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, loadKeys]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const created = await api(`/portal/workspaces/${id}/keys`, {
        method: 'POST',
        body: { label },
      });
      setNewKey({ key: created.key, label: created.label });
      setCopied(false);
      setLabel('');
      await loadKeys();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRevoke = async (keyId) => {
    if (!window.confirm('Revoke this key? It stops working immediately.')) return;
    setError('');
    try {
      await api(`/portal/keys/${keyId}/revoke`, { method: 'POST' });
      await loadKeys();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRotate = async (keyId) => {
    if (!window.confirm('Rotate this key? The old key stops working immediately.')) return;
    setError('');
    try {
      const rotated = await api(`/portal/keys/${keyId}/rotate`, { method: 'POST' });
      setNewKey({ key: rotated.key, label: rotated.label });
      setCopied(false);
      await loadKeys();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(newKey.key);
      setCopied(true);
    } catch {
      setError('Copy failed. Select the key and copy it by hand.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!workspace) return <p>{error || 'Workspace not found'} <Link to="/workspaces">Back</Link></p>;

  return (
    <div>
      <p><Link to="/workspaces">Back to workspaces</Link></p>
      <h1>{workspace.name}</h1>
      <p>{workspace.description}</p>
      <p>Limits: {workspace.requestsPerMinute} per minute, {workspace.requestsPerDay} per day</p>

      <h2>API keys</h2>

      {newKey && (
        <div>
          <p><strong>Copy your new key now. It will not be shown again.</strong></p>
          <pre>{newKey.key}</pre>
          <button onClick={handleCopy}>{copied ? 'Copied' : 'Copy'}</button>
          <button onClick={() => setNewKey(null)}>I have saved it</button>
        </div>
      )}

      <form onSubmit={handleGenerate}>
        <input
          placeholder="Label (optional)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          maxLength={50}
        />
        <button type="submit">Generate key</button>
      </form>

      {error && <p>{error}</p>}

      {keys.length === 0 ? (
        <p>No keys yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Label</th>
              <th>Key</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((k) => (
              <tr key={k.id}>
                <td>{k.label}</td>
                <td>{k.prefix}...</td>
                <td>{k.status}{k.replacedBy ? ' (rotated)' : ''}</td>
                <td>{new Date(k.createdAt).toLocaleString()}</td>
                <td>
                  {k.status === 'active' && (
                    <>
                      <button onClick={() => handleRotate(k.id)}>Rotate</button>
                      <button onClick={() => handleRevoke(k.id)}>Revoke</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}