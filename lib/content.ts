// All site copy. Kept verbatim — no metrics, adjectives or achievements beyond
// what was supplied. If a section reads thin, it stays thin.

export type Point = { text: string; href?: string; linkText?: string; lead?: string };

export type Entry = {
  role: string;
  org: string;
  /** Shorter label for the timeline chart, where the full legal name will not fit. */
  shortOrg?: string;
  orgHref?: string;
  meta: string;
  version?: string;
  /** Omit `to` only for a role that is genuinely ongoing — a missing `to`
   *  renders as "– Present". */
  dates?: { from: string; to?: string };
  points?: Point[];
};

// Terminal block. Every line is a technology that already appears in SKILLS —
// nothing here is aspirational.
export const STACK_LINES: { ok: string; text: string }[] = [
  { ok: "Node.js", text: "service layer and data models" },
  { ok: "MySQL · PostgreSQL", text: "relational stores" },
  { ok: "MongoDB", text: "document store" },
  { ok: "React · Next.js · React Native", text: "web and mobile clients" },
  { ok: "AWS · GCP", text: "serverless deployment" },
];

// Hero lead — the first sentence of SUMMARY, unchanged.
export const HERO_LEAD =
  "Backend-focused full-stack engineer with 2+ years shipping production platforms across iGaming, fintech, healthcare, EV infrastructure, and e-commerce.";

export const STATUS = "Associate SWE at Daffodil Unthinkable";

// Career-wide, deliberately not project-specific. Every figure traces back to a
// line below — nothing is derived, rounded up, or invented.
//   2+   — SUMMARY
//   5    — the five domains named in SUMMARY: iGaming, fintech, healthcare,
//          EV infrastructure, e-commerce
//   20k+ — the live platform he is backend lead on
//   40%  — Acumensa serverless migration
export const STATS = [
  { value: "2+", label: "Years shipping production" },
  { value: "5", label: "Industries delivered in" },
  { value: "20,000+", label: "Users served in production" },
  { value: "40%", label: "Infrastructure cost reduction" },
];

// ── infographic data ────────────────────────────────────────────────────────
// Single-hue green ramp, validated against the #0a0a0a surface: monotone
// lightness, 5° hue spread, 3.95:1 at the dark end.
//
// Single hue on purpose. Red and green are the site's status accents, but they
// must never be the two ends of a chart scale: measured as a categorical pair
// they land in the CVD warn band, and closing the lightness gap to satisfy the
// dark band drops separation to ΔE 5.3 — a hard fail for ~8% of men.
//
// Ordered light → dark: on a dark surface the brightest step reads as the most
// prominent, so the current role and the largest reduction take it.
export const RAMP = ["#86efac", "#4ade80", "#22c55e", "#15803d"];

export const TIMELINE_START = "2022-08";

// Three reductions, same unit and same job, so they share one scale. Each keeps
// its context label — they come from different projects and must not read as
// one comparable series.
export const IMPACT = [
  { value: 70, metric: "Developer intervention", context: "4xBay · role and feature-level access control" },
  { value: 45, metric: "Query response time", context: "Zaloom · unified MySQL + MongoDB layer" },
  { value: 40, metric: "Infrastructure cost", context: "Acumensa · serverless migration to AWS and GCP" },
];

// The five domains named in SUMMARY, nothing added.
export const INDUSTRIES = [
  "iGaming",
  "Fintech",
  "Healthcare",
  "EV infrastructure",
  "E-commerce",
];

export const SUMMARY =
  "Backend-focused full-stack engineer with 2+ years shipping production platforms across iGaming, fintech, healthcare, EV infrastructure, and e-commerce. Backend lead on a live platform serving 20,000+ users, with working ownership of React front ends and React Native mobile alongside Node.js services, SQL and NoSQL data layers, and serverless deployment on AWS and GCP.";

