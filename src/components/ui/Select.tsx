'use client';

import React from 'react';

/**
 * Select component props interface
 */
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /**
   * Label for the select field
   */
  label?: string;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Helper text displayed below the select
   */
  helperText?: string;

  /**
   * Error message displayed when error is true
   */
  errorMessage?: string;

  /**
   * Whether the select is in error state
   */
  error?: boolean;

  /**
   * Size of the select
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Select options
   */
  children: React.ReactNode;
}

/**
 * Select Component
 *
 * 디자인 시스템에 맞춘 선택 필드 컴포넌트입니다.
 * 다크모드, 에러 상태, 도움말 텍스트를 지원합니다.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      required,
      helperText,
      errorMessage,
      error = false,
      size = 'md',
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // 크기 클래스
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-4 py-3 text-lg',
    };

    // 기본 클래스
    const baseClasses = `
      w-full
      border rounded-lg
      bg-white dark:bg-gray-800
      text-gray-900 dark:text-gray-100
      transition-colors duration-150
      focus:outline-none
      disabled:bg-gray-100 dark:disabled:bg-gray-700
      disabled:text-gray-300 dark:disabled:text-gray-500
      disabled:cursor-not-allowed
      appearance-none
      cursor-pointer
      pr-10
      bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")] 
      bg-[length:1.5em_1.5em] 
      bg-[right_0.5rem_center] 
      bg-no-repeat
      dark:bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")]
    `;

    // 상태별 클래스
    const stateClasses = error
      ? 'border-2 border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:ring-offset-2'
      : 'border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:ring-offset-2 focus:border-transparent';

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${stateClasses}
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        {error && errorMessage && (
          <p className="text-xs text-red-500 dark:text-red-400">{errorMessage}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;

