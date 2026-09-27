import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krish Kanda · Ideas into impact",
  description:
    "Software engineer in Vancouver, WA. Explore my work in AI, cloud systems, and full stack development through an interactive 3D portfolio.",
  openGraph: {
    title: "Krish Kanda · Ideas into impact",
    description:
      "From a first idea to software that makes a difference. AI, cloud systems, and full stack engineering.",
    type: "website",
  },
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/icon.svg` },
};

export const viewport: Viewport = { themeColor: "#f1f0eb" };

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
