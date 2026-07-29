import { Route, Routes, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ControlChartPage } from './pages/ControlChartPage';
import { CapabilityPage } from './pages/CapabilityPage';
import { HistogramPage } from './pages/HistogramPage';
import { ParetoPage } from './pages/ParetoPage';
import { GageRRPage } from './pages/GageRRPage';
import { SampleSizePage } from './pages/SampleSizePage';
import { HypothesisTestingPage } from './pages/HypothesisTestingPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          InSpec SPC
        </Link>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/control-chart" element={<ControlChartPage />} />
          <Route path="/control-chart/xbar-r" element={<ControlChartPage initialMode="subgrouped" />} />
          <Route path="/control-chart/i-mr" element={<ControlChartPage initialMode="individuals" />} />
          <Route path="/capability" element={<CapabilityPage />} />
          <Route path="/histogram" element={<HistogramPage />} />
          <Route path="/pareto" element={<ParetoPage />} />
          <Route path="/gage-rr" element={<GageRRPage />} />
          <Route path="/sample-size" element={<SampleSizePage />} />
          <Route path="/hypothesis-testing" element={<HypothesisTestingPage />} />
        </Routes>
      </main>
    </div>
  );
}
