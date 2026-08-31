// Single source of truth for the production origin.
//
// Until shubham-aggarwal.tech actually resolves to this deployment, set
// NEXT_PUBLIC_SITE_URL in the Vercel project to the *.vercel.app URL. Canonical
// tags, OG URLs, robots.txt and sitemap.xml all derive from this value, and
// pointing them at a domain that does not serve the site is worse than having
// no canonical at all.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shubham-aggarwal.tech"
).replace(/\/$/, "");

export const PERSON = {
  name: "Shubham Aggarwal",
  title: "Backend-focused Full-Stack Engineer",
  location: "Delhi, India",
  email: "aggarwalshubham026@gmail.com",
  github: "https://github.com/Shubham-Aggarwal-1306",
  linkedin: "https://www.linkedin.com/in/shubhamaggarwaltech",
  /** Served from public/. Update BOTH this path and the file if it is renamed. */
  resume: "/Shubham_Aggarwal_Resume.pdf",
} as const;
