'use client'

import React from 'react'
import Link from 'next/link'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: React.ReactNode
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/50',
  secondary: 'bg-slate-700 text-white hover:bg-slate-600',
  outline: 'border-2 border-purple-400/50 text-purple-200 hover:bg-purple-500/10 hover:border-purple-300',
  ghost: 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10',
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          font-bold rounded-xl transition-all duration-300 
          hover:scale-105 transform disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]} 
          ${sizeStyles[size]}
          ${className}
        `}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⌛</span>
            Carregando...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
