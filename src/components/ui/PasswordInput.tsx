import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, InputProps } from './Input';

export const PasswordInput = React.forwardRef<HTMLInputElement, Omit<InputProps, 'type' | 'rightIcon'>>(
  ({ leftIcon = <Lock className="w-4 h-4" />, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        leftIcon={leftIcon}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(prev => !prev)}
            className="p-1 rounded text-themeText-muted hover:text-themeText-primary focus:outline-none transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
