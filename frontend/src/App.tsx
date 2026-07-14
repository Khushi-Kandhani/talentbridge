import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForbiddenPage from './pages/ForbiddenPage';
import DashboardLayout from './pages/DashboardLayout';
import OverviewPage from './pages/dashboard-views/OverviewPage';
import JobsPage from './pages/dashboard-views/JobsPage';
import PipelinePage from './pages/dashboard-views/PipelinePage';
import AnalyticsPage from './pages/dashboard-views/AnalyticsPage';
import UsersPage from './pages/dashboard-views/UsersPage';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forbidden" element={<ForbiddenPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="jobs" element={<JobsPage />} />

            <Route element={<RoleProtectedRoute allowedRoles={['RECRUITER', 'HIRING_MANAGER']} />}>
              <Route path="pipeline" element={<PipelinePage />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
