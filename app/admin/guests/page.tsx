"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Home } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/providers/ThemeContext';
import { BulkImportForm } from '@/components/BulkImportForm';
import { SingleGuestForm } from '@/components/SingleGuestForm';
import { Guest } from '@/data/guestList';

export default function GuestManagementPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [addedGuests, setAddedGuests] = useState<Guest[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { goldPrimary, goldDark, goldLight, goldLightest, goldMedium } = currentTheme.cssVars;

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

  const shimmerStyle = useMemo(
    (): React.CSSProperties => ({
      backgroundImage: `linear-gradient(90deg, ${goldDark}, ${goldLight}, ${goldLightest}, ${goldMedium}, ${goldDark})`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    }),
    [goldDark, goldLight, goldLightest, goldMedium]
  );

  const handleGuestAdded = (guest: Guest) => {
    setAddedGuests(prev => [...prev, guest]);
  };

  const handleImportComplete = (count: number) => {
    console.log(`Imported ${count} guests`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div
      className="min-h-screen font-khmer relative overflow-hidden"
      style={{ background: currentTheme.gradient }}
    >
      {/* Decorative Elements */}
      <motion.div
        className="fixed top-20 left-20 w-64 h-64 rounded-full blur-3xl opacity-10"
        style={{ background: goldPrimary }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
        aria-hidden="true"
      />
      <motion.div
        className="fixed bottom-20 right-20 w-80 h-80 rounded-full blur-3xl opacity-10"
        style={{ background: goldPrimary }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 15, repeat: Infinity }}
        aria-hidden="true"
      />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="backdrop-blur-md bg-black/20 border-b border-white/10 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <motion.h1 variants={fadeInUp} custom={0} className="text-3xl font-bold text-white" style={shimmerStyle}>
              ការគ្រប់គ្រងបញ្ជីភ្ញៀវ
            </motion.h1>
            <motion.p variants={fadeInUp} custom={1} className="text-white/60 text-sm mt-1 tracking-widest">
              ផ្ទាំងគ្រប់គ្រង
            </motion.p>
          </div>
          <motion.div variants={fadeInUp} custom={2} className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/80 hover:text-white transition-all backdrop-blur border border-white/10 hover:border-white/30"
            >
              <Home size={18} />
              <span className="text-sm">ដើម</span>
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur border relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${goldLight}40, ${goldMedium}40)`,
                borderColor: `${goldLight}60`,
              }}
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <LogOut size={18} className="relative z-10" />
              <span className="text-sm relative z-10">
                {isLoggingOut ? 'ចេញ...' : 'ចេញ'}
              </span>
            </button>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {[
            { label: 'ភ្ញៀវសរុប', count: '0', icon: '👥' },
            { label: 'បានអះអាង', count: '0', icon: '✓' },
            { label: 'រង់ចាំ', count: '0', icon: '⏳' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeInUp}
              custom={i}
              className="backdrop-blur bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-sm tracking-widest">{stat.label}</p>
                  <p className="text-4xl font-bold mt-2 text-white">{stat.count}</p>
                </div>
                <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          variants={fadeInUp}
          custom={3}
          className="backdrop-blur bg-black/20 border border-white/10 rounded-2xl overflow-hidden mb-8"
        >
          <div className="flex border-b border-white/10">
            {[
              { id: 'single', label: 'បន្ថែមភ្ញៀវ', icon: '➕' },
              { id: 'bulk', label: 'នាំចូលច្រើន', icon: '📤' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'single' | 'bulk')}
                className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative text-white ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/70'
                }`}
                style={
                  activeTab === tab.id
                    ? {
                        background: `linear-gradient(135deg, ${goldPrimary}20, ${goldLight}20)`,
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
                    style={{ background: `linear-gradient(90deg, ${goldLight}, ${goldMedium})` }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forms */}
          <motion.div variants={fadeInUp} custom={4} className="lg:col-span-2 space-y-8">
            {activeTab === 'single' && <SingleGuestForm onGuestAdded={handleGuestAdded} />}
            {activeTab === 'bulk' && <BulkImportForm onImportComplete={handleImportComplete} />}
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={fadeInUp} custom={5} className="space-y-6">
            {/* Quick Guide */}
            <div
              className="backdrop-blur bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                <span>មគ្គុទ្ឋ</span>
              </h3>
              <div className="space-y-4 text-sm text-white/80">
                <div>
                  <p className="font-semibold text-white mb-1">បន្ថែមភ្ញៀវម្នាក់</p>
                  <p className="text-xs">សម្ពូណ៌ចម្លងហើយបន្ថែមភ្ញៀវម្នាក់ៗ</p>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="font-semibold text-white mb-1">នាំចូលច្រើន</p>
                  <p className="text-xs">ផ្ទុកឯកសារ CSV ដែលមានភ្ញៀវច្រើន</p>
                </div>
              </div>
            </div>

            {/* CSV Template */}
            <div
              className="backdrop-blur bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              style={{
                borderColor: `${goldLight}40`,
                background: `linear-gradient(135deg, ${goldPrimary}10, ${goldLight}5)`,
              }}
            >
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-xl">📥</span>
                <span>ប្រភេទ CSV</span>
              </h3>
              <code className="text-xs bg-black/40 p-3 rounded-xl block overflow-x-auto text-white/80 font-mono">
                {`khmerName,englishName
ចាន់ ធីដា,Chan Thida`}
              </code>
              <p className="text-xs text-white/60 mt-3">
                ដាក់ឯកសារ CSV ដែលមានឈ្មោះធីដានិងព័ត៌មានលម្អិតរបស់ភ្ញៀវ
              </p>
            </div>

            {/* Recently Added */}
            {addedGuests.length > 0 && (
              <div
                className="backdrop-blur bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all"
              >
                <h3 className="font-bold text-white mb-4">
                  បានបន្ថែមថ្មីៗ ({addedGuests.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {addedGuests.map((guest, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-white truncate">
                          {guest.khmerName}
                        </p>
                        <p className="text-xs text-white/60 truncate">
                          {guest.englishName}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-1 rounded-lg whitespace-nowrap text-white font-semibold"
                        style={{
                          background: `${goldLight}30`,
                          color: goldLight,
                          border: `1px solid ${goldLight}60`,
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
      </main>
    </div>
  );
}
