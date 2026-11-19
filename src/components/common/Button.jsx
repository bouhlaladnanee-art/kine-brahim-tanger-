import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'accent' | 'outline' | 'ghost' | 'soft'
  size = 'md', // 'sm' | 'md' | 'lg'
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 active:scale-[0.98] select-none focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeStyles = {
    sm: 'text-sm py-2 px-3 gap-1.5',
    md: 'text-base py-3 px-5 gap-2',
    lg: 'text-base sm:text-lg py-4 px-6 gap-2.5', // Grande taille tactile pour mobile
  };

  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-600 focus:ring-primary shadow-soft disabled:bg-primary-300',
    accent: 'bg-accent text-white hover:bg-accent-600 focus:ring-accent shadow-soft disabled:bg-accent-300',
    outline: 'border-2 border-primary text-primary hover:bg-primary-50 focus:ring-primary disabled:border-slate-300 disabled:text-slate-400',
    soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100 focus:ring-primary-200',
    ghost: 'text-text-main hover:bg-slate-100 focus:ring-slate-200',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5 shrink-0" />}
        </>
      )}
    </button>
  );
}
