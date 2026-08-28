import type { Metadata, Viewport } from "next";
import { SITE_URL, PERSON } from "@/lib/site";
import { KNOWS_ABOUT } from "@/lib/content";
import "./globals.css";

const TITLE = `${PERSON.name} — ${PERSON.title}`;
const DESCRIPTION =
  "Shubham Aggarwal is a backend-focused full-stack engineer in Delhi, India, building production platforms across iGaming, fintech, healthcare, EV infrastructure and e-commerce with Node.js, React and AWS.";
const SHORT =
  "Backend-focused full-stack engineer in Delhi, India. Backend lead on a live platform serving 20,000+ users.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: PERSON.name }],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
  openGraph: {
    type: "profile",
    siteName: PERSON.name,
    title: TITLE,
    description: SHORT,
    url: "/",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SHORT,
    images: ["/og.png"],
  },
  icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: PERSON.name,
  jobTitle: PERSON.title,
  email: `mailto:${PERSON.email}`,
  url: `${SITE_URL}/`,
  image: `${SITE_URL}/og.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Delhi",
    addressCountry: "IN",
  },
  worksFor: {
    "@type": "Organization",
    name: "Daffodil Unthinkable Software Corporation",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Kurukshetra University",
  },
  knowsAbout: KNOWS_ABOUT,
  sameAs: [PERSON.github, PERSON.linkedin],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
