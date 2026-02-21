import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import DashboardPage from './pages/DashboardPage';
import BRDViewerPage from './pages/BRDViewerPage';
import ConflictReportPage from './pages/ConflictReportPage';
import StakeholdersPage from './pages/StakeholdersPage';
import TraceabilityMatrixPage from './pages/TraceabilityMatrixPage';
import ExportPage from './pages/ExportPage';
import LoginPage from './pages/LoginPage';
import AgentsPage from './pages/AgentsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="processing" element={<ProcessingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="brd-viewer" element={<BRDViewerPage />} />
          <Route path="conflict-report" element={<ConflictReportPage />} />
          <Route path="stakeholders" element={<StakeholdersPage />} />
          <Route path="traceability" element={<TraceabilityMatrixPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="export" element={<ExportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
