"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Github, Mail } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/providers/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { currentTheme } = useTheme();
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

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      window.location.href = `/api/auth/google?code=mock`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      window.location.href = `/api/auth/github?code=mock`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/demo', { method: 'POST' });
      if (response.ok) {
        router.push('/admin/guests');
      } else {
        setError('Demo login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed');
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-khmer"
    >

      <div className="w-full max-w-md relative z-10">
        {/* Main Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          custom={0}
          className="backdrop-blur-md bg-black/10 border border-white/20 rounded-3xl p-8 space-y-6"
        >
          {/* Header */}
          <motion.div variants={fadeInUp} custom={1} className="text-center space-y-3">
            <h1 className="text-4xl font-bold" style={shimmerStyle}>
              ពិធីរៀបរាប់ាប់
            </h1>
            <p className="text-white/80 text-sm tracking-widest">
              ការគ្រប់គ្រងបញ្ជីភ្ញៀវ
            </p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/50 rounded-xl p-3"
            >
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Login Options */}
          <motion.div variants={fadeInUp} custom={2} className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 group relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${primary}40, ${light}40)`,
                border: `1px solid ${primary}60`,
              }}
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <Mail size={20} style={{ color: light }} className="relative z-10" />
              <span className="relative z-10">
                {isLoading ? 'ចូលប្រើប្រាស់...' : 'Google ដើម្បីចូល'}
              </span>
            </button>

            <button
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 group relative overflow-hidden rounded-xl px-6 py-3 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${primary}30, ${medium}30)`,
                border: `1px solid ${primary}50`,
              }}
            >
              <div className="absolute inset-0 bg-white/10 transform -skew-x-12 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <Github size={20} style={{ color: light }} className="relative z-10" />
              <span className="relative z-10">
                {isLoading ? 'ចូលប្រើប្រាស់...' : 'GitHub ដើម្បីចូល'}
              </span>
            </button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeInUp} custom={3} className="relative">
            <div className="absolute inset-0 flex items-center">
              <div style={{ borderTopColor: `${primary}40`, borderWidth: '1px' }} className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 text-white/60 text-xs" style={{ background: `${currentTheme.gradient}` }}>
               
              </span>
            </div>
          </motion.div>

          {/* Demo Login */}
          <motion.div variants={fadeInUp} custom={4} className="space-y-3">
            <p className="text-white/70 text-xs text-center tracking-wider">
              ការសាកល្បង
            </p>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full relative overflow-hidden rounded-xl px-6 py-3 font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                background: `linear-gradient(135deg, ${light}, ${medium})`,
              }}
            >
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              <span className="relative z-10">
                {isLoading ? 'ចូលប្រើប្រាស់...' : 'ដំណើរការជាអ្នកប្រើប្រាស់ឌីមូ'}
              </span>
            </button>
          </motion.div>

          {/* Footer */}
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

        {/* Features Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-6 space-y-4"
        >
          <h3 className="font-bold text-white text-sm tracking-widest">
            វិសេษលក្ខណៈ
          </h3>
          <ul className="space-y-2 text-sm">
            {[
              'បន្ថែមភ្ញៀវម្នាក់ៗ',
              'នាំចូលជាច្រើននាក់ដោយ CSV',
              'គ្រប់គ្រងព័ត៌មានលម្អិត',
              'តាមដានម្តងទៀតនិងការឆ្លើយតប',
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-white/80">
                <span style={{ color: light }} className="text-lg">
                  ✓
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
