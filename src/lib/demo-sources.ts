// Demo mode: illustrative sample passages written for VeriScope's walkthrough.
// They are NOT real publications — they carry no URLs and are labelled as demo
// samples everywhere they appear, so the analysis can be tried without search APIs.

export const DEMO_TOPIC = "Impact of Artificial Intelligence on Employment";

export type DemoSource = {
  title: string;
  author: string;
  published_at: string;
  source_type: string;
  content: string;
};

export const demoSources: DemoSource[] = [
  {
    title: "Sample: Automation Outlook Survey of Large Employers",
    author: "Demo sample — fictional industry survey",
    published_at: "2025-01-15",
    source_type: "report",
    content:
      "Survey of 800 large employers across 20 countries. 61% of respondents expect AI tools to change at least a quarter of the tasks in their workforce within five years. Employers anticipate net job growth in data, AI and cybersecurity roles, while clerical and data-entry roles are expected to decline the fastest. Respondents expect 44% of workers' core skills to change by 2030. The survey covers only firms with more than 1,000 employees and does not include small businesses or the informal sector. Results reflect employer expectations, not measured employment outcomes.",
  },
  {
    title: "Sample: Generative AI and Occupational Exposure",
    author: "Demo sample — fictional academic working paper",
    published_at: "2023-03-20",
    source_type: "research",
    content:
      "Using task-level occupational data for the United States, we estimate that around 80% of workers have at least 10% of their tasks exposed to large language models, and about 19% have half or more of their tasks exposed. Exposure is higher for higher-wage occupations. Exposure does not imply job loss: tasks may be augmented rather than replaced. Our analysis does not estimate employment effects and relies on annotator judgments of task exposure.",
  },
  {
    title: "Sample: AI Adoption Leads to Significant Job Losses in Service Firms",
    author: "Demo sample — fictional news article",
    published_at: "2024-06-02",
    source_type: "news",
    content:
      "Several mid-sized customer-service firms reported cutting headcount by up to 30% after deploying AI chat assistants, according to company statements. Analysts quoted in the article warn that AI will cause net job losses across the service economy over the next decade. The article relies on company announcements and does not cite labour-market statistics.",
  },
  {
    title: "Sample: Regional Labour Market Statistics Bulletin",
    author: "Demo sample — fictional statistics office",
    published_at: "2019-11-10",
    source_type: "government",
    content:
      "Between 2014 and 2019, employment in occupations with high automation potential grew by 2.1% in urban regions and fell by 3.4% in rural regions. Overall employment rose by 4.8% over the same period. The bulletin predates widespread adoption of generative AI and measures automation potential using a 2013 occupational index. No breakdown by gender or age is provided.",
  },
  {
    title: "Sample: Field Experiment on AI Assistance for Support Agents",
    author: "Demo sample — fictional academic study",
    published_at: "2024-09-30",
    source_type: "research",
    content:
      "In a field study of 5,000 customer-support agents at one software company, access to an AI assistant increased resolved issues per hour by 14% on average, with the largest gains (34%) for novice workers and minimal gains for the most experienced. Employee attrition fell during the study period. The study covers a single firm over twelve months and does not measure hiring or headcount decisions.",
  },
];
