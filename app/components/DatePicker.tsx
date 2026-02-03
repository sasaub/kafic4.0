'use client';

import { useState, useRef, useEffect } from 'react';
import { formatDate } from '../utils/dateFormat';

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void; // Vraća YYYY-MM-DD format
  label?: string;
  className?: string;
}

/**
 * Custom date picker koji prikazuje DD.MM.YYYY format ali koristi native kalendar
 */
export default function DatePicker({ value, onChange, label, className = '' }: DatePickerProps) {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Konvertuj YYYY-MM-DD u DD.MM.YYYY za prikaz
  const formatForDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    return formatDate(dateStr);
  };

  // Konvertuj DD.MM.YYYY u YYYY-MM-DD
  const parseFromDisplay = (displayStr: string): string | null => {
    if (!displayStr) return null;
    
    // Ukloni sve što nije broj ili tačka
    const cleaned = displayStr.replace(/[^\d.]/g, '');
    
    // Proveri format DD.MM.YYYY
    const parts = cleaned.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      if (day.length === 2 && month.length === 2 && year.length === 4) {
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);
        
        // Validacija
        if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 2000) {
          return `${yearNum}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
    
    return null;
  };

  useEffect(() => {
    setDisplayValue(formatForDisplay(value));
  }, [value]);

  const handleDisplayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
    
    // Ako je validan format, konvertuj i pozovi onChange
    const parsed = parseFromDisplay(inputValue);
    if (parsed) {
      onChange(parsed);
      // Ažuriraj hidden input za kalendar
      if (hiddenInputRef.current) {
        hiddenInputRef.current.value = parsed;
      }
    }
  };

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(newValue);
      setDisplayValue(formatForDisplay(newValue));
    }
  };

  const handleCalendarClick = () => {
    setShowCalendar(true);
    // Fokusiraj hidden input da otvori kalendar
    setTimeout(() => {
      if (hiddenInputRef.current) {
        hiddenInputRef.current.showPicker?.();
        // Ako showPicker nije podržan, klikni na input
        if (typeof hiddenInputRef.current.showPicker !== 'function') {
          hiddenInputRef.current.click();
        }
      }
    }, 100);
  };

  const handleDisplayFocus = () => {
    // Kada se fokusira display input, otvori kalendar
    handleCalendarClick();
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Prikazni input sa DD.MM.YYYY formatom - readOnly ali klikabilan */}
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleDisplayChange}
          onFocus={handleDisplayFocus}
          onClick={handleCalendarClick}
          placeholder="DD.MM.YYYY"
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none w-full pr-10 cursor-pointer"
          readOnly
        />
        {/* Kalendar ikonica */}
        <button
          type="button"
          onClick={handleCalendarClick}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 pointer-events-auto"
        >
          📅
        </button>
        {/* Skriveni input za kalendar - postavi ga da bude preko display inputa */}
        <input
          ref={hiddenInputRef}
          type="date"
          value={value}
          onChange={handleHiddenInputChange}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

