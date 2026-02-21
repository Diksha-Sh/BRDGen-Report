import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import DashboardPage from './pages/DashboardPage';
import BRDViewerPage from './pages/BRDViewerPage';
import ConflictCenterPage from './pages/ConflictCenterPage';
import CitationsExplorerPage from './pages/CitationsExplorerPage';
import ExportPage from './pages/ExportPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/upload" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="processing" element={<ProcessingPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="brd-viewer" element={<BRDViewerPage />} />
          <Route path="conflict-center" element={<ConflictCenterPage />} />
          <Route path="citations" element={<CitationsExplorerPage />} />
          <Route path="export" element={<ExportPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
