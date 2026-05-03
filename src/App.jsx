import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Komponen Utama
import Login from './pages/Login';
import AuthGuard from './components/AuthGuard';
import LayoutAdmin from './components/LayoutAdmin';
import LayoutStudent from './components/LayoutStudent';
import LayoutCoach from './components/LayoutCoach'; // [BARU] Import Layout Coach

// Halaman Admin
import Dashboard from './pages/admin/Dashboard';
import ClassManage from './pages/admin/ClassManage';
import StudentManage from './pages/admin/StudentManage';
import CoachManage from './pages/admin/CoachManage'; // [BARU] Import Coach Manage
import SessionManage from './pages/admin/SessionManage';
import ScanQR from './pages/admin/ScanQR';
import ManualEntry from './pages/admin/ManualEntry';
import Recap from './pages/admin/Recap';

// Halaman Student
import Profile from './pages/student/Profile';
import History from './pages/student/History';

// Halaman Coach
import CoachProfile from './pages/coach/CoachProfile'; // [BARU] Import Profil Coach

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect halaman utama langsung ke Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />

        {/* ============================================== */}
        {/* RUTE ADMIN */}
        {/* ============================================== */}
        <Route
          path="/admin"
          element={
            <AuthGuard allowedRole="admin">
              <LayoutAdmin />
            </AuthGuard>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="classes" element={<ClassManage />} />
          <Route path="students" element={<StudentManage />} />
          <Route path="coaches" element={<CoachManage />} />{" "}
          {/* [BARU] Rute Manage Coach */}
          <Route path="sessions" element={<SessionManage />} />
          <Route path="scan" element={<ScanQR />} />
          <Route path="manual-entry" element={<ManualEntry />} />
          <Route path="recap" element={<Recap />} />
        </Route>

        {/* ============================================== */}
        {/* RUTE STUDENT */}
        {/* ============================================== */}
        <Route
          path="/student"
          element={
            <AuthGuard allowedRole="student">
              <LayoutStudent />
            </AuthGuard>
          }
        >
          <Route index element={<Profile />} />
          <Route path="history" element={<History />} />
        </Route>

        {/* ============================================== */}
        {/* RUTE COACH (PELATIH) [BARU] */}
        {/* ============================================== */}
        <Route
          path="/coach"
          element={
            <AuthGuard allowedRole="coach">
              <LayoutCoach />
            </AuthGuard>
          }
        >
          <Route index element={<CoachProfile />} />
          {/* Rute Schedule dan Logs (Akan kita buat nanti) */}
          <Route
            path="schedule"
            element={
              <div className="p-8">
                <h1>Schedule (Coming Soon)</h1>
              </div>
            }
          />
          <Route
            path="logs"
            element={
              <div className="p-8">
                <h1>Logs (Coming Soon)</h1>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;