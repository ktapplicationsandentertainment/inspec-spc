import { Link } from 'react-router-dom';

interface ToolLink {
  name: string;
  path: string;
  description: string;
}

const TOOLS: ToolLink[] = [
  {
    name: 'Control Chart Generator',
    path: '/control-chart',
    description: 'Paste your data, get an X̄-R or Individuals chart with out-of-control points flagged automatically.',
  },
  {
    name: 'Process Capability (Cp/Cpk/Pp/Ppk)',
    path: '/capability',
    description: 'Find out if your process can reliably meet spec — from raw data or summary stats.',
  },
  {
    name: 'Histogram + Normality Check',
    path: '/histogram',
    description: 'See your data\'s shape and whether it\'s normal enough to trust a Cpk number.',
  },
  {
    name: 'Pareto Chart Generator',
    path: '/pareto',
    description: 'Find the vital few causes behind most of your defects.',
  },
  {
    name: 'Gage R&R Calculator',
    path: '/gage-rr',
    description: 'Check whether your measurement system itself is trustworthy.',
  },
  {
    name: 'Sample Size / Confidence Interval',
    path: '/sample-size',
    description: 'How many samples do you actually need?',
  },
  {
    name: 'Hypothesis Testing (t-test, chi-square)',
    path: '/hypothesis-testing',
    description: 'Compare two processes and see if the difference is real.',
  },
];

export function HomePage() {
  return (
    <div className="home-page">
      <h1>InSpec SPC</h1>
      <p className="home-tagline">
        Free statistical process control tools for people who need answers, not a statistics
        degree. No sign-up, no jargon — paste your data and get a chart, a number, and a plain-
        language explanation of what it means.
      </p>

      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <div key={tool.path} className="tool-card">
            <h2>{tool.name}</h2>
            <p>{tool.description}</p>
            <Link to={tool.path} className="tool-cta">
              Open tool →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
