import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from '../DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import JobsBrowse from '../dashboards/candidate/JobsBrowse';
import JobsManage from '../dashboards/JobsManage';

function JobsPage() {
  const role = useAuthStore((s) => s.role);
  const { darkMode, cardClass, mutedClass, accentClass } = useOutletContext<DashboardOutletContext>();

  if (role === 'RECRUITER' || role === 'ADMIN') {
    return <JobsManage darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
  }

  return (
    <JobsBrowse
      darkMode={darkMode}
      cardClass={cardClass}
      mutedClass={mutedClass}
      accentClass={accentClass}
      onApplied={() => {}}
    />
  );
}

export default JobsPage;
