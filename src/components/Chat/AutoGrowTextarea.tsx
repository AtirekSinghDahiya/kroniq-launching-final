import React, { forwardRef, useEffect } from 'react';

interface AutoGrowTextareaProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    autoFocus?: boolean;
    disabled?: boolean;
    maxHeight?: string;
    className?: string;
}

/**
 * Reusable auto-growing textarea component
 * Features:
 * - Auto-grows vertically as user types
 * - Handles word breaking for long unbroken text
 * - Mobile-safe 16px font (prevents iOS zoom)
 * - Max height with internal scroll (30vh default)
 * - Controlled React API
 */
export const AutoGrowTextarea = forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
    ({
        value,
        onChange,
        placeholder,
        onKeyDown,
        autoFocus,
        disabled = false,
        maxHeight = '30vh',
        className = ''
    }, ref) => {

        const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            const el = e.target;
            // Reset height to auto to recalculate
            el.style.height = 'auto';
            // Set height to scrollHeight
            el.style.height = `${el.scrollHeight}px`;
            onChange(e);
        };

        return (
            <textarea
                ref={ref}
                value={value}
                rows={1}
                autoFocus={autoFocus}
                disabled={disabled}
                placeholder={placeholder}
                onChange={handleInput}
                onKeyDown={onKeyDown}
                style={{ maxHeight }}
                className={`
          w-full bg-transparent resize-none outline-none
          text-white placeholder-white/40
          text-[16px] leading-relaxed
          overflow-y-auto
          break-words
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
            />
        );
    }
);

AutoGrowTextarea.displayName = 'AutoGrowTextarea';