export const EXPERIENCE: Entry[] = [
  {
    role: "Associate, Software Engineering",
    version: "1.3.0",
    org: "Daffodil Unthinkable Software Corporation",
    shortOrg: "Daffodil Unthinkable",
    meta: "Hisar, India (Hybrid)",
    dates: { from: "2024-09" },
    points: [
      {
        text: "Backend lead on {link}, a poker events and community platform serving 20,000+ users.",
        href: "https://www.daysofpoker.com",
        linkText: "Days of Poker",
      },
      {
        text: "Own the tournament lifecycle services running 100+ events monthly — event scheduling, live result ingestion, and automated league standings across seasons.",
      },
      {
        text: "Lead a 3-engineer backend team, setting service structure, code review standards, and release process across the platform.",
      },
      {
        text: "Design and ship client-facing production applications end to end: Node.js services and data models, React and Next.js front ends, React Native mobile, and cloud deployment.",
      },
    ],
  },
  {
    role: "Full Stack Developer (Intern)",
    version: "1.2.0",
    org: "Acumensa Technologies Pvt. Ltd.",
    shortOrg: "Acumensa Technologies",
    meta: "Remote",
    dates: { from: "2022-12", to: "2024-08" },
    points: [
      {
        lead: "4xBay",
        text: "built an operations dashboard for exchange companies with role-based and feature-level access control, cutting developer intervention by 70%; integrated 10+ blockchain networks for transaction settlement.",
      },
      {
        lead: "Jiva Healthcare",
        text: "delivered a medtech application supporting 50+ connected IoT devices, shipped to the {link}.",
        href: "https://play.google.com/store/apps/details?id=com.HealthApp",
        linkText: "Google Play Store",
      },
      {
        // Wording stays "contributed to" deliberately: the marketing site at
        // revind.ai was built by an outside agency, so claiming the domain
        // wholesale would be checkable and wrong.
        lead: "Revind",
        text: "contributed to a manufacturing ERP platform used by industrial clients. {link}",
        href: "https://revind.ai/",
        linkText: "revind.ai",
      },
      {
        text: "Migrated deployments to serverless infrastructure on AWS and GCP, cutting running costs by 40% and streamlining release operations.",
      },
    ],
  },
  {
    role: "Full Stack Development Intern",
    version: "1.1.0",
    org: "Zaloom",
    meta: "Remote",
    dates: { from: "2022-10", to: "2022-11" },
    points: [
      { text: "Engineered a backend of 10+ microservices, each serving a distinct domain responsibility." },
      { text: "Integrated MySQL and MongoDB behind a unified data layer, reducing query response time by 45%." },
    ],
  },
  {
    role: "Internship Trainee",
    version: "1.0.0",
    org: "Ahluwalia Contracts",
    meta: "Okhla, Delhi",
    // A one-month internship that ended in Aug 2022. Without `to` this rendered
    // as "Aug 2022 – Present", claiming he still works there.
    dates: { from: "2022-08", to: "2022-08" },
    points: [
      {
        text: "Built Python tooling to extract and analyse procurement data, producing reporting outputs for the procurement team.",
      },
    ],
  },
];

// Derived from EXPERIENCE so the chart and the detail cards can never disagree
// about a date. They used to be two hand-maintained arrays, which is exactly how
// Ahluwalia ended up reading "Aug 2022 – Present" in one place and
// "Aug 2022 – Aug 2022 · 1 month" in the other.
export const TIMELINE = EXPERIENCE.map((e) => ({
  org: e.shortOrg ?? e.org,
  role: e.role,
  from: e.dates!.from,
  to: e.dates!.to ?? null,
}));

export const PROJECTS: Entry[] = [
  {
    role: "Finvault",
    // Points at the apex rather than finvault.finaccru.com: that subdomain has
    // a Vercel DNS record but serves nothing, so it would be a dead link. The
    // apex is the firm's marketing site, not the product itself — swap back if
    // the product host comes up.
    org: "finaccru.com",
    orgHref: "https://finaccru.com",
    meta: "Node.js · React.js · Firebase · Python · AWS S3",
    points: [
      {
        text: "B2B platform digitalising financial documentation and approval workflows, consolidating 20+ features across vendor management, purchase orders, expense tracking, and VAT return filing.",
      },
      {
        text: "Replaced manual, document-driven finance processes with a single auditable dashboard, onboarding 30 companies onto the platform.",
      },
    ],
  },
  {
    role: "X-EV",
    org: "Charging station management platform",
    meta: "x-ev.io",
    orgHref: undefined,
    points: [
      {
        text: "Charge-point management platform for EV network operators, covering station provisioning, session monitoring, and operator reporting.",
      },
      {
        text: "Live across the operator's initial 5-station rollout, backing driver-facing iOS and Android apps for chargers rated to 480 kW.",
      },
    ],
  },
  {
    role: "The Washee",
    org: "Booking and operations platform",
    meta: "thewashee.com",
    points: [
      {
        text: "Service booking platform with customer scheduling, admin dashboards, a promo-code engine, and inspection workflows.",
      },
    ],
  },
];

export const PROJECT_LINKS: Record<string, string> = {
  "X-EV": "https://www.x-ev.io",
  "The Washee": "https://thewashee.com",
};

export const RECOGNITION = [
  {
    title: "Early promotion",
    body: "Advanced to Associate at Daffodil Unthinkable a full year ahead of every peer in the same hiring cohort.",
  },
  {
    title: "Home Run",
    body: "Daffodil Unthinkable's delivery-impact award, for contribution to client project outcomes.",
  },
  {
    title: "New Star on the Block",
    body: "Daffodil Unthinkable; one of only 5 recipients across the hiring cohort.",
  },
  {
    title: "Letter of Recommendation",
    body: "Awarded by Acumensa Technologies leadership on completion of the engagement.",
  },
];

export const SKILLS = [
  // Matches the résumé exactly. It drops C++ and C, which the site used to
  // list — keep the two in step.
  { label: "Languages", value: "JavaScript, TypeScript, Python, Java, SQL" },
  { label: "Frameworks", value: "React.js, Next.js, React Native, Node.js, Express.js, Django" },
  {
    label: "Data & Cloud",
    value: "MySQL, PostgreSQL, MongoDB, Firebase, AWS, GCP, serverless deployment",
  },
];

export const EDUCATION: Entry = {
  role: "B.Tech., Computer Science and Engineering",
  org: "Kurukshetra University, Haryana, India",
  meta: "",
  dates: { from: "2021-07", to: "2025-05" },
};

export const KNOWS_ABOUT = [
  "Backend Engineering",
  "Node.js",
  "React",
  "Next.js",
  "React Native",
  "TypeScript",
  "Python",
  "Microservices",
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Google Cloud Platform",
  "Serverless Deployment",
];
