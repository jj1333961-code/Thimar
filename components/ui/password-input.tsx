'use client'

import React, { useState } from 'react'

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  containerClassName?: string
  inputClassName?: string
}

export const BlueEyeToggleIcon = ({
  isRevealed,
  onClick,
}: {
  isRevealed: boolean
  onClick: () => void
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      title={isRevealed ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all touch-manipulation z-10"
      style={{ minWidth: '36px', minHeight: '36px' }}
    >
      <svg
        className="w-6 h-6"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Oval / Circle */}
        <ellipse
          cx="12"
          cy="12"
          rx="8"
          ry="6"
          stroke="#2563eb"
          strokeWidth="2"
          fill="none"
        />
        {/* Central Pupil / Dot */}
        <circle cx="12" cy="12" r="2.2" fill="#2563eb" />
        {/* Diagonal Slash Line through icon when password is hidden */}
        {!isRevealed && (
          <line
            x1="4"
            y1="20"
            x2="20"
            y2="4"
            stroke="#2563eb"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}
      </svg>
    </button>
  )
}

export function PasswordInput({
  label,
  error,
  containerClassName = '',
  inputClassName = '',
  value,
  onChange,
  placeholder = '••••••••',
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={`space-y-1.5 ${containerClassName}`} dir="rtl">
      {label && (
        <label className="block text-xs sm:text-sm font-bold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pr-12 pl-14 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-sm transition-all text-gray-900 ${inputClassName}`}
        />
        <BlueEyeToggleIcon
          isRevealed={showPassword}
          onClick={() => setShowPassword((prev) => !prev)}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  )
}
