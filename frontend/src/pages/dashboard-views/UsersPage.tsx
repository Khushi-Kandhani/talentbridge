import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from '../DashboardLayout';
import UsersManage from '../dashboards/UsersManage';

function UsersPage() {
  const { darkMode, cardClass, mutedClass, accentClass } = useOutletContext<DashboardOutletContext>();
  return <UsersManage darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
}

export default UsersPage;
