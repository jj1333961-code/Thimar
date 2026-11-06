'use client'

import React, { useState } from 'react'

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  wrapperClassName?: string
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = '', wrapperClassName = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className={`relative flex items-center w-full ${wrapperClassName}`}>
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`w-full py-3.5 px-4 pr-11 rtl:pr-11 rtl:pl-11 ltr:pr-11 ltr:pl-4 bg-muted/50 border border-border rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm text-foreground transition-all placeholder:text-muted-foreground ${className}`}
          {...props}
        />
        <button
          type="button"
          tabIndex={0}
          aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          onClick={() => setShowPassword(prev => !prev)}
          className="absolute end-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all cursor-pointer active:scale-90"
        >
          {showPassword ? (
            /* Eye open with centered pupil dot */
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
            </svg>
          ) : (
            /* Eye with diagonal slash and centered pupil dot */
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
              <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'
