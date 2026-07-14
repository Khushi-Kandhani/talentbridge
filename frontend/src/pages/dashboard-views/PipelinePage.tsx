import { useOutletContext } from 'react-router-dom';
import { DashboardOutletContext } from '../DashboardLayout';
import PipelineBoard from '../dashboards/PipelineBoard';

function PipelinePage() {
  const { darkMode, cardClass, mutedClass, accentClass } = useOutletContext<DashboardOutletContext>();
  return <PipelineBoard darkMode={darkMode} cardClass={cardClass} mutedClass={mutedClass} accentClass={accentClass} />;
}

export default PipelinePage;
