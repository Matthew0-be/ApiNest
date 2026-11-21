import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Workspaces from './pages/Workspaces';
import ProtectedRoute from './components/ProtectedRoute';
import WorkspaceDetail from './pages/WorkspaceDetail';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/workspaces" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/workspaces"
        element={<ProtectedRoute><Workspaces /></ProtectedRoute>}
      />
      <Route
  path="/workspaces/:id"
  element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>}
/>
    </Routes>
  );
}