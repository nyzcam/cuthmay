"use client";

import React, { useState, useMemo } from 'react';
import { Upload, X } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/providers/ThemeContext';

interface BulkImportProps {
  onImportComplete: (count: number) => void;
}

export function BulkImportForm({ onImportComplete }: BulkImportProps) {
  const { currentTheme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { goldPrimary, goldDark, goldLight, goldLightest, goldMedium } = currentTheme.cssVars;

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

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
      },
    }),
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setMessage(null);
      } else {
        setMessage({ type: 'error', text: 'សូមផ្ទុកឯកសារ CSV' });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleImport = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'សូមជ្រើសរើសឯកសារ' });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/guests/import', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message });
        onImportComplete(data.guests?.length || 0);
        setFile(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'នាំចូលបរាជ័យ' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'នាំចូលបរាជ័យ',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur bg-white/10 border border-white/20 rounded-2xl overflow-hidden"
    >
      <div
        className="px-6 py-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${goldPrimary}20, ${goldLight}20)`,
          borderBottom: `1px solid ${goldPrimary}40`,
        }}
      >
        <Upload size={24} style={{ color: goldLight }} />
        <h2 className="text-lg text-gold">នាំចូលភ្ញៀវច្រើន</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* File Upload Area */}
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          variants={fadeInUp}
          custom={0}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group ${
            dragActive
              ? 'border-opacity-100 bg-white/20'
              : file
              ? `border-opacity-60 bg-green-500/10`
              : 'border-opacity-40 hover:border-opacity-60 hover:bg-white/5'
          }`}
          style={{
            borderColor: dragActive ? goldLight : file ? '#10b981' : goldPrimary,
          }}
        >
          {file ? (
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="space-y-3">
              <div className="text-4xl">✓</div>
              <p className="font-semibold text-white">{file.name}</p>
              <p className="text-sm text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-red-300 hover:text-red-200 underline transition"
              >
                ផ្លាស់ប្តូរឯកសារ
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <Upload size={40} className="mx-auto" style={{ color: goldLight }} />
              </motion.div>
              <div>
                <p className="font-semibold text-gold">
                  ទម្លាក់ឯកសារ CSV របស់អ្នក
                </p>
                <p className="text-sm text-gray/60 mt-1">ឬចុចដើម្បីជ្រើសរើស</p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block px-6 py-2 rounded-xl cursor-pointer text-white transition-all relative overflow-hidden group"
                style={{
                  background: `linear-gradient(135deg, ${goldLight}, ${goldMedium})`,
                }}
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                <span className="relative z-10">ជ្រើសរើសឯកសារ</span>
              </label>
            </div>
          )}
        </motion.div>

        {/* Info Box */}
        <motion.div
          variants={fadeInUp}
          custom={1}
          className="p-4 rounded-xl flex items-start gap-3"
          style={{
            background: `${goldLight}15`,
            border: `1px solid ${goldLight}40`,
          }}
        >
          <span className="text-lg mt-0.5">ℹ️</span>
          <p className="text-sm text-gold">
            <strong>ការងារ CSV:</strong> ឯកសារ​របស់​អ្នក​គួរតែ​មាន​ជួរ​ដូច​ជា​៖ khmerName, englishName, title, relationship, status
          </p>
        </motion.div>

        {/* Message */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-3 rounded-xl flex items-start gap-3 ${
              message.type === 'success'
                ? `bg-green-500/20 text-green-200 border border-green-400/50`
                : `bg-red-500/20 text-red-200 border border-red-400/50`
            }`}
          >
            <span className="text-lg">{message.type === 'success' ? '✓' : '✕'}</span>
            <p className="text-sm">{message.text}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div variants={fadeInUp} custom={2} className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={!file || isLoading}
            className="flex-1 relative overflow-hidden rounded-xl px-6 py-3 text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{
              background: `linear-gradient(135deg, ${goldLight}, ${goldMedium})`,
            }}
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left disabled:hidden" />
            <span className="relative z-10">
              {isLoading ? 'កំពុងនាំចូល...' : 'នាំចូលភ្ញៀវ'}
            </span>
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
