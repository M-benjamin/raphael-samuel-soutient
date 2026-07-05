import { ArrowRight, HeartPulse } from "lucide-react";
import Link from "next/link";

type NavLinkProps = { label: string; href: string };

const Navbar = ({ navLinks }: { navLinks: NavLinkProps[] }) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{
        background: "rgba(5,28,30,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(20,168,181,0.12)",
        boxShadow: "0 1px 16px rgba(0,0,0,0.25)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #14a8b5, #0d7377)",
              boxShadow: "0 0 16px rgba(20,168,181,0.40)",
            }}
          >
            <HeartPulse className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            MediCall <span style={{ color: "#22c4d0" }}>AI</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-150"
              style={{ color: "rgba(255,255,255,0.60)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#22c4d0";
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(20,168,181,0.10)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color =
                  "rgba(255,255,255,0.60)";
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/portal/login"
            className="px-4 py-2 text-[13px] font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Sign in
          </Link>
          <Link
            href="/portal/register"
            className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-xl text-white transition-all duration-150 hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #14a8b5, #0d7377)",
              boxShadow: "0 1px 8px rgba(20,168,181,0.35)",
            }}
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
