"use client";

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { UserPlus, RotateCcw } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useTheme } from '@/providers/ThemeContext';
import { Guest } from '@/data/guestList';

interface SingleGuestFormProps {
  onGuestAdded: (guest: Guest) => void;
}

type Relationship = 'family' | 'friend' | 'colleague' | 'vip' | 'guest';
type GuestStatus = NonNullable<Guest['status']>;

interface SingleGuestFormData {
  khmerName: string;
  englishName: string;
  title: string;
  relationship: Relationship;
  status: GuestStatus;
}

type FieldName = keyof SingleGuestFormData;
type FormErrors = Partial<Record<FieldName, string>>;

const INITIAL_FORM_DATA: SingleGuestFormData = {
  khmerName: '',
  englishName: '',
  title: '',
  relationship: 'guest',
  status: 'pending',
};

const RELATIONSHIP_OPTIONS: Array<{ value: Relationship; label: string }> = [
  { value: 'family', label: 'គ្រួសារ' },
  { value: 'friend', label: 'មិត្តភ័ក្តិ' },
  { value: 'colleague', label: 'សហការី' },
  { value: 'vip', label: 'VIP' },
  { value: 'guest', label: 'ភ្ញៀវ' },
];

const STATUS_OPTIONS: Array<{ value: GuestStatus; label: string }> = [
  { value: 'pending', label: 'រង់ចាំ' },
  { value: 'sent', label: 'បានផ្ញើ' },
  { value: 'confirmed', label: 'បានអះអាង' },
  { value: 'declined', label: 'បានបដិសេធ' },
];

function sanitizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function validateField(name: FieldName, value: string): string | undefined {
  const normalized = sanitizeText(value);

  if (name === 'khmerName') {
    if (!normalized) return 'សូមបញ្ចូលឈ្មោះខ្មែរ';
    if (normalized.length < 2) return 'ឈ្មោះត្រូវមានយ៉ាងហោចណាស់ 2 តួអក្សរ';
    if (normalized.length > 80) return 'ឈ្មោះមិនអាចលើស 80 តួអក្សរ';
    return undefined;
  }

  if (name === 'englishName') {
    if (normalized.length > 80) return 'ឈ្មោះអង់គ្លេសមិនអាចលើស 80 តួអក្សរ';
    return undefined;
  }

  if (name === 'title') {
    if (normalized.length > 30) return 'គោរម្យងារមិនអាចលើស 30 តួអក្សរ';
    return undefined;
  }

  return undefined;
}

function validateForm(formData: SingleGuestFormData): FormErrors {
  const errors: FormErrors = {};
  (Object.keys(formData) as FieldName[]).forEach((fieldName) => {
    if (fieldName === 'relationship' || fieldName === 'status') return;

    const fieldError = validateField(fieldName, formData[fieldName]);
    if (fieldError) {
      errors[fieldName] = fieldError;
    }
  });

  return errors;
}

