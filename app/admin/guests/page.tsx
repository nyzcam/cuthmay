"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Home, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTheme } from "@/providers/ThemeContext";
import { BulkImportForm } from "@/components/BulkImportForm";
import { SingleGuestForm } from "@/components/SingleGuestForm";
import { Guest } from "@/data/guestList";

const MAX_RECENT_GUESTS = 100;

export default function GuestManagementPage() {
  const router = useRouter();
  const {
    currentTheme,
    currentThemeName,
    cycleNextTheme,
    cyclePreviousTheme,
    themeLoading,
  } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"single" | "bulk">("single");
  const [addedGuests, setAddedGuests] = useState<Guest[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { primary, dark, light, lightest, medium } = currentTheme.cssVars;

  const ThemeDropdown: React.FC = () => {
    return (
      <div className="relative">
        <button
          type="button"
          aria-label="Current theme"
          disabled={themeLoading}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-sm text-white/90 bg-transparent hover:bg-white/5 transition"
        >
          <span className="truncate max-w-[10rem]">{currentThemeName}</span>
        </button>
      </div>
    );
  };

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const handleGuestAdded = useCallback((guest: Guest) => {
    setAddedGuests((prev) => {
      const next = [...prev, guest];
      return next.length > MAX_RECENT_GUESTS
        ? next.slice(next.length - MAX_RECENT_GUESTS)
        : next;
    });
  }, []);

  const handleImportComplete = useCallback((count: number) => {
    console.log(`Imported ${count} guests`);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  const stats = useMemo(
    () => [
      { label: "ភ្ញៀវសរុប", count: addedGuests.length.toString(), icon: "👥" },
      { label: "បានអះអាង", count: "0", icon: "✓" },
      { label: "រង់ចាំ", count: addedGuests.length.toString(), icon: "⏳" },
    ],
    [addedGuests.length]
  );

  return (
    <div className="min-h-screen w-full overflow-hidden relative flex items-center justify-center p-12 font-khmer">
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6 }}
          className="backdrop-blur-md bg-black/20 border border-white/20 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1
                variants={fadeInUp}
                custom={0}
                className="text-2xl text-white/80"
              >
                ការគ្រប់គ្រងបញ្ជីភ្ញៀវ
              </motion.h1>
              <motion.p
                variants={fadeInUp}
                custom={1}
                className="text-white/60 text-sm mt-2 tracking-widest"
              >
                ផ្ទាំងគ្រប់គ្រង
              </motion.p>
            </div>
            <motion.div
              variants={fadeInUp}
              custom={2}
              className="flex items-center gap-4"
            >
              <Link
                href="/invite/seth-kompheakmony"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/80 hover:text-white transition-all backdrop-blur border border-white/10 hover:border-white/30 hover:bg-white/10"
              >
                <Home size={18} />
                <span className="text-sm">ដើម</span>
              </Link>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/80 bg-white/5 border border-white/5">
                <button
                  onClick={() => cyclePreviousTheme()}
                  disabled={themeLoading}
                  aria-label="Previous theme"
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>

                <ThemeDropdown />

                <button
                  onClick={() => cycleNextTheme()}
                  disabled={themeLoading}
                  aria-label="Next theme"
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur border relative overflow-hidden text-white/80 hover:text-whit group"
                style={{
                  background: `linear-gradient(135deg, ${light}40, ${medium}40)`,
                  borderColor: `${light}60`,
                }}
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <LogOut size={18} className="relative z-10" />
                <span className="relative z-10">
                  {isLoggingOut ? "ចេញ..." : "ចេញ"}
                </span>
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            shouldReduceMotion ? { duration: 0 } : { delay: 0.2 }
          }
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              custom={i}
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group hover:border-white/30"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-af text-sm tracking-widest">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold mt-2 text-af">
                    {stat.count}
                  </p>
                </div>
                <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Tabs and Forms */}
          <motion.div
            variants={fadeInUp}
            custom={3}
            className="lg:col-span-2 space-y-8"
          >
            {/* Tabs Card */}
            <div className="backdrop-blur-md bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex border-b border-white/10" role="tablist" aria-label="Guest management sections">
                {[
                  { id: "single", label: "បន្ថែមភ្ញៀវ", icon: "➕" },
                  { id: "bulk", label: "នាំចូលច្រើន", icon: "📤" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as "single" | "bulk")}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    id={`tab-${tab.id}`}
                    className={`flex-1 px-6 py-4 transition-all duration-300 flex items-center justify-center gap-2 relative ${
                      activeTab === tab.id
                        ? "text-white"
                        : "text-white hover:text-white/80"
                    }`}
                    style={
                      activeTab === tab.id
                        ? {
                            background: `linear-gradient(135deg, ${primary}20, ${light}20)`,
                          }
                        : {}
                    }
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="tabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, ${light}, ${medium})`,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Forms */}
            <div
              role="tabpanel"
              id={`panel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {activeTab === "single" && (
                <SingleGuestForm onGuestAdded={handleGuestAdded} />
              )}
              {activeTab === "bulk" && (
                <BulkImportForm onImportComplete={handleImportComplete} />
              )}
            </div>
          </motion.div>

          {/* Right: Sidebar Cards */}
          <motion.div variants={fadeInUp} custom={4} className="space-y-6">
            {/* Quick Guide */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:border-white/30">
              <h3 className="font-bold text-af mb-4 flex items-center gap-2 text-lg">
                <span className="text-xl">📋</span>
                <span>មគ្គុទ្ឋ</span>
              </h3>
              <div className="space-y-4 text-sm text-af">
                <div>
                  <p className="text-af mb-1">បន្ថែមភ្ញៀវម្នាក់</p>
                  <p className="text-xs">សម្ពូណ៌ចម្លងហើយបន្ថែមភ្ញៀវម្នាក់ៗ</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-af mb-1">នាំចូលច្រើន</p>
                  <p className="text-xs">ផ្ទុកឯកសារ CSV ដែលមានភ្ញៀវច្រើន</p>
                </div>
              </div>
            </div>

            {/* CSV Template */}
            <div
              className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:border-white/30"
              style={{
                borderColor: `${light}40`,
                background: `linear-gradient(135deg, ${primary}10, ${light}5)`,
              }}
            >
              <h3 className="font-bold text-af mb-4 flex items-center gap-2 text-lg">
                <span className="text-xl">📥</span>
                <span>ប្រភេទ CSV</span>
              </h3>
              <code className="text-xs bg-black/40 p-3 rounded-xl block overflow-x-auto text-af border border-white/10">
                {`khmerName,englishName
ចាន់ ធីដា,Chan Thida`}
              </code>
              <p className="text-xs text-af mt-3">
                ដាក់ឯកសារ CSV ដែលមានឈ្មោះធីដានិងព័ត៌មានលម្អិតរបស់ភ្ញៀវ
              </p>
            </div>

            {/* Recently Added */}
            {addedGuests.length > 0 && (
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:border-white/30">
                <h3 className="font-bold text-af mb-4 text-lg">
                  បានបន្ថែមថ្មីៗ ({addedGuests.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {addedGuests.map((guest, idx) => (
                    <motion.div
                      key={`${guest.khmerName}-${guest.englishName ?? "na"}-${idx}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-af truncate">
                          {guest.khmerName}
                        </p>
                        <p className="text-xs text-af truncate">
                          {guest.englishName}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-lg whitespace-nowrap text-af"
                        style={{
                          background: `${light}30`,
                          color: light,
                          border: `1px solid ${light}60`,
                        }}
                      >
                        ✓ បាន
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
