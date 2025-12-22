'use client';

import { useState, useEffect } from 'react';

interface DateInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void; // Vraća YYYY-MM-DD format
  label?: string;
  className?: string;
}

/**
 * Custom date input koji prikazuje DD.MM.YYYY format ali interno radi sa YYYY-MM-DD
 */
export default function DateInput({ value, onChange, label, className = '' }: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Konvertuj YYYY-MM-DD u DD.MM.YYYY za prikaz
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.includes('.')) return dateStr; // Već je u DD.MM.YYYY formatu
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0]; // Ukloni vreme iz ISO stringa
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}.${month}.${year}`;
    }
    return dateStr;
  };

  // Konvertuj DD.MM.YYYY u YYYY-MM-DD za čuvanje
  const parseFromDisplay = (displayStr: string): string => {
    if (!displayStr) return '';
    if (displayStr.includes('-')) return displayStr; // Već je u YYYY-MM-DD formatu
    const parts = displayStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return displayStr;
  };

  useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Ako je validan format DD.MM.YYYY, konvertuj i pozovi onChange
    if (inputValue.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      const parsed = parseFromDisplay(inputValue);
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    // Validacija i formatiranje na blur
    if (displayValue.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      const parsed = parseFromDisplay(displayValue);
      onChange(parsed);
      setDisplayValue(formatForDisplay(parsed));
    } else if (displayValue) {
      // Ako nije validan format, vrati na poslednji validan
      setDisplayValue(formatForDisplay(value));
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="DD.MM.YYYY"
        pattern="\d{2}\.\d{2}\.\d{4}"
        className={`px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none ${className}`}
      />
    </div>
  );
}


