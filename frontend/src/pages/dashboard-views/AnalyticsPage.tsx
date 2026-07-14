import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from '../DashboardLayout';
import AdminDashboard from '../dashboards/AdminDashboard';

function AnalyticsPage() {
  const { cardClass, mutedClass } = useOutletContext<DashboardOutletContext>();
  return <AdminDashboard cardClass={cardClass} mutedClass={mutedClass} />;
}

export default AnalyticsPage;
