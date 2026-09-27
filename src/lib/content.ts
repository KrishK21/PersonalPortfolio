// Portfolio facts and links are carried over from the original repository.
// Preview screens are purpose-built illustrations, not claimed product screenshots.
export const profile = {
  name: "Krish Kanda",
  email: "Krishkanda99@gmail.com",
  github: "https://github.com/KrishK21",
  linkedin: "https://www.linkedin.com/in/krish-kanda",
  location: "Vancouver, WA",
};

export const projects = [
  {
    id: "resume",
    number: "01",
    name: "AI Resume Tailor",
    category: "AI + FULL STACK",
    headline: "A better fit.\nStill your story.",
    description:
      "A resume that speaks the right language without making anything up. Matches real experience to a job description with the Claude API.",
    detail:
      "Reads a job description and rewrites existing resume experience to bring the relevant skills forward. React handles the interface, FastAPI powers the backend, and Claude handles the language transformation.",
    stack: ["React", "FastAPI", "Python", "Claude API"],
    date: "Apr–Jul 2026",
    takeaway: "Designed around one constraint: keep every claim truthful.",
  },
  {
    id: "linkedout",
    number: "02",
    name: "LinkedOut",
    category: "BACKEND + PRODUCT",
    headline: "Real jobs.\nFewer dead ends.",
    description:
      "A job board built to clear out expired listings, so the next application goes somewhere real.",
    detail:
      "A Flask and SQLite job board with REST APIs and expiration filtering. The project focuses on keeping job listings useful by removing expired entries instead of leaving stale opportunities in search results.",
    stack: ["Python", "Flask", "SQLite", "REST APIs"],
    date: "Jan–May 2026",
    takeaway: "A practical backend for a problem every applicant recognizes.",
  },
  {
    id: "wealth",
    number: "03",
    name: "WealthPilot",
    category: "1ST PLACE · HUSKYHACK PHASE 1",
    headline: "Small moves.\nReal progress.",
    description:
      "An AI financial copilot that turns bank perks into progress toward personal goals. Built with Jason Pham.",
    detail:
      "Built with Jason Pham, WealthPilot connects bank perks to personal goals through ML driven suggestions, streaks, and community. The project won first place in HuskyHack Phase 1 and uses Next.js, React, Gemini, and Plaid / Amex / Chase APIs.",
    stack: ["Next.js", "React", "Gemini", "Plaid APIs"],
    date: "HuskyHack Phase 1",
    takeaway:
      "First place at HuskyHack Phase 1. Built around making financial progress feel achievable.",
  },
] as const;

export const experience = [
  {
    company: "Fisher Investments",
    role: "Software Applications Developer Intern",
    date: "Jun–Aug 2026",
    location: "Camas, WA",
    summary:
      "Built production Azure pipelines to ingest custodian files, reconcile trading restrictions, and automate releases.",
    text: "Built Azure pipelines that move on-prem files to Blob Storage, extract records with SQL, and reconcile trading restrictions. Supported a new European custodian integration, with Octopus Deploy CI/CD and Splunk monitoring in production.",
    stack:
      "Azure · C# · SQL Server · Cosmos DB · ADF · Octopus Deploy · Splunk",
  },
  {
    company: "Interject Cloud System",
    role: "Software Developer Intern",
    date: "Apr–Jul 2024",
    location: "Vancouver, WA",
    summary:
      "Built drone imagery pipelines and trained PyTorch models to detect people in thermal imagery for search and rescue.",
    text: "Streamed drone thermal imagery into SQL Server with async I/O. Trained PyTorch CNNs to detect people for search and rescue, with NumPy feature extraction and precision/recall evaluation.",
    stack: "Python · PyTorch · NumPy · CNNs · SQL Server · Async I/O",
  },
];

export const impact = [
  { value: "45%", label: "Lower drone telemetry latency" },
  { value: "60%", label: "Less manual ETL work" },
  { value: "$70k", label: "Annual trade violation savings" },
];

export const skills = [
  {
    name: "AI & machine learning",
    values:
      "PyTorch, CNN fine-tuning, NumPy, feature extraction, precision/recall evaluation, Claude API, LLMs",
  },
  {
    name: "Languages",
    values: "Python, C#, C++, C, TypeScript, JavaScript, Java, SQL, Rust",
  },
  {
    name: "Cloud & data",
    values:
      "Azure, Azure Data Factory, SQL Server, Cosmos DB, Blob Storage, SQLite, NoSQL, Splunk",
  },
  {
    name: "Engineering",
    values:
      "React, Node.js, Flask, REST APIs, GraphQL, Docker, Linux, GitHub Actions, Octopus Deploy, GitHub Copilot, Claude Code",
  },
];

export const chapters = [
  { name: "Home", progress: 0 },
  { name: "Experience", progress: 0.285 },
  { name: "Projects", progress: 0.47 },
  { name: "About", progress: 0.795 },
  { name: "Contact", progress: 1 },
];
