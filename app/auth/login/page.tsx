"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/providers/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { primary, dark, light, lightest, medium } = currentTheme.cssVars;

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
  };

  const shimmerStyle = useMemo(
    (): React.CSSProperties => ({
      backgroundImage: `linear-gradient(90deg, ${dark}, ${light}, ${lightest}, ${medium}, ${dark})`,
      backgroundSize: '200% auto',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    }),
    [dark, light, lightest, medium]
  );

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (response.ok) {
        router.push('/admin/guests');
      } else {
        const data = await response.json().catch(() => null);
        setError(data?.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-khmer"
    >

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0}
          className="backdrop-blur-md bg-black/10 border border-white/20 rounded-3xl p-8 space-y-6"
        >
          <motion.div variants={fadeInUp} custom={1} className="text-center space-y-3">
            <h1 className="text-4xl font-bold" style={shimmerStyle}>
              ចុតហ្មាយ
            </h1>
            <p className="text-white/80 text-sm tracking-widest">
              ការគ្រប់គ្រងបញ្ជីភ្ញៀវ
            </p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/50 rounded-xl p-3"
            >
              <p className="text-red-200 text-sm font-mono">{error}</p>
            </motion.div>
          )}

          <motion.div variants={fadeInUp} custom={2} className="space-y-3">
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full font-mono rounded-xl border border-white/20 bg-black/20 pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full font-mono rounded-xl border border-white/20 bg-black/20 pl-10 pr-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} custom={3} className="relative">
            <div className="absolute inset-0 flex items-center">
              <div style={{ borderTopColor: `${primary}40`, borderWidth: '1px' }} className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-white/60 text-xs" style={{ background: `${currentTheme.gradient}` }}>
               
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} custom={4} className="space-y-3">
            <p className="text-white/70 text-xs text-center tracking-wider">
              ចូលប្រើប្រព័ន្ធគ្រប់គ្រង
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden rounded-xl px-6 py-3 font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                background: `linear-gradient(135deg, ${light}, ${medium})`,
              }}
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="relative z-10">
                {isLoading ? 'ចូលប្រើប្រាស់...' : 'ចូលប្រព័ន្ធ'}
              </span>
            </button>
          </motion.div>

          <motion.div variants={fadeInUp} custom={5} className="text-center text-xs text-white/60 space-y-2 border-t border-white/10 pt-4">
            <p>ដោយការចូលប្រើប្រាស់ លោកអ្នកយល់ព្រម ក្នុងការគ្រប់គ្រងបញ្ជីភ្ញៀវ</p>
            <Link
              href="/"
              className="inline-block text-white/80 hover:text-white transition-colors"
              style={{ color: light }}
            >
              ← ត្រលប់ទៅដើម
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
