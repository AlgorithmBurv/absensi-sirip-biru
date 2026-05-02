import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Komponen Utama
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import LayoutAdmin from './components/LayoutAdmin';
import LayoutStudent from './components/LayoutStudent';

// Halaman Admin
import Dashboard from './pages/admin/Dashboard';
import ClassManage from './pages/admin/ClassManage';
import StudentManage from './pages/admin/StudentManage';
import SessionManage from './pages/admin/SessionManage';
import ScanQR from './pages/admin/ScanQR';
import ManualEntry from './pages/admin/ManualEntry';
import Recap from './pages/admin/Recap';

// Halaman Student
import Profile from './pages/student/Profile';
import History from './pages/student/History';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect halaman utama langsung ke Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* Rute Admin */}
        <Route path="/admin" element={
          <AuthGuard allowedRole="admin">
            <LayoutAdmin />
          </AuthGuard>
        }>
          <Route index element={<Dashboard />} />
          <Route path="classes" element={<ClassManage />} />
          <Route path="students" element={<StudentManage />} />
          <Route path="sessions" element={<SessionManage />} />
          <Route path="scan" element={<ScanQR />} />
          <Route path="manual-entry" element={<ManualEntry />} />
          <Route path="recap" element={<Recap />} />
        </Route>

        {/* Rute Student */}
        <Route path="/student" element={
          <AuthGuard allowedRole="student">
            <LayoutStudent />
          </AuthGuard>
        }>
          <Route index element={<Profile />} />
          <Route path="history" element={<History />} />
        </Route>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;