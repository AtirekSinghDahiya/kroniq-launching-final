/**
 * Thinking Content Parser and Filter
 * Parses AI thinking/reasoning content and filters out backend details
 */

// Backend details that should be hidden from users
const HIDDEN_TERMS = [
    // AI Providers
    'openrouter', 'openai', 'anthropic', 'google', 'meta', 'x-ai', 'xai', 'deepseek', 'mistral',
    'cohere', 'nvidia', 'perplexity', 'qwen', 'alibaba', 'moonshot', 'moonshotai',
    // Model names
    'gpt-4', 'gpt-5', 'gpt-3.5', 'gpt4', 'gpt5', 'claude', 'gemini', 'grok', 'llama',
    'claude-3', 'claude-2', 'sonnet', 'opus', 'haiku', 'gemma', 'mistral-7b', 'nemotron',
    'o1', 'o1-mini', 'o1-pro', 'kimi', 'kimi-k2', 'kimi-vl',
    // Technical terms
    'api', 'backend', 'endpoint', 'token limit', 'context window', 'model id',
    'openrouter api', 'api key', 'inference', 'provider'
];

// Regex to match thinking blocks
const THINKING_PATTERNS = [
    /<think>([\s\S]*?)<\/think>/gi,
    /<thinking>([\s\S]*?)<\/thinking>/gi,
    /\[thinking\]([\s\S]*?)\[\/thinking\]/gi,
    /^(Alright,|Okay,|Let me think|I should|First,|Hmm,)[\s\S]*?(?=\n\n|\n(?=[A-Z]))/gim,
];

interface ParsedMessage {
    thinking: string | null;
    content: string;
    hasThinking: boolean;
}

/**
 * Filter out backend/technical details from text
 */
export function filterBackendDetails(text: string): string {
    if (!text) return text;

    let filtered = text;

    // Replace specific patterns that expose backend info
    const replacements: Array<[RegExp, string]> = [
        // "I'm powered by GPT-4" → "I'm KroniQ AI"
        [/I('m| am) (powered by|running on|using|built on|based on) (GPT-?[\d.]*|Claude[\w\s.-]*|Gemini[\w\s.-]*|Grok[\w\s.-]*|Llama[\w\s.-]*|DeepSeek[\w\s.-]*|Mistral[\w\s.-]*|Kimi[\w\s.-]*|OpenAI[\w\s.-]*|Anthropic[\w\s.-]*|Google[\w\s.-]*|Moonshot[\w\s.-]*)/gi, "I'm KroniQ AI"],

        // "GPT-4 from OpenAI" → "KroniQ AI"
        [/(GPT-?[\d.]*|Claude[\w\s.-]*|Gemini[\w\s.-]*|Grok[\w\s.-]*|Kimi[\w\s.-]*) (from|by|via) (OpenAI|Anthropic|Google|xAI|DeepSeek|Meta|Moonshot)/gi, "KroniQ AI"],

        // "As a GPT/Claude model" → "As KroniQ AI"
        [/As (a|an) (GPT|Claude|Gemini|Grok|Llama|Kimi|AI language)[\w\s.-]*(model|assistant)?/gi, "As KroniQ AI"],

        // "The OpenAI API" → "the KroniQ system"
        [/the (OpenRouter|OpenAI|Anthropic|Google|Meta|Moonshot) (API|system|backend)/gi, "the KroniQ system"],

        // Model version mentions
        [/\b(GPT-?4[o]?|GPT-?5[\d.]*|Claude-?3[\d.]*|Gemini-?[\d.]*|Grok-?[\d.]*|Llama-?[\d.]*|Kimi-?[\w]*)\b/gi, "KroniQ"],
    ];

    // Apply replacements
    for (const [pattern, replacement] of replacements) {
        filtered = filtered.replace(pattern, replacement);
    }

    return filtered;
}

/**
 * Parse message content to extract thinking and main content
 */
export function parseThinkingContent(content: string): ParsedMessage {
    if (!content) {
        return { thinking: null, content: '', hasThinking: false };
    }

    let thinkingText: string | null = null;
    let mainContent = content;

    // Try each thinking pattern
    for (const pattern of THINKING_PATTERNS) {
        const match = pattern.exec(content);
        if (match) {
            // Extract thinking content
            thinkingText = match[1] || match[0];
            // Remove thinking from main content
            mainContent = content.replace(pattern, '').trim();
            break;
        }
    }

    // Check for informal thinking patterns (starts with reasoning phrases)
    if (!thinkingText) {
        const informalThinkingMatch = content.match(/^(Alright,[\s\S]*?)(?=\n\n[A-Z]|\n[A-Z][a-z]+ [a-z])/);
        if (informalThinkingMatch && informalThinkingMatch[1].length > 100) {
            thinkingText = informalThinkingMatch[1];
            mainContent = content.replace(informalThinkingMatch[1], '').trim();
        }
    }

    // Filter thinking content to remove backend details
    if (thinkingText) {
        thinkingText = filterBackendDetails(thinkingText);
    }

    return {
        thinking: thinkingText,
        content: mainContent,
        hasThinking: thinkingText !== null && thinkingText.length > 50
    };
}

/**
 * Check if content contains thinking/reasoning
 */
export function hasThinkingContent(content: string): boolean {
    if (!content) return false;

    // Check for formal thinking tags
    for (const pattern of THINKING_PATTERNS) {
        if (pattern.test(content)) return true;
    }

    // Check for informal thinking patterns
    const informalIndicators = [
        /^Alright,.*(?:think|consider|analyze)/i,
        /^Okay,.*let me/i,
        /^First,.*I need to/i,
        /^Hmm,.*let me/i,
        /^Let me think/i,
        /I should.*(?:first|start|begin)/i,
    ];

    return informalIndicators.some(pattern => pattern.test(content));
}
