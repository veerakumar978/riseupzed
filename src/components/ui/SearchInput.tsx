import React from 'react';
import { Search } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  shortcut?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ shortcut = '⌘K', rightIcon, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={<Search className="w-4 h-4" />}
        rightIcon={
          rightIcon || (
            shortcut ? (
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-themeBorder bg-panel-elevated text-themeText-muted shadow-sm">
                {shortcut}
              </kbd>
            ) : undefined
          )
        }
        placeholder={props.placeholder || 'Search transactions, members, metrics...'}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
