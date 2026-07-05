import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Raphael samuel Soutien | Therapist",
    template: "Therapist",
  },
  description:
    "Therapist website for Raphael Samuel Soutien, a licensed therapist providing counseling and support services.",
  keywords: [
    "AI receptionist",
    "healthcare",
    "medical practice",
    "voice AI",
    "appointment booking",
    "clinic",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
