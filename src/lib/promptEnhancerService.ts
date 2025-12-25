/**
 * Prompt Enhancer Service
 * Uses a free AI model to enhance prompts for better generation results
 */

import { getOpenRouterResponse } from './openRouterService';

interface EnhanceOptions {
    type: 'ppt' | 'image' | 'video' | 'music' | 'chat';
    prompt: string;
    maxLength?: number;
}

interface EnhancedPrompt {
    original: string;
    enhanced: string;
    suggestions?: string[];
}

// Free model for prompt enhancement - Llama 3.3 70B is fast and capable
const FREE_ENHANCER_MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

/**
 * Enhance a prompt for better AI generation results
 */
export async function enhancePrompt(options: EnhanceOptions): Promise<EnhancedPrompt> {
    const { type, prompt, maxLength = 500 } = options;

    if (!prompt.trim()) {
        return { original: prompt, enhanced: prompt };
    }

    // Type-specific enhancement instructions
    const typeInstructions: Record<string, string> = {
        ppt: `You are a presentation expert. Enhance this presentation topic to be more specific, engaging, and structured. Add relevant context, suggest subtopics, and make it clearer what the presentation should cover. Ensure it's suitable for a professional slide deck.`,

        image: `You are an expert prompt engineer for AI image generation. Enhance this image prompt to be more detailed and visually specific. Add style descriptors (e.g., "cinematic lighting", "8k resolution", "hyperrealistic"), mood, composition details, and artistic style. Keep it concise but descriptive.`,

        video: `You are a video production expert. Enhance this video prompt to be more specific about visual storytelling. Include camera angles, scene transitions, pacing, mood, and visual style. Make it suitable for AI video generation.`,

        music: `You are a music producer. Enhance this music prompt to be more specific about genre, tempo, instruments, mood, and style. Include descriptors like BPM range, key signature suggestions, and emotional tone.`,

        chat: `You are an expert prompt engineer. Enhance this prompt to be clearer, more specific, and better structured for an AI assistant. Add context where helpful and make the request more actionable.`
    };

    const systemPrompt = typeInstructions[type] || typeInstructions.chat;

    const enhancementPrompt = `${systemPrompt}

**Original Prompt:** "${prompt}"

**Instructions:**
1. Return ONLY the enhanced prompt - no explanations, no markdown, no quotes
2. Keep the core intent but make it more detailed and specific
3. Maximum ${maxLength} characters
4. Do not add any prefixes like "Enhanced:" or "Improved:"

Enhanced prompt:`;

    try {
        const response = await getOpenRouterResponse(
            enhancementPrompt,
            [],
            undefined,
            FREE_ENHANCER_MODEL
        );

        // Clean up the response
        let enhanced = response.trim();

        // Remove any common prefixes the model might add
        const prefixesToRemove = [
            'Enhanced prompt:',
            'Enhanced:',
            'Improved:',
            'Better version:',
            '"',
            "'"
        ];

        for (const prefix of prefixesToRemove) {
            if (enhanced.toLowerCase().startsWith(prefix.toLowerCase())) {
                enhanced = enhanced.slice(prefix.length).trim();
            }
        }

        // Remove trailing quotes
        enhanced = enhanced.replace(/["']$/, '').trim();

        // Ensure max length
        if (enhanced.length > maxLength) {
            enhanced = enhanced.slice(0, maxLength - 3) + '...';
        }

        return {
            original: prompt,
            enhanced: enhanced || prompt // Fallback to original if enhancement failed
        };

    } catch (error) {
        console.error('Prompt enhancement failed:', error);
        // Return original prompt if enhancement fails
        return {
            original: prompt,
            enhanced: prompt
        };
    }
}

/**
 * Quick enhancement for UI - returns enhanced prompt directly
 */
export async function quickEnhance(prompt: string, type: EnhanceOptions['type'] = 'chat'): Promise<string> {
    const result = await enhancePrompt({ type, prompt });
    return result.enhanced;
}
