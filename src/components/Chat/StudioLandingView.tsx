import React, { useState } from 'react';
import { Sparkles, Image, Video, Music, Code, Mic, MessageSquare, Zap, Presentation, ChevronDown, ChevronRight, Send } from 'lucide-react';
import { AI_MODELS } from '../../lib/aiModels';
import { GenerationLimitsDisplay } from '../Common/GenerationLimitsDisplay';

interface StudioLandingViewProps {
  onSelectMode: (mode: string, modelId?: string, initialPrompt?: string) => void;
}

type Tab = 'featured' | 'chat' | 'images' | 'video' | 'audio' | 'code';

interface ModelCard {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  badge?: string;
}

interface ModelGroup {
  provider: string;
  models: ModelCard[];
}

export const StudioLandingView: React.FC<StudioLandingViewProps> = ({ onSelectMode }) => {
  const [activeTab, setActiveTab] = useState<Tab>('featured');
  const [expandedProviders, setExpandedProviders] = useState<string[]>(['OpenAI', 'Anthropic', 'Google']);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  const handleInputSubmit = () => {
    if (inputValue.trim() && !isLoading) {
      setIsLoading(true);
      // Start a new chat with the input message
      onSelectMode('chat', 'gpt-4o', inputValue.trim());
      setInputValue(''); // Clear input after submit
      // Reset after a delay as this usually triggers navigation
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  // Grouped chat models by provider - dynamically built from AI_MODELS
  const chatModelsFromLib = AI_MODELS.filter(m => m.category === 'chat' || m.category === 'code');

  // Group models by provider
  const providerMap = new Map<string, ModelCard[]>();
  chatModelsFromLib.forEach(model => {
    if (!providerMap.has(model.provider)) {
      providerMap.set(model.provider, []);
    }
    providerMap.get(model.provider)!.push({
      id: model.id,
      name: model.name,
      description: model.description,
      icon: model.category === 'code' ? Code : MessageSquare,
      category: model.category,
      badge: model.provider
    });
  });

  const chatModelGroups: ModelGroup[] = Array.from(providerMap.entries()).map(([provider, models]) => ({
    provider,
    models
  }));

  const tabs = [
    { id: 'featured' as Tab, label: 'Featured', icon: Sparkles },
    { id: 'chat' as Tab, label: 'Chat', icon: MessageSquare },
    { id: 'images' as Tab, label: 'Images', icon: Image },
    { id: 'video' as Tab, label: 'Video', icon: Video },
    { id: 'audio' as Tab, label: 'Audio', icon: Music },
    { id: 'code' as Tab, label: 'Code & PPT', icon: Code },
  ];

  const modelCards: Record<Tab, ModelCard[]> = {
    featured: [
      {
        id: 'openai/gpt-5.2',
        name: 'GPT-5.2',
        description: 'Latest OpenAI flagship with advanced reasoning tokens',
        icon: Zap,
        category: 'chat',
        badge: 'New'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Most capable GPT-4 model with vision, optimized for chat and complex tasks',
        icon: Zap,
        category: 'chat',
        badge: 'Recommended'
      },
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Latest Anthropic model with superior reasoning and coding capabilities',
        icon: Code,
        category: 'chat',
        badge: 'Popular'
      },
      {
        id: 'prime-intellect/intellect-3',
        name: 'INTELLECT-3',
        description: 'Advanced reasoning model with extended thinking capabilities',
        icon: Zap,
        category: 'chat',
        badge: 'Reasoning'
      },
      {
        id: 'flux-kontext',
        name: 'Flux Kontext Pro',
        description: 'Balanced image generation',
        icon: Image,
        category: 'image',
        badge: 'Image'
      },
      {
        id: '4o-image',
        name: 'GPT-4o Image',
        description: 'OpenAI GPT-4o image generation',
        icon: Image,
        category: 'image',
        badge: 'Image'
      },
      {
        id: 'veo3_fast',
        name: 'Veo 3.1 Fast',
        description: 'Google Veo 3.1 fast video generation',
        icon: Video,
        category: 'video',
        badge: 'Video'
      },
      {
        id: 'sora-2-text-to-video',
        name: 'Sora 2',
        description: 'OpenAI Sora cinematic video',
        icon: Video,
        category: 'video',
        badge: 'Video'
      },
      {
        id: 'suno',
        name: 'Suno AI',
        description: 'Generate complete songs with vocals and instruments',
        icon: Music,
        category: 'audio',
        badge: 'Audio'
      },
      {
        id: 'elevenlabs',
        name: 'Text to Speech',
        description: 'Professional voice synthesis with 10 voice options',
        icon: Mic,
        category: 'audio',
        badge: 'Voice'
      },
      {
        id: 'ppt-generator',
        name: 'PPT Generator',
        description: 'Create professional presentations with AI',
        icon: Presentation,
        category: 'code',
        badge: 'PPT'
      },
    ],
    chat: [],
    images: [
      {
        id: 'flux-kontext',
        name: 'Flux Kontext Pro',
        description: 'Balanced image generation',
        icon: Image,
        category: 'image',
        badge: 'Premium'
      },
      {
        id: '4o-image',
        name: 'GPT-4o Image',
        description: 'OpenAI GPT-4o image generation',
        icon: Image,
        category: 'image',
        badge: 'Premium'
      },
      {
        id: 'google/nano-banana',
        name: 'Nano Banana',
        description: 'Google Gemini-powered generation',
        icon: Image,
        category: 'image',
        badge: 'Fast'
      },
      {
        id: 'google/imagen4-ultra',
        name: 'Imagen 4 Ultra',
        description: 'Ultra-realistic Google Imagen 4',
        icon: Image,
        category: 'image',
        badge: 'Premium'
      },
      {
        id: 'seedream/4.5-text-to-image',
        name: 'Seedream 4.5',
        description: 'Artistic and creative generation',
        icon: Image,
        category: 'image',
        badge: 'Fast'
      },
      {
        id: 'grok-imagine/text-to-image',
        name: 'Grok Imagine',
        description: 'Grok-powered image generation',
        icon: Image,
        category: 'image',
        badge: 'Fast'
      },
    ],
    video: [
      {
        id: 'veo3_fast',
        name: 'Veo 3.1 Fast',
        description: 'Google Veo 3.1 fast generation',
        icon: Video,
        category: 'video',
        badge: 'Fast'
      },
      {
        id: 'veo3',
        name: 'Veo 3.1 Quality',
        description: 'Highest quality Google Veo',
        icon: Video,
        category: 'video',
        badge: 'Premium'
      },
      {
        id: 'sora-2-text-to-video',
        name: 'Sora 2',
        description: 'OpenAI Sora cinematic video',
        icon: Video,
        category: 'video',
        badge: 'Premium'
      },
      {
        id: 'wan/2-5-text-to-video',
        name: 'Wan 2.5',
        description: 'Creative video generation',
        icon: Video,
        category: 'video',
        badge: 'Fast'
      },
      {
        id: 'kling-2.6/text-to-video',
        name: 'Kling 2.6',
        description: 'Realistic video with audio',
        icon: Video,
        category: 'video',
        badge: 'Premium'
      },
      {
        id: 'grok-imagine/text-to-video',
        name: 'Grok Video',
        description: 'Grok-powered video generation',
        icon: Video,
        category: 'video',
        badge: 'Fast'
      },
      {
        id: 'runway-gen3',
        name: 'Runway Gen-3',
        description: 'Professional video generation',
        icon: Video,
        category: 'video',
        badge: 'Premium'
      },
    ],
    audio: [
      {
        id: 'suno',
        name: 'Suno AI Music',
        description: 'Generate complete songs with vocals and instruments',
        icon: Music,
        category: 'audio',
        badge: 'Music'
      },
      {
        id: 'elevenlabs',
        name: 'Text to Speech',
        description: 'Professional voice synthesis with 10 voice options',
        icon: Mic,
        category: 'audio',
        badge: 'Voice'
      },
    ],
    code: [
      {
        id: 'ppt-generator',
        name: 'PPT Generator',
        description: 'Create professional presentations with AI',
        icon: Presentation,
        category: 'code',
        badge: 'PPT'
      },
    ]
  };

  const handleCardClick = (card: ModelCard) => {
    if (isLoading) return;
    setIsLoading(true);
    console.log('🎯 Card clicked:', card.name, 'ID:', card.id, 'Category:', card.category);

    // Reset after delay
    setTimeout(() => setIsLoading(false), 2000);

    // Handle specific card routing
    let mode = card.category;

    // Route ElevenLabs to voice studio
    if (card.id === 'elevenlabs') {
      mode = 'voice';
    }
    // Route Suno to music studio
    else if (card.id === 'suno') {
      mode = 'music';
    }
    // Map other categories
    else {
      const categoryToMode: Record<string, string> = {
        'chat': 'chat',
        'image': 'image',
        'video': 'video',
        'audio': 'music',
        'code': 'code',
      };
      mode = categoryToMode[card.category] || card.category;
    }

    console.log('🔄 Mapped mode:', mode);

    // For chat mode, pass the selected model ID
    if (card.category === 'chat') {
      console.log('💬 Activating chat mode with model:', card.id);
      onSelectMode(mode, card.id);
    } else {
      // For other modes (image, video, audio, code), just pass the mode
      console.log('🎨 Activating studio mode:', mode);
      onSelectMode(mode, card.id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Fixed Header with Logo - Add left padding for hamburger on mobile */}
      <div className="flex items-center justify-between pl-14 pr-4 sm:px-6 py-2 sm:py-4 border-b border-white/10">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <img
            src="/Black_Blue_White_Modern_Simple_Minimal_Gradient_Circle__Neon_Technology__AI_Logo__1_-removebg-preview copy.png"
            alt="KroniQ"
            className="h-6 w-6 sm:h-10 sm:w-10 object-contain"
          />
          <span className="text-white text-sm sm:text-xl font-medium">KroniQ AI</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Very compact on mobile */}
        <div className="text-center pt-2 sm:pt-8 pb-1 sm:pb-4 px-2 sm:px-4">
          <h1 className="text-lg sm:text-5xl font-normal text-white mb-0.5 sm:mb-4">
            KroniQ AI Studio
          </h1>
          <p className="hidden sm:block text-gray-400 text-lg mb-6">
            Create anything with AI
          </p>
          <div className="flex justify-center">
            <GenerationLimitsDisplay />
          </div>
        </div>

        {/* Tabs - Horizontally Scrollable on Mobile, Centered on Desktop */}
        <div className="overflow-x-auto scrollbar-hide py-1 sm:pb-6 border-b border-white/10">
          <div className="flex items-center sm:justify-center gap-0.5 sm:gap-1 px-2 sm:px-4 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-all duration-200 whitespace-nowrap text-[10px] sm:text-sm ${activeTab === tab.id
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-2 sm:py-6">
          <div className="max-w-6xl mx-auto">
            {/* Show grouped models for Chat tab */}
            {activeTab === 'chat' ? (
              <div className="space-y-2 sm:space-y-4">
                {chatModelGroups.map((group) => (
                  <div key={group.provider} className="border border-white/10 rounded-lg sm:rounded-xl overflow-hidden bg-white/5">
                    {/* Provider Header - Clickable - Compact on mobile */}
                    <button
                      onClick={() => toggleProvider(group.provider)}
                      className="w-full flex items-center justify-between px-3 sm:px-6 py-2 sm:py-4 hover:bg-white/5 transition-colors"
                    >
                      <h3 className="text-xs sm:text-base font-semibold text-white">
                        {group.provider}
                      </h3>
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <span className="text-[10px] sm:text-sm text-white/50">{group.models.length} models</span>
                        {expandedProviders.includes(group.provider) ? (
                          <ChevronDown className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/50" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white/50" />
                        )}
                      </div>
                    </button>

                    {/* Models Grid - Collapsible - Compact on mobile */}
                    {expandedProviders.includes(group.provider) && (
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-4 p-2 sm:p-4 border-t border-white/10">
                        {group.models.map((card) => {
                          const Icon = card.icon;
                          return (
                            <button
                              key={card.id}
                              onClick={() => handleCardClick(card)}
                              className="group flex items-center gap-1.5 sm:gap-3 p-1.5 sm:p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left card-tilt"
                            >
                              {/* Icon */}
                              <div className="flex-shrink-0 p-1 sm:p-2 rounded sm:rounded-lg bg-white/10">
                                <Icon className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                              </div>

                              {/* Name only on mobile */}
                              <span className="text-[10px] sm:hidden font-medium text-white truncate">
                                {card.name}
                              </span>

                              {/* Full content on desktop */}
                              <div className="hidden sm:block flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-medium text-white">
                                    {card.name}
                                  </h3>
                                  {card.badge && (
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                                      {card.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                  {card.description}
                                </p>
                              </div>

                              {/* Arrow - Desktop only */}
                              <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Regular grid for other tabs - Original desktop, compact mobile */
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-4">
                {modelCards[activeTab].map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className="group relative flex items-center sm:items-start gap-1.5 sm:gap-4 p-2 sm:p-6 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 text-left card-tilt"
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 p-1 sm:p-3 rounded sm:rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors">
                        <Icon className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-0 sm:mb-2">
                          <h3 className="text-[10px] sm:text-lg font-medium text-white group-hover:text-white transition-colors truncate">
                            {card.name}
                          </h3>
                          {card.badge && (
                            <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded-full">
                              {card.badge}
                            </span>
                          )}
                        </div>
                        {/* Description - hidden on mobile only */}
                        <p className="hidden sm:block text-sm text-gray-400 group-hover:text-gray-300 transition-colors leading-relaxed line-clamp-2">
                          {card.description}
                        </p>
                      </div>

                      {/* Arrow - Hidden on mobile, shown on hover on desktop */}
                      <div className="hidden sm:block flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input */}
        <div className="border-t border-white/10 p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-end bg-[#0d1117]/80 rounded-xl input-gradient-border input-empty-pulse transition-all">
              <textarea
                value={inputValue}
                rows={1}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  // Auto-grow logic
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleInputSubmit();
                  }
                }}
                placeholder="Ask KroniQ anything..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-4 sm:px-6 py-3 sm:py-4 text-white text-sm sm:text-base placeholder-gray-500 focus:outline-none resize-none max-h-[150px] overflow-y-auto break-all whitespace-pre-wrap"
              />
              <button
                onClick={handleInputSubmit}
                disabled={!inputValue.trim() || isLoading}
                className={`m-1.5 sm:m-2 p-2 sm:p-2.5 rounded-lg transition-all duration-300 flex items-center justify-center ${!inputValue.trim() || isLoading
                  ? 'bg-white/10 text-white/30 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-700 text-white hover:from-violet-700 hover:to-indigo-800 shadow-[0_4px_12px_rgba(124,58,237,0.3)] hover:scale-105 active:scale-95'
                  }`}
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
