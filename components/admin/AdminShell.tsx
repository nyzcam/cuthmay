"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ExternalLink, LogOut, Menu, X } from "lucide-react";

export const ADMIN_COLORS = {
  bg: "#0a0f1a",
  bgSoft: "#111827",
  bgCard: "#0f172a",
  border: "#334155",
  accent: "#22d3ee",
  accentSoft: "#06b6d4",
};

export interface AdminNavItem<T extends string = string> {
  id: T;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface AdminShellProps<T extends string = string> {
  activeNav: T;
  navItems: AdminNavItem<T>[];
  onSelectNav: (id: T) => void;
  onLogout: () => void | Promise<void>;
  isLoggingOut?: boolean;
  inviteHref?: string;
  headerTitle?: string;
  children: React.ReactNode;
}

export default function AdminShell<T extends string = string>({
  activeNav,
  navItems,
  onSelectNav,
  onLogout,
  isLoggingOut = false,
  inviteHref = "/invite/seth-kompheakmony",
  headerTitle,
  children,
}: AdminShellProps<T>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [todayText, setTodayText] = useState("");

  useEffect(() => {
    setTodayText(new Date().toLocaleDateString("km-KH", { dateStyle: "medium" }));
  }, []);

  const currentLabel = useMemo(() => {
    if (headerTitle) {
      return headerTitle;
    }
    return navItems.find((item) => item.id === activeNav)?.label ?? "Admin";
  }, [activeNav, headerTitle, navItems]);

  const Sidebar = () => (
    <aside
      className="flex flex-col h-full"
      style={{
        background: `linear-gradient(180deg, ${ADMIN_COLORS.bgSoft} 0%, ${ADMIN_COLORS.bg} 100%)`,
      }}
    >
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div>
          <p className="text-white font-bold text-base tracking-wide">ផ្ទាំងគ្រប់គ្រង</p>
          <p className="text-white/40 text-xs mt-0.5">Wedding Admin</p>
        </div>
        <button
          className="lg:hidden text-white/50 hover:text-white"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectNav(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm text-left ${
                isActive ? "text-white" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${ADMIN_COLORS.accent}33, ${ADMIN_COLORS.accentSoft}22)`,
                      borderLeft: `3px solid ${ADMIN_COLORS.accent}`,
                    }
                  : {}
              }
            >
              <span className={isActive ? "opacity-100" : "opacity-60"}>{item.icon}</span>
              <span className="flex-1 font-khmer">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-mono"
                  style={{
                    background: `${ADMIN_COLORS.accent}30`,
                    color: ADMIN_COLORS.accent,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-4 pb-5 space-y-2">
        <Link
          href={inviteHref}
          target="_blank"
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-white/50 hover:text-white/80 hover:bg-white/5 transition-all text-sm"
        >
          <Home size={16} />
          <span className="font-khmer">មើលការអញ្ជើញ</span>
          <ExternalLink size={13} className="ml-auto opacity-50" />
        </Link>
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm disabled:opacity-50 group"
          style={{ color: `${ADMIN_COLORS.accent}cc` }}
        >
          <LogOut size={16} />
          <span className="font-khmer">{isLoggingOut ? "ចេញ..." : "ចេញពីប្រព័ន្ធ"}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen w-full flex font-khmer overflow-hidden">
      <div
        className="hidden lg:flex flex-col w-64 flex-shrink-0 h-screen sticky top-0 border-r border-white/10"
        style={{
          background: `linear-gradient(180deg, ${ADMIN_COLORS.bgSoft} 0%, ${ADMIN_COLORS.bg} 100%)`,
        }}
      >
        <Sidebar />
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-64 lg:hidden border-r border-white/10"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex h-screen min-h-0 flex-col overflow-hidden">
        <header
          className="sticky top-0 z-30 border-b border-white/10 backdrop-blur-xl px-6 py-4 flex items-center gap-4"
          style={{ background: `${ADMIN_COLORS.bgCard}dd` }}
        >
          <button
            className="lg:hidden text-white/60 hover:text-white p-1"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="flex-1">
            <h1 className="text-white/90 font-bold text-lg leading-none">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/30 text-xs hidden sm:block">{todayText}</span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${ADMIN_COLORS.accentSoft}, ${ADMIN_COLORS.accent})`,
              }}
            >
              A
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 p-6 lg:p-8 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
