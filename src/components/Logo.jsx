import React from 'react';

// Brand wordmark: orange "मेरी" followed by white "yatra" inside an orange pill.
// Rendered as HTML (not an <img>) so the pill always fits the text and the
// Devanagari glyphs use the page's fonts on every platform.
export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: { text: 'text-lg', pill: 'px-2 py-0.5', gap: 'gap-1' },
    md: { text: 'text-2xl', pill: 'px-2.5 py-0.5', gap: 'gap-1.5' },
    lg: { text: 'text-4xl', pill: 'px-3.5 py-1', gap: 'gap-2' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.text} font-extrabold leading-none tracking-tight select-none ${className}`}
      aria-label="मेरी yatra"
    >
      <span className="text-red-600">मेरी</span>
      <span className={`bg-red-600 text-white rounded-full ${s.pill}`}>yatra</span>
    </span>
  );
}
