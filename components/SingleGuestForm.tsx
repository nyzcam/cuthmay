"use client";

import React, { useState, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/providers/ThemeContext';
import { Guest } from '@/data/guestList';

interface SingleGuestFormProps {
  onGuestAdded: (guest: Guest) => void;
}

export function SingleGuestForm({ onGuestAdded }: SingleGuestFormProps) {
  const { currentTheme } = useTheme();
  const [formData, setFormData] = useState({
    khmerName: '',
    englishName: '',
    title: '',
    relationship: 'guest' as const,
    status: 'pending' as const,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { primary, light, medium } = currentTheme.cssVars;

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

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.khmerName.trim()) {
      setMessage({ type: 'error', text: 'ឈ្មោះខ្មែរគឺត្រូវគ្នា' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/guests/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guests: [
            {
              khmerName: formData.khmerName,
              englishName: formData.englishName || undefined,
              title: formData.title || undefined,
              relationship: formData.relationship,
              status: formData.status,
            },
          ],
          type: 'single',
        }),
      });

      const data = await response.json();

      if (response.ok || response.status === 206) {
        setMessage({ type: 'success', text: data.message });
        
        // Create a proper guest object with only defined fields
        const newGuest: Guest = {
          khmerName: formData.khmerName,
          ...(formData.englishName && { englishName: formData.englishName }),
          ...(formData.title && { title: formData.title }),
          ...(formData.relationship && { relationship: formData.relationship }),
          ...(formData.status && { status: formData.status }),
        };
        
        onGuestAdded(newGuest);

        setFormData({
          khmerName: '',
          englishName: '',
          title: '',
          relationship: 'guest',
          status: 'pending',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'ការបន្ថែមភ្ញៀវបរាជ័យ' });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'ការបន្ថែមភ្ញៀវបរាជ័យ',
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
          background: `linear-gradient(135deg, ${primary}20, ${light}20)`,
          borderBottom: `1px solid ${primary}40`,
        }}
      >
        <UserPlus size={24} style={{ color: light }} />
        <h2 className="text-lg text-gray">បន្ថែមភ្ញៀវម្នាក់</h2>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {/* Khmer Name */}
        <motion.div variants={fadeInUp} custom={0}>
          <label className="block text-sm text-af mb-2">
            ឈ្មោះខ្មែរ *
          </label>
          <input
            type="text"
            name="khmerName"
            value={formData.khmerName}
            onChange={handleChange}
            placeholder="ឈ្មោះ​ខ្មែរ"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white placeholder-white/50"
            required
            autoComplete="off"
          />
        </motion.div>

        {/* English Name */}
        <motion.div variants={fadeInUp} custom={1}>
          <label className="block text-sm text-af mb-2">
            ឈ្មោះអង់គ្លេស
          </label>
          <input
            type="text"
            name="englishName"
            value={formData.englishName}
            onChange={handleChange}
            placeholder="English Name"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white placeholder-white/50"
            autoComplete="off"
          />
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeInUp} custom={2}>
          <label className="block text-sm text-af mb-2">
            ចំណងជTitle
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="លោក, អ្នកនាង"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white placeholder-white/50"
            autoComplete="off"
          />
        </motion.div>

        {/* Relationship */}
        <motion.div variants={fadeInUp} custom={3}>
          <label className="block text-sm text-af mb-2">
            ទំនាក់ទំនង
          </label>
          <select
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white"
          >
            <option value="family" className="bg-slate-800">គ្រួសារ</option>
            <option value="friend" className="bg-slate-800">មិត្តភ័ក្តិ</option>
            <option value="colleague" className="bg-slate-800">សហក្រមការ</option>
            <option value="vip" className="bg-slate-800">VIP</option>
            <option value="guest" className="bg-slate-800">ភ្ញៀវ</option>
          </select>
        </motion.div>

        {/* Status */}
        <motion.div variants={fadeInUp} custom={4}>
          <label className="block text-sm text-af mb-2">
            ស្ថានភាព
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white"
          >
            <option value="pending" className="bg-slate-800">រង់ចាំ</option>
            <option value="sent" className="bg-slate-800">បានផ្ញើ</option>
            <option value="confirmed" className="bg-slate-800">បានអះអាង</option>
            <option value="declined" className="bg-slate-800">បានបដិសេធ</option>
          </select>
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

        {/* Submit Button */}
        <motion.button
          variants={fadeInUp}
          custom={5}
          type="submit"
          disabled={isLoading}
          className="w-full relative overflow-hidden rounded-xl px-6 py-3 font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
          style={{
            background: `linear-gradient(135deg, ${light}, ${medium})`,
          }}
        >
          <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          <span className="relative z-10">
            {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមភ្ញៀវ'}
          </span>
        </motion.button>
      </form>
    </motion.div>
  );
}
