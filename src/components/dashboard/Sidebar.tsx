"use client";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { getUnreadCount } from "@/services/notifications";
import { useBusinessStore } from "@/store/business";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  ClipboardList,
  Headphones,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navGroups = [
  {
    label: "Clinical",
    items: [
      {
        href: "/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      // {
      //   href: "/dashboard/conversations",
      //   label: "Call Log",
      //   icon: MessageSquare,
      // },
      {
        href: "/dashboard/appointments",
        label: "Appointments",
        icon: Calendar,
      },
      {
        href: "/dashboard/appointments/schedule",
        label: "Schedule",
        icon: CalendarDays,
      },
      { href: "/dashboard/patients", label: "Patients", icon: Users },
      { href: "/dashboard/support", label: "Support", icon: Headphones },
    ],
  },
  {
    label: "Setup",
    items: [
      // { href: '/dashboard/agents',   label: 'AI Agents',  icon: Bot },
      { href: "/dashboard/services", label: "Services", icon: ClipboardList },
      // { href: '/dashboard/faqs',     label: 'Knowledge',  icon: HelpCircle },
      // { href: '/dashboard/widget',   label: 'Widget',     icon: Code2 },
      // { href: '/dashboard/website',  label: 'Website',    icon: Globe },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { business } = useBusinessStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!business) return;
    getUnreadCount(business.id)
      .then(setUnreadCount)
      .catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount(business.id)
        .then(setUnreadCount)
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [business]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-30 flex flex-col transition-transform duration-300 select-none w-[230px]",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background:
            "linear-gradient(180deg, #072b2e 0%, #0a3d40 35%, #0d5257 70%, #0d6b70 100%)",
          borderRight: "1px solid rgba(20,168,181,0.15)",
          boxShadow: "4px 0 24px rgba(10,61,64,0.25)",
        }}
      >
        {/* ECG decorative line at top */}
        <div className="absolute top-0 left-0 right-0 h-10 ecg-line opacity-40 pointer-events-none" />

        {/* Logo */}
        <div
          className="relative z-10 flex items-center gap-3 h-16 px-5"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex-shrink-0 relative">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.20)",
              }}
            >
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
              style={{ borderColor: "#072b2e" }}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight text-white">
              Medi<span style={{ color: "#22c4d0" }}>Call</span>
            </span>
            <span
              className="text-[10px] font-medium mt-0.5"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              AI Voice Platform
            </span>
          </div>
        </div>

        {/* Practice badge */}
        {business && (
          <div
            className="relative z-10 px-4 py-3"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{
                  background: "rgba(34,196,208,0.30)",
                  border: "1px solid rgba(34,196,208,0.40)",
                }}
              >
                {business.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-white truncate leading-tight">
                  {business.name}
                </div>
                <div
                  className="text-[10px] truncate mt-0.5"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {business.city || "Healthcare Practice"}
                </div>
              </div>
              <Activity
                className="w-3.5 h-3.5 flex-shrink-0 animate-heartbeat"
                style={{ color: "#22c4d0" }}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="px-2 mb-2">
                <span className="section-label">{group.label}</span>
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150 group",
                        active ? "text-white font-semibold" : "font-medium",
                      )}
                      style={{
                        color: active ? undefined : "rgba(255,255,255,0.50)",
                      }}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active-bg"
                          className="absolute inset-0 rounded-xl"
                          style={{
                            background: "rgba(255,255,255,0.13)",
                            border: "1px solid rgba(255,255,255,0.18)",
                            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}
                        />
                      )}
                      {active && (
                        <div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                          style={{ background: "#22c4d0" }}
                        />
                      )}
                      <item.icon
                        className={cn(
                          "w-[15px] h-[15px] flex-shrink-0 relative z-10 transition-colors",
                          active ? "text-[#22c4d0]" : "group-hover:text-white",
                        )}
                        style={{
                          color: active ? undefined : "rgba(255,255,255,0.40)",
                        }}
                      />
                      <span className="text-[13px] relative z-10 flex-1">
                        {item.label}
                      </span>
                      {item.href === "/dashboard/notifications" &&
                        unreadCount > 0 && (
                          <span
                            className="relative z-10 flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{
                              background:
                                "linear-gradient(135deg, #14a8b5, #0d7377)",
                            }}
                          >
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div
          className="relative z-10 px-3 py-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        >
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] font-medium rounded-xl transition-all duration-100"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.12)";
              (e.currentTarget as HTMLElement).style.color = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.45)";
            }}
          >
            <LogOut className="w-[15px] h-[15px] flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
