import { Github, HeartPulse, Linkedin, Twitter } from "lucide-react";

const Footer = ({ footerLinks }: { footerLinks: Record<string, string[]> }) => {
  return (
    <footer
      style={{
        background: "#e0f0f1",
        borderTop: "1px solid rgba(13,115,119,0.12)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top row */}
        <div className="grid md:grid-cols-5 gap-10 mb-16">
          {/* Brand col */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #0d7377, #0a3d40)",
                }}
              >
                <HeartPulse className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-[15px] font-bold"
                style={{ color: "#0a2e30" }}
              >
                MediCall <span style={{ color: "#0d7377" }}>AI</span>
              </span>
            </div>
            <p
              className="text-[13px] leading-relaxed mb-6 max-w-xs"
              style={{ color: "#1e5457" }}
            >
              AI voice receptionist platform built for healthcare practices.
              Never miss a call, never miss a booking.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                  style={{
                    background: "rgba(13,115,119,0.08)",
                    border: "1px solid rgba(13,115,119,0.15)",
                    color: "#5a9098",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#0d7377";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#5a9098";
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <div
                className="text-[11px] font-bold uppercase tracking-widest mb-4"
                style={{ color: "#5a9098" }}
              >
                {group}
              </div>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] transition-colors"
                      style={{ color: "#1e5457" }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "#0d7377";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          "#1e5457";
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: "1px solid rgba(13,115,119,0.12)" }}
        >
          <p className="text-[12px]" style={{ color: "#5a9098" }}>
            © 2026 MediCall AI. All rights reserved.
          </p>
          <div
            className="flex items-center gap-2 text-[12px]"
            style={{ color: "#5a9098" }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#14a8b5" }}
            />
            All systems operational
          </div>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="text-[12px] transition-colors"
                  style={{ color: "#5a9098" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#0d7377";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.color = "#5a9098";
                  }}
                >
                  {item}
                </a>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
