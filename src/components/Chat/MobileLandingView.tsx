import React from 'react';
import { ImageIcon, Video, ArrowRight, Presentation, Music } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { CompactModelSelector } from './CompactModelSelector';

interface MobileLandingViewProps {
  onQuickAction: (prompt: string) => void;
  input: string;
  setInput: (value: string) => void;
  onSendMessage: () => void;
  onOpenSidebar?: () => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
  isLoading?: boolean;
}

export const MobileLandingView: React.FC<MobileLandingViewProps> = ({
  onQuickAction,
  input,
  setInput,
  onSendMessage,
  selectedModel = 'grok-4-fast',
  onModelChange,
  isLoading = false,
}) => {

  const suggestions = [
    {
      icon: ImageIcon,
      title: 'Generate Image',
      prompt: 'Create an image of a sunset over mountains',
    },
    {
      icon: Video,
      title: 'Generate Video',
      prompt: 'Generate a video of ocean waves',
    },
    {
      icon: Presentation,
      title: 'Create PPT',
      prompt: 'Create a presentation about AI',
    },
    {
      icon: Music,
      title: 'Generate Song',
      prompt: 'Create a calm instrumental music',
    }
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full mx-auto flex flex-col items-center justify-center">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img
            src="/Black_Blue_White_Modern_Simple_Minimal_Gradient_Circle__Neon_Technology__AI_Logo__1_-removebg-preview copy.png"
            alt="KroniQ"
            className="h-20 w-auto object-contain mb-3 mx-auto drop-shadow-[0_0_15px_rgba(0,255,240,0.5)]"
          />
          <h1 className="text-2xl font-semibold text-white mb-2">
            Welcome to KroniQ
          </h1>
          <p className="text-white/60 text-sm">
            How can I help you today?
          </p>
        </div>

        {/* Suggestion Cards */}
        <div className="grid grid-cols-2 gap-2 w-full mb-6">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => !isLoading && onQuickAction(suggestion.prompt)}
                disabled={isLoading}
                className={`flex flex-col items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-left ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Icon className="w-4 h-4 text-white/80" />
                <span className="text-xs text-white/80 font-medium">
                  {suggestion.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() && !isLoading) {
                onSendMessage();
              }
            }}
            className="relative"
          >
            {/* AI Model Selector */}
            {onModelChange && (
              <div className="mb-3">
                <CompactModelSelector
                  selectedModel={selectedModel}
                  onModelChange={onModelChange}
                  category="chat"
                />
              </div>
            )}
            <div className="relative flex items-end bg-[#0d1117]/80 rounded-2xl input-gradient-border transition-all">
              <textarea
                value={input}
                rows={1}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-grow logic
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      onSendMessage();
                    }
                  }
                }}
                placeholder="Message KroniQ..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 py-3 text-white text-sm placeholder-white/40 focus:outline-none resize-none max-h-[120px] overflow-y-auto break-all whitespace-pre-wrap"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className={`mr-2 mb-1.5 p-2 rounded-xl transition-all duration-300 flex items-center justify-center ${!input.trim() || isLoading
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-700 text-white hover:from-violet-700 hover:to-indigo-800 shadow-[0_4px_12px_rgba(124,58,237,0.3)] active:scale-95'
                  }`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/30 text-center mt-2">
              KroniQ can make mistakes. Check important info.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
