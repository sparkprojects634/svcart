import React from 'react';
import { Eye, EyeOff, XCircle } from 'lucide-react';

export const InputField = ({
    value,
    onChange,
    type,
    name,
    placeholder,
    icon: Icon,
    showPasswordToggle,
    showPassword,
    onTogglePassword,
    error
}) => (
    <div className="relative w-full">
        {/* Icon */}
        <div
            className={`absolute left-3 ${error ? 'top-1/3' : 'top-1/2'
                } transform -translate-y-1/2 text-[#FFC107] pointer-events-none z-10`}
        >
            <Icon size={18} />
        </div>

        {/* Input */}
        <input
            type={showPasswordToggle && showPassword ? 'text' : type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full pl-10 pr-12 py-3 border border-white/80 bg-transparent rounded-lg text-white placeholder:text-white/70 outline-none backdrop-blur-sm transition focus:border-[#FFC107] focus:outline-none focus:ring-2  ${error ? 'border-black bg-gray-100' : 'border-white/80 bg-transparent'
                }`}
            autoComplete="off"
        />

        {/* Show/Hide Password Button */}
        {showPasswordToggle && (
            <button
                type="button"
                onClick={onTogglePassword}
                className={`absolute right-3 ${error ? 'top-1/3' : 'top-1/2'
                } transform -translate-y-1/2 text-white hover:text-[#FFC107] focus:outline-none`}
            >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        )}

        {/* Error Message */}
        {error && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
                <XCircle size={14} className="mr-1" />
                {error}
            </div>
        )}
    </div>
);