export function SingleGuestForm({ onGuestAdded }: SingleGuestFormProps) {
  const { currentTheme } = useTheme();
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState<SingleGuestFormData>(INITIAL_FORM_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
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

  const isSubmitDisabled = useMemo(() => {
    return isLoading || Object.keys(validateForm(formData)).length > 0;
  }, [formData, isLoading]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const fieldName = name as FieldName;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    if (touched[fieldName]) {
      const nextError = validateField(fieldName, value);
      setFormErrors((prev) => ({ ...prev, [fieldName]: nextError }));
    }

    if (message) {
      setMessage(null);
    }
  }, [message, touched]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const fieldName = e.target.name as FieldName;
    setTouched((prev) => ({ ...prev, [fieldName]: true }));

    const nextError = validateField(fieldName, e.target.value);
    setFormErrors((prev) => ({ ...prev, [fieldName]: nextError }));
  }, []);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setTouched({});
    setFormErrors({});
    setMessage(null);
    nameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const normalizedData: SingleGuestFormData = {
      ...formData,
      khmerName: sanitizeText(formData.khmerName),
      englishName: sanitizeText(formData.englishName),
      title: sanitizeText(formData.title),
    };

    const nextErrors = validateForm(normalizedData);
    setFormErrors(nextErrors);
    setTouched({
      khmerName: true,
      englishName: true,
      title: true,
      relationship: true,
      status: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setMessage({
        type: 'error',
        text: nextErrors.khmerName || nextErrors.englishName || nextErrors.title || 'សូមពិនិត្យទិន្នន័យម្តងទៀត',
      });
      return;
    }

    setFormData(normalizedData);
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
              khmerName: normalizedData.khmerName,
              englishName: normalizedData.englishName || undefined,
              title: normalizedData.title || undefined,
              relationship: normalizedData.relationship,
              status: normalizedData.status,
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
          khmerName: normalizedData.khmerName,
          ...(normalizedData.englishName && { englishName: normalizedData.englishName }),
          ...(normalizedData.title && { title: normalizedData.title }),
          ...(normalizedData.relationship && { relationship: normalizedData.relationship }),
          ...(normalizedData.status && { status: normalizedData.status }),
        };
        
        onGuestAdded(newGuest);

        setFormData(INITIAL_FORM_DATA);
        setTouched({});
        setFormErrors({});
        nameInputRef.current?.focus();
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
          <label htmlFor="khmerName" className="block text-sm text-af mb-2">
            ឈ្មោះខ្មែរ *
          </label>
          <input
            id="khmerName"
            type="text"
            name="khmerName"
            value={formData.khmerName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="ឈ្មោះ​ខ្មែរ"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white placeholder-white/50 ${
              formErrors.khmerName ? 'border-red-400/60 ring-red-400/40' : 'border-white/20'
            }`}
            required
            autoComplete="off"
            maxLength={80}
            ref={nameInputRef}
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-white/50">វាលចាំបាច់</span>
            <span className="text-white/40">{sanitizeText(formData.khmerName).length}/80</span>
          </div>
          {formErrors.khmerName && touched.khmerName && (
            <p className="mt-1 text-xs text-red-300">{formErrors.khmerName}</p>
          )}
        </motion.div>

        {/* English Name */}
        <motion.div variants={fadeInUp} custom={1}>
          <label htmlFor="englishName" className="block text-sm text-af mb-2">
            ឈ្មោះអង់គ្លេស
          </label>
          <input
            id="englishName"
            type="text"
            name="englishName"
            value={formData.englishName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="English Name"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white placeholder-white/50 ${
              formErrors.englishName ? 'border-red-400/60 ring-red-400/40' : 'border-white/20'
            }`}
            autoComplete="off"
            maxLength={80}
          />
          {formErrors.englishName && touched.englishName && (
            <p className="mt-1 text-xs text-red-300">{formErrors.englishName}</p>
          )}
        </motion.div>

        {/* Title */}
        <motion.div variants={fadeInUp} custom={2}>
          <label htmlFor="title" className="block text-sm text-af mb-2">
            គោរម្យងារ
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="លោក, អ្នកនាង"
            className={`w-full px-4 py-3 bg-white/10 border rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white placeholder-white/50 ${
              formErrors.title ? 'border-red-400/60 ring-red-400/40' : 'border-white/20'
            }`}
            autoComplete="off"
            maxLength={30}
          />
          {formErrors.title && touched.title && (
            <p className="mt-1 text-xs text-red-300">{formErrors.title}</p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Relationship */}
          <motion.div variants={fadeInUp} custom={3}>
            <label htmlFor="relationship" className="block text-sm text-af mb-2">
              ទំនាក់ទំនង
            </label>
            <select
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white"
            >
              {RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>

          {/* Status */}
          <motion.div variants={fadeInUp} custom={4}>
            <label htmlFor="status" className="block text-sm text-af mb-2">
              ស្ថានភាព
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:border-transparent outline-none transition text-white"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="bg-slate-800">
                  {option.label}
                </option>
              ))}
            </select>
          </motion.div>
        </div>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <motion.button
            variants={fadeInUp}
            custom={5}
            type="submit"
            disabled={isSubmitDisabled}
            className="relative overflow-hidden rounded-xl px-6 py-3 font-bold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            style={{
              background: `linear-gradient(135deg, ${light}, ${medium})`,
            }}
          >
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <span className="relative z-10">
              {isLoading ? 'កំពុងបន្ថែម...' : 'បន្ថែមភ្ញៀវ'}
            </span>
          </motion.button>

          <motion.button
            variants={fadeInUp}
            custom={6}
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white/80 hover:bg-white/10 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} />
            កំណត់ឡើងវិញ
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
