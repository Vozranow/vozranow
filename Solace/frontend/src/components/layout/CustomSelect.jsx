import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";

// --- CUSTOM UI COMPONENTS ---
function CustomSelect({ value, onChange, options, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl border flex justify-between items-center text-sm transition-all duration-200
          ${isOpen ? 'border-orange-500 ring-1 ring-orange-500 bg-white' : 'border-gray-200 bg-white hover:border-orange-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer text-[#2D2A26]'}
        `}
      >
        <span className="truncate pr-4">{value}</span>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-orange-500' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-[70] w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex justify-between items-center group
                ${value === opt ? 'bg-orange-50 text-orange-700 font-medium' : 'text-[#5C5954] hover:bg-gray-50 hover:text-[#2D2A26]'}
              `}
              onClick={() => {
                onChange(opt);
                setIsOpen(false);
              }}
            >
              {opt}
              {value === opt && <Check size={16} className="text-orange-600 animate-in zoom-in-50" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
export default CustomSelect;