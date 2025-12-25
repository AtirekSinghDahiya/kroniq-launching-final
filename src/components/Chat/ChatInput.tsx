import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { enhancePrompt, isPromptEnhancementAvailable } from '../../lib/promptEnhancer';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedModel: string;
  isLoading?: boolean;
}

// Rotating prompts - cycles each session for fresh experience
const ROTATING_PROMPTS = [
  'Ask KroniQ anything…',
  'Summarize my idea',
  'Generate content ideas',
  'What should I know about...',
  'Help me brainstorm',
  'Explain this concept',
];

// Get session-based prompt (changes each browser session)
const getSessionPrompt = () => {
  const sessionIndex = Math.floor(Date.now() / (1000 * 60 * 60)) % ROTATING_PROMPTS.length;
  return ROTATING_PROMPTS[sessionIndex];
};

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder,
  disabled = false,
  isLoading = false,
}) => {
  const { currentTheme } = useTheme();
  const isLightTheme = currentTheme === 'pure-white';
  const { showToast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [currentPlaceholder] = useState(() => placeholder || getSessionPrompt());

  // Clear first load pulse after animation completes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus input on mount
  useEffect(() => {
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(focusTimer);
  }, []);

  // Hide hint when user starts typing
  useEffect(() => {
    if (value.trim().length > 0) {
      setShowHint(false);
    }
  }, [value]);

  // Visual viewport resize handler for keyboard-safe input on mobile
  useEffect(() => {
    const handleViewportResize = () => {
      if (window.visualViewport && inputRef.current) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        if (windowHeight - viewportHeight > 150) {
          setTimeout(() => {
            inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }, 100);
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, []);

  const handleEnhancePrompt = async () => {
    if (!value.trim() || isEnhancing) return;

    if (!isPromptEnhancementAvailable()) {
      showToast('error', 'Feature Unavailable', 'Prompt enhancement requires API configuration');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(value);
      onChange(enhanced);
      showToast('success', 'Prompt Enhanced!', 'Your prompt has been improved');
    } catch (error: any) {
      showToast('error', 'Enhancement Failed', error.message || 'Could not enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle keyboard events - Ctrl/Cmd+Enter sends
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (value.trim() && !disabled && !isLoading) {
        onSend();
      }
      return;
    }
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <div className="space-y-1 sm:space-y-2">
      {/* Input Container with gradient border */}
      <div className="w-full">
        <div className={`relative rounded-xl sm:rounded-2xl shadow-lg input-gradient-border ${isLightTheme
          ? 'bg-white'
          : 'bg-slate-900/90'
          } ${isFirstLoad ? 'input-glow-pulse' : ''} ${!value.trim() && !isFocused ? 'input-empty-pulse' : ''}`}
        >
          <div className="flex items-end gap-1 sm:gap-2 p-2 sm:p-3">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 pb-1 sm:pb-1.5">
              {/* Enhance Prompt Button */}
              {isPromptEnhancementAvailable() && (
                <button
                  onClick={handleEnhancePrompt}
                  disabled={disabled || isEnhancing || !value.trim()}
                  className={`p-2 rounded-lg transition-all ${isEnhancing
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse'
                    : disabled || !value.trim()
                      ? isLightTheme
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 cursor-not-allowed'
                      : isLightTheme
                        ? 'hover:bg-purple-100 text-purple-600'
                        : 'hover:bg-purple-500/20 text-purple-400'
                    }`}
                  title={isEnhancing ? 'Enhancing...' : 'Enhance prompt with AI'}
                >
                  <Sparkles className={`w-3 h-3 sm:w-4 sm:h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Text Input - Auto-grow textarea */}
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                // Auto-grow logic
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={currentPlaceholder}
              disabled={disabled || isLoading}
              className={`flex-1 bg-transparent px-2 sm:px-3 py-2 resize-none focus:outline-none text-base leading-relaxed ${isLightTheme
                ? 'text-gray-900 placeholder-gray-400'
                : 'text-white placeholder-white/50'
                }`}
              rows={1}
              style={{ minHeight: '24px', maxHeight: '150px', overflowY: 'auto' }}
            />

            {/* Send Button with glow states + haptic feedback */}
            <div className="flex items-center pb-1 sm:pb-2">
              <button
                onClick={() => {
                  if (!isLoading && value.trim()) {
                    // Haptic feedback for mobile - subtle vibration
                    if (navigator.vibrate) {
                      navigator.vibrate(10);
                    }
                    onSend();
                  }
                }}
                disabled={!value.trim() || disabled || isLoading}
                className={`p-2 rounded-xl send-button-glow transition-all duration-300 ${value.trim() && !disabled && !isLoading
                  ? `${isLightTheme
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-700 text-white hover:from-violet-700 hover:to-indigo-800 shadow-[0_4px_12px_rgba(124,58,237,0.3)]'
                    : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-400 hover:to-purple-500 shadow-[0_4px_20px_rgba(139,92,246,0.5)] border border-violet-400/20'
                  } active send-button-active scale-100 hover:scale-105 active:scale-95`
                  : isLightTheme
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white/10 text-white/30 cursor-not-allowed opacity-40'
                  } ${isLoading ? 'sending' : ''}`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hint text - shows on first load, fades when typing */}
      {showHint && (
        <div className="flex items-center justify-center px-2 hint-text-fade">
          <p className={`text-xs ${isLightTheme ? 'text-gray-400' : 'text-white/40'}`}>
            Ask anything. KroniQ thinks fast ⚡
          </p>
        </div>
      )}

      {/* Disclaimer - Hidden on mobile */}
      {!showHint && (
        <div className="hidden sm:flex items-center justify-center px-2">
          <p className={`text-xs ${isLightTheme ? 'text-gray-400' : 'text-white/30'}`}>
            KroniQ can make mistakes. Check important info.
          </p>
        </div>
      )}
    </div>
  );
};
