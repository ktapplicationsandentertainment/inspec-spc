import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentMeta } from '../lib/useDocumentMeta';

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

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'Is InSpec SPC actually free?',
    answer: 'Yes. Every tool runs entirely in your browser — no account, no paywall, no usage limits. Your data never leaves your computer; nothing is uploaded to a server.',
  },
  {
    question: "What's the difference between Cp, Cpk, Pp, and Ppk?",
    answer: 'Cp and Cpk describe short-term process capability using within-subgroup variation; Pp and Ppk describe the same thing using your actual overall (long-term) variation. Cpk and Ppk also account for how centered your process is between spec limits, while Cp and Pp assume perfect centering. The Process Capability Calculator computes all four and shows which spec limit is actually driving a low score.',
  },
  {
    question: 'Do I need Minitab or Excel to run a Gage R&R study?',
    answer: "No — the Gage R&R Calculator implements the same AIAG ANOVA method those tools use (plus the simpler Average & Range method as a fallback), free, right in your browser.",
  },
  {
    question: 'How accurate are these calculators?',
    answer: 'Every formula is unit-tested, and wherever possible validated against exact closed-form mathematical identities rather than just spot-checked numbers — for example the t-distribution and chi-square p-value calculations are checked against known statistical identities as well as textbook reference tables.',
  },
  {
    question: 'What is a control chart used for?',
    answer: "A control chart tracks a process over time and flags when it drifts out of statistical control, using rules (like the Western Electric rules) to catch shifts and trends before they become defects — before you'd even calculate a capability index.",
  },
];

export function HomePage() {
  useDocumentMeta(
    'Free Statistical Process Control Tools Online',
    'Free online SPC tools: control charts, process capability (Cp/Cpk/Pp/Ppk), Gage R&R, Pareto charts, histograms, sample size, and hypothesis testing. No signup, plain-language results.',
    '/',
  );

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

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

      <section className="home-about">
        <h2>What is statistical process control?</h2>
        <p>
          Statistical process control (SPC) is a set of methods for monitoring and controlling a
          process using data — control charts to catch drift before it becomes a defect, capability
          indices like Cpk to check whether a stable process can actually meet spec, Gage R&R to
          make sure your measurement system itself isn't the problem, and Pareto analysis to find
          which few causes are behind most of your defects. It's standard practice in
          manufacturing, quality engineering, and Six Sigma work, but the software to do it has
          traditionally meant an expensive Minitab license or a fragile spreadsheet template.
        </p>
        <p>
          InSpec SPC is a free alternative: paste your data into any of the tools above and get a
          correct, properly-labeled result in seconds, along with a plain-language explanation of
          what it actually means for your process — not just a number.
        </p>
      </section>

      <section className="home-faq">
        <h2>Frequently asked questions</h2>
        {FAQS.map((faq) => (
          <div key={faq.question} className="faq-item">
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
