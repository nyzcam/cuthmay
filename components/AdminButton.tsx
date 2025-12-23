"use client";

import React from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export function AdminButton() {
  return (
    <Link
      href="/auth/login"
      className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-40"
      aria-label="Admin Panel"
      title="Admin Panel"
    >
      <Settings size={20} />
      <span className="font-semibold">Admin</span>
    </Link>
  );
}
