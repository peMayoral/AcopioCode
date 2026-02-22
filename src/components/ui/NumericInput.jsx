import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// Formats a number with thousand separators (dots) and decimals (comma) in es-AR
function formatNumber(value) {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseFloat(value);
  if (isNaN(num)) return '';
  return num.toLocaleString('es-AR', { maximumFractionDigits: 2 });
}

function parseFormattedNumber(str) {
  if (str === '' || str === null || str === undefined) return 0;
  // Remove thousand separators (dots) and replace comma with dot for parsing
  const cleaned = String(str).replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function NumericInput({ value, onChange, className, placeholder, min, step, ...props }) {
  const [displayValue, setDisplayValue] = useState(formatNumber(value));
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleFocus = (e) => {
    setIsFocused(true);
    // Show raw value without formatting when focused
    if (value === 0 || value === '0') {
      setDisplayValue('');
    } else {
      setDisplayValue(String(value).replace('.', ','));
    }
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseFormattedNumber(displayValue);
    setDisplayValue(formatNumber(parsed));
    onChange(parsed);
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    // Allow digits, commas and dots
    if (/^[\d.,]*$/.test(raw)) {
      setDisplayValue(raw);
    }
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder || '0'}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
    />
  );
}