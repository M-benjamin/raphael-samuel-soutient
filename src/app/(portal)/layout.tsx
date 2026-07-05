import type { ReactNode } from "react";

export const metadata = {
  title: "Patient Portal — MediCall AI",
  description:
    "Manage your appointments, access health records, and contact support.",
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0f9ff 0%, #f2f8f9 50%, #e8f5f5 100%)",
      }}
    >
      {children}
    </div>
  );
}
