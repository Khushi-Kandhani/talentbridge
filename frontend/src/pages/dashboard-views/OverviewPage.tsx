import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { DashboardOutletContext } from '../DashboardLayout';
import CandidateDashboard from '../dashboards/CandidateDashboard';
import RecruiterDashboard from '../dashboards/RecruiterDashboard';
import HiringManagerDashboard from '../dashboards/HiringManagerDashboard';
import AdminDashboard from '../dashboards/AdminDashboard';

function OverviewPage() {
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const { darkMode, cardClass, mutedClass, accentClass } = useOutletContext<DashboardOutletContext>();

  switch (role) {
    case 'RECRUITER':
      return <RecruiterDashboard darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
    case 'HIRING_MANAGER':
      return <HiringManagerDashboard darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
    case 'ADMIN':
      return <AdminDashboard cardClass={cardClass} mutedClass={mutedClass} />;
    case 'CANDIDATE':
    default:
      return (
        <CandidateDashboard
          darkMode={darkMode}
          cardClass={cardClass}
          mutedClass={mutedClass}
          accentClass={accentClass}
          onBrowseJobs={() => navigate('/dashboard/jobs')}
        />
      );
  }
}

export default OverviewPage;
