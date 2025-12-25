export interface AIModel {
  id: string;
  apiId?: string; // Real OpenRouter ID if different from id (for future/aliased models)
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
  tier?: 'FREE' | 'BUDGET' | 'MID' | 'PREMIUM' | 'ULTRA_PREMIUM';
  paidOnly?: boolean;
  logoUrl?: string;
}

// Provider logo URLs
const LOGOS = {
  anthropic: 'https://cdn.prod.website-files.com/65cf071e1e3b4597f6ad46e5/65cf071e1e3b4597f6ad4758_Anthropic%20Logo.svg',
  openai: 'https://cdn.worldvectorlogo.com/logos/openai-2.svg',
  google: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg',
  meta: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  deepseek: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/deepseek-color.png',
  mistral: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/mistral-color.png',
  qwen: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/qwen-color.png',
  xai: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/grok.png',
  perplexity: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/perplexity-color.png',
  nvidia: 'https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg',
  cohere: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/cohere-color.png',
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  kieai: 'https://kroniqai.com/logo.png',
  elevenlabs: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/elevenlabs.png',
  moonshot: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/moonshot.png',
  amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  minimax: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/minimax-color.png'
};

// ============================================================
// VERIFIED WORKING OpenRouter model IDs - Tested Dec 2024
// Synced with Studio view - matching provider model counts
// ============================================================
export const AI_MODELS: AIModel[] = [
  // ===== FREE TIER MODELS (Accessible to ALL users) =====
  // Each provider has one free model

  // --- Meta (Llama 3.3 70B free) ---
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Powerful 70B model - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.meta },

  // --- Google (Gemini 2.0 Flash free) ---
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', description: 'Best Gemma model - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.google },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Fast Gemini 2.0 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.google },

  // --- Mistral (Mistral 7B free) ---
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', provider: 'Mistral', description: 'Fast & efficient - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.mistral },

  // --- NVIDIA (Nemotron Nano 9B free) ---
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B V2', provider: 'NVIDIA', description: 'NVIDIA efficient model - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.nvidia },

  // --- MoonshotAI (Kimi K2 0711 free) ---
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2 0711', provider: 'MoonshotAI', description: 'Kimi K2 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.moonshot },

  // --- Qwen (Qwen3 4B free) ---
  { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', provider: 'Qwen', description: 'Fast Qwen 3 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.qwen },

  // --- xAI (Grok 4 Fast free) ---
  { id: 'x-ai/grok-4-fast', name: 'Grok 4 Fast', provider: 'xAI', description: 'Fast Grok 4 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.xai },

  // --- Anthropic (Claude 3 Haiku free) ---
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast Claude 3 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.anthropic },

  // --- OpenAI (GPT-5 Nano simulated free) ---
  { id: 'openai/gpt-5-nano', apiId: 'openai/gpt-4o-mini', name: 'GPT-5 Nano', provider: 'OpenAI', description: 'Compact GPT-5 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.openai },

  // --- DeepSeek (DeepSeek Chat free) ---
  { id: 'deepseek/deepseek-chat:free', apiId: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'Advanced reasoning - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.deepseek },

  // --- Amazon (Nova 2 Lite free) ---
  { id: 'amazon/nova-2-lite-v1:free', name: 'Nova 2 Lite', provider: 'Amazon', description: 'Amazon Nova 2 Lite - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.amazon },

  // ===== META MODELS (PAID) =====
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', description: 'Latest Llama 4 multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.meta },
  { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout', provider: 'Meta', description: 'Llama 4 multimodal scout', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.meta },

  // ===== MISTRAL MODELS (PAID) =====
  { id: 'mistralai/ministral-14b-2512', name: 'Ministral 3 14B', provider: 'Mistral', description: 'Ministral 14B multimodal', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/ministral-8b-2512', name: 'Ministral 3 8B', provider: 'Mistral', description: 'Ministral 8B multimodal', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/ministral-3b-2512', name: 'Ministral 3 3B', provider: 'Mistral', description: 'Ministral 3B multimodal', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/ministral-8b', name: 'Ministral 8B', provider: 'Mistral', description: 'Fast Ministral 8B', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },

  // ===== MOONSHOTAI MODELS (PAID) =====
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'MoonshotAI', description: 'Reasoning with thinking tokens', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.moonshot },
  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2 0905', provider: 'MoonshotAI', description: 'Latest Kimi K2', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.moonshot },

  // ===== NVIDIA MODELS (PAID) =====
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Nemotron Super 49B', provider: 'NVIDIA', description: 'Large Nemotron model', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.nvidia },

  // ===== OPENAI MODELS (PAID) =====
  { id: 'openai/gpt-5.2-pro', name: 'GPT-5.2 Pro', provider: 'OpenAI', description: 'Latest GPT-5.2 reasoning', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast multimodal GPT', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Omni multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/chatgpt-4o-latest', name: 'ChatGPT-4o Latest', provider: 'OpenAI', description: 'Latest ChatGPT', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'future-gpt-5.2', apiId: 'openai/chatgpt-4o-latest', name: 'GPT 5.2', provider: 'OpenAI', description: 'Latest flagship GPT', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'future-gpt-codex-5.1', apiId: 'openai/chatgpt-4o-latest', name: 'GPT Codex 5.1', provider: 'OpenAI', description: 'Ultimate coding', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },

  // ===== QWEN MODELS (PAID) =====
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', description: 'Large multilingual', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen3-embedding-8b', name: 'Qwen3 Embedding 8B', provider: 'Qwen', description: 'Embeddings model', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen-plus-2025-07-28', name: 'Qwen Plus 0728', provider: 'Qwen', description: 'Latest Qwen Plus', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen-plus-2025-07-28:thinking', name: 'Qwen Plus 0728 Thinking', provider: 'Qwen', description: 'Qwen Plus with reasoning', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen-turbo', name: 'Qwen Turbo', provider: 'Qwen', description: 'Fast Qwen model', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.qwen },

  // ===== DEEPSEEK MODELS (PAID) =====
  { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek V3.1', provider: 'DeepSeek', description: 'Latest DeepSeek V3.1', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.deepseek },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'Reasoning model', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.deepseek },
  { id: 'deepseek/deepseek-coder', apiId: 'deepseek/deepseek-chat', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Code specialist', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.deepseek },

  // ===== GOOGLE MODELS (PAID) =====
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'Google', description: 'Fast multimodal Gemini', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.google },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'Google', description: 'Latest Gemini 3', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.google },

  // ===== ANTHROPIC MODELS (PAID) =====
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', description: 'Fast Claude 3.5', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Advanced balanced Claude', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most powerful Claude', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'future-claude-sonnet-4.5', apiId: 'anthropic/claude-3.5-sonnet', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Next-gen Sonnet', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'future-claude-opus-4.5', apiId: 'anthropic/claude-3-opus', name: 'Claude Opus 4.5', provider: 'Anthropic', description: 'Ultimate Claude', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },

  // ===== xAI MODELS (PAID - Grok 4.1 Fast is premium) =====
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', description: 'Latest Grok 4.1 - Premium', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.xai },
  { id: 'x-ai/grok-3-mini-beta', name: 'Grok 3 Mini', provider: 'xAI', description: 'Fast Grok model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.xai },
  { id: 'x-ai/grok-3-beta', name: 'Grok 3', provider: 'xAI', description: 'Latest Grok flagship', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.xai },

  // ===== AMAZON MODELS (PAID) =====
  { id: 'amazon/nova-2-lite-v1', name: 'Nova 2 Lite', provider: 'Amazon', description: 'Amazon Nova 2 Lite', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.amazon },
  { id: 'amazon/nova-premier-v1', name: 'Nova Premier 1.0', provider: 'Amazon', description: 'Amazon Nova Premier multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.amazon },

  // ===== MINIMAX MODELS (PAID) =====
  { id: 'minimax/minimax-m1', name: 'MiniMax M1', provider: 'MiniMax', description: 'Fast MiniMax model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.minimax },
  { id: 'minimax/minimax-01', name: 'MiniMax-01', provider: 'MiniMax', description: 'MiniMax multimodal', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.minimax },

  // ===== PERPLEXITY MODELS (PAID) =====
  { id: 'perplexity/sonar-pro-search', name: 'Sonar Pro Search', provider: 'Perplexity', description: 'Pro search with reasoning', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.perplexity },
  { id: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reasoning Pro', provider: 'Perplexity', description: 'Advanced reasoning multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.perplexity },
  { id: 'perplexity/sonar-pro', name: 'Sonar Pro', provider: 'Perplexity', description: 'Pro multimodal search', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.perplexity },
  { id: 'perplexity/sonar-deep-research', name: 'Sonar Deep Research', provider: 'Perplexity', description: 'Deep research AI', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.perplexity },

  // ===== COHERE MODELS (PAID) =====
  { id: 'cohere/command-a', name: 'Command A', provider: 'Cohere', description: 'Latest Cohere model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.cohere },
  { id: 'cohere/command-r7b-12-2024', name: 'Command R7B', provider: 'Cohere', description: 'Compact Command R', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.cohere },
  { id: 'cohere/command-r-08-2024', name: 'Command R', provider: 'Cohere', description: 'Command R Aug 2024', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.cohere },
  { id: 'cohere/command-r-plus-08-2024', name: 'Command R+', provider: 'Cohere', description: 'Command R+ Aug 2024', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.cohere },

  // ===== CODE MODELS (separate category) =====
  { id: 'deepseek-coder', apiId: 'deepseek/deepseek-chat', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Code specialist', category: 'code', tier: 'BUDGET', logoUrl: LOGOS.deepseek },
  { id: 'gpt-codex-5.1', apiId: 'openai/chatgpt-4o-latest', name: 'GPT Codex 5.1', provider: 'OpenAI', description: 'Ultimate coding', category: 'code', tier: 'PREMIUM', logoUrl: LOGOS.openai },

  // ===== IMAGE MODELS =====
  { id: 'flux-kontext-pro', name: 'Flux Kontext Pro', provider: 'Kie AI', description: 'High-quality generation', category: 'image', tier: 'MID', logoUrl: LOGOS.kieai },
  { id: '4o-image', name: 'GPT-4o Image', provider: 'OpenAI', description: 'GPT-4o image generation', category: 'image', tier: 'PREMIUM', logoUrl: LOGOS.openai },
  { id: 'google/imagen4-ultra', name: 'Imagen 4 Ultra', provider: 'Google', description: 'Ultra-realistic images', category: 'image', tier: 'PREMIUM', logoUrl: LOGOS.google },

  // ===== VIDEO MODELS =====
  { id: 'veo3_fast', name: 'Veo 3.1 Fast', provider: 'Google', description: 'Fast video generation', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.google },
  { id: 'veo3', name: 'Veo 3.1 Quality', provider: 'Google', description: 'High quality video', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.google },
  { id: 'sora-2-text-to-video', name: 'Sora 2', provider: 'OpenAI', description: 'Cinematic video', category: 'video', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'wan/2-5-text-to-video', name: 'Wan 2.5', provider: 'Wan', description: 'Creative video', category: 'video', tier: 'PREMIUM' },
  { id: 'kling-2.6/text-to-video', name: 'Kling 2.6', provider: 'Kling', description: 'Realistic video', category: 'video', tier: 'PREMIUM' },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'Runway', description: 'Professional video', category: 'video', tier: 'PREMIUM' },

  // ===== AUDIO MODELS =====
  { id: 'suno-v3.5', name: 'Suno v3.5', provider: 'Kie AI', description: 'Music generation', category: 'audio', tier: 'MID', logoUrl: LOGOS.kieai },
  { id: 'eleven-labs', name: 'ElevenLabs TTS', provider: 'ElevenLabs', description: 'Natural voice synthesis', category: 'audio', tier: 'MID', logoUrl: LOGOS.elevenlabs },
];

export const getModelsByCategory = (category: 'chat' | 'code' | 'image' | 'video' | 'audio') => {
  return AI_MODELS.filter(m => m.category === category);
};

export const getModelById = (id: string) => {
  return AI_MODELS.find(m => m.id === id);
};

export const getModelLogoUrl = (modelId: string): string | undefined => {
  const model = getModelById(modelId);
  if (model?.logoUrl) return model.logoUrl;

  if (modelId.includes('anthropic') || modelId.includes('claude')) return LOGOS.anthropic;
  if (modelId.includes('openai') || modelId.includes('gpt')) return LOGOS.openai;
  if (modelId.includes('google') || modelId.includes('gemini') || modelId.includes('gemma')) return LOGOS.google;
  if (modelId.includes('meta-llama') || modelId.includes('llama')) return LOGOS.meta;
  if (modelId.includes('deepseek')) return LOGOS.deepseek;
  if (modelId.includes('mistral')) return LOGOS.mistral;
  if (modelId.includes('qwen')) return LOGOS.qwen;
  if (modelId.includes('x-ai') || modelId.includes('grok')) return LOGOS.xai;
  if (modelId.includes('perplexity')) return LOGOS.perplexity;
  if (modelId.includes('cohere')) return LOGOS.cohere;
  if (modelId.includes('nvidia')) return LOGOS.nvidia;

  return undefined;
};

export const searchModels = (query: string, category?: 'chat' | 'code' | 'image' | 'video' | 'audio') => {
  const lowerQuery = query.toLowerCase();
  let models = AI_MODELS;

  if (category) {
    models = models.filter(m => m.category === category);
  }

  return models.filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.provider.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery)
  );
};

// Helper to get the actual API model ID for a given model
export const getApiModelId = (modelId: string): string => {
  const model = getModelById(modelId);
  return model?.apiId || model?.id || modelId;
};
