'use client';

import React from 'react';

/**
 * Button component props interface
 * Extends HTML button attributes for semantic HTML support
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual style variant of the button
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /**
   * Size of the button
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Whether the button is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the button is in loading state
   * @default false
   */
  isLoading?: boolean;

  /**
   * Button content
   */
  children: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Click event handler
   */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * HTML button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Whether the button should take full width of parent
   * @default false
   */
  fullWidth?: boolean;
}

/**
 * Variant styles configuration
 * Maps variant names to their Tailwind CSS classes
 */
const variantStyles = {
  primary: {
    base: 'bg-emerald-500 text-white dark:bg-emerald-600',
    hover: 'hover:bg-emerald-600 dark:hover:bg-emerald-500',
    active: 'active:bg-emerald-700 dark:active:bg-emerald-800',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    hover: 'hover:bg-gray-200 hover:border-gray-400 dark:hover:bg-gray-600 dark:hover:border-gray-500',
    active: 'active:bg-gray-300 dark:active:bg-gray-500',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:border-gray-300 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 dark:disabled:border-gray-600',
  },
  ghost: {
    base: 'text-emerald-500 bg-transparent dark:text-emerald-400',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
    active: 'active:bg-emerald-100 dark:active:bg-emerald-900/30',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-emerald-400',
    disabled: 'disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:disabled:text-gray-500',
  },
  danger: {
    base: 'bg-red-500 text-white dark:bg-red-600',
    hover: 'hover:bg-red-600 dark:hover:bg-red-500',
    active: 'active:bg-red-700 dark:active:bg-red-800',
    focus: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-400',
    disabled: 'disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed disabled:opacity-60 dark:disabled:bg-gray-700 dark:disabled:text-gray-500',
  },
};

/**
 * Size styles configuration
 * Maps size names to their Tailwind CSS classes
 */
const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-6 py-4 text-lg',
};

/**
 * Base button styles applied to all variants
 */
const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 ease-in-out rounded-xl whitespace-nowrap shadow-md hover:shadow-lg active:shadow hover:-translate-y-0.5 active:scale-98';

/**
 * Button Component
 *
 * A versatile button component with multiple variants and states.
 * Supports primary, secondary, ghost, and danger styling with
 * full accessibility features and keyboard navigation.
 *
 * @example
 * // Primary button
 * <Button onClick={handleClick}>확인</Button>
 *
 * @example
 * // Secondary button
 * <Button variant="secondary">취소</Button>
 *
 * @example
 * // Ghost button (text only)
 * <Button variant="ghost">더보기</Button>
 *
 * @example
 * // Danger button
 * <Button variant="danger">삭제</Button>
 *
 * @example
 * // Disabled button
 * <Button disabled>비활성</Button>
 *
 * @example
 * // Full width button
 * <Button fullWidth>로그인</Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      children,
      className = '',
      onClick,
      type = 'button',
      fullWidth = false,
      ...rest
    },
    ref
  ) => {
    // Get variant styles
    const currentVariant = variantStyles[variant];
    const currentSize = sizeStyles[size];

    // Build class name
    const buttonClasses = [
      baseStyles,
      currentVariant.base,
      currentVariant.hover,
      currentVariant.active,
      currentVariant.focus,
      currentVariant.disabled,
      currentSize,
      fullWidth ? 'w-full' : '',
      disabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Handle click event with disabled state check
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || isLoading) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        onClick={handleClick}
        className={buttonClasses}
        {...rest}
      >
        {/* Show loading indicator if isLoading is true */}
        {isLoading && (
          <span className="mr-2">
            <svg
              className="inline-block animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        )}
        {children}
      </button>
    );
  }
);

// Display name for debugging
Button.displayName = 'Button';

export default Button;

