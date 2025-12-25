/**
 * PPT.AI API Service
 * Uses PPT.AI for professional presentation generation
 */

// API Configuration
const PPT_AI_BASE_URL = 'https://developer.ppt.ai';
const PPT_AI_API_SECRET = import.meta.env.VITE_PPT_AI_API_SECRET || '';

// Headers required by the API
const getHeaders = () => ({
    'Api-Secret': PPT_AI_API_SECRET,
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
});

// Types
export interface PPTAITask {
    id: string;
}

export interface PPTAITemplate {
    id: string | number;
    cover: string;
    lang: string;
    category: string;
    style: string;
    color: string;
}

export interface PPTAIGenerationOptions {
    topic: string;
    slideCount?: number;
    length?: 'short' | 'medium' | 'long';
    scene?: string;
    audience?: string;
    lang?: string;
    templateId?: string | number;
}

// Create a new task
export async function createPPTTask(
    type: 'text' | 'url' | 'file' = 'text',
    content?: string,
    file?: File
): Promise<string> {
    console.log('📊 Creating PPT.AI task:', { type, hasContent: !!content, hasFile: !!file });

    const formData = new FormData();
    formData.append('type', type);

    if (type === 'text' && content) {
        formData.append('content', content.substring(0, 20000)); // Max 20k chars
    } else if (type === 'url' && content) {
        formData.append('content', content);
    } else if (type === 'file' && file) {
        formData.append('file', file);
    }

    const response = await fetch(`${PPT_AI_BASE_URL}/api/ppt/createTask`, {
        method: 'POST',
        headers: {
            'Api-Secret': PPT_AI_API_SECRET,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData,
    });

    const data = await response.json();
    console.log('📊 Create task response:', data);

    if (data.code !== 200) {
        throw new Error(data.message || 'Failed to create PPT task');
    }

    return data.data.id;
}

// Generate outline/content using streaming
export async function generatePPTContent(
    taskId: string,
    options: {
        length?: 'short' | 'medium' | 'long';
        scene?: string;
        audience?: string;
        lang?: string;
        prompt?: string;
    } = {}
): Promise<string> {
    console.log('📊 Generating PPT content for task:', taskId);

    const response = await fetch(`${PPT_AI_BASE_URL}/api/ppt/generateContent`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            id: taskId,
            length: options.length || 'medium',
            scene: options.scene || null,
            audience: options.audience || null,
            lang: options.lang || 'en',
            prompt: options.prompt?.substring(0, 50) || null,
        }),
    });

    if (!response.ok) {
        throw new Error(`Content generation failed: ${response.status}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let markdownContent = '';

    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = decoder.decode(value, { stream: true });
            const lines = text.split('\n').filter(line => line.trim());

            for (const line of lines) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.text) {
                        markdownContent += parsed.text;
                    }
                } catch {
                    // Not JSON, might be raw text
                    markdownContent += line;
                }
            }
        }
    }

    console.log('📊 Generated markdown content length:', markdownContent.length);
    return markdownContent;
}

// Get available templates
export async function getPPTTemplates(
    page: number = 1,
    size: number = 20,
    options: { lang?: string; category?: string; style?: string; themeColor?: string } = {}
): Promise<PPTAITemplate[]> {
    console.log('📊 Fetching PPT templates...');

    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(options.lang && { lang: options.lang }),
        ...(options.category && { category: options.category }),
        ...(options.style && { style: options.style }),
        ...(options.themeColor && { themeColor: options.themeColor }),
    });

    const response = await fetch(`${PPT_AI_BASE_URL}/api/ppt/templates?${params}`, {
        headers: {
            'Api-Secret': PPT_AI_API_SECRET,
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const data = await response.json();

    if (data.code !== 200) {
        console.warn('Failed to fetch templates:', data.message);
        return [];
    }

    return data.data.templates || [];
}

// Generate the PPTX file
export async function generatePPTXWithAPI(
    taskId: string,
    templateId: string | number,
    markdownContent: string
): Promise<string> {
    console.log('📊 Generating PPTX file...');

    const response = await fetch(`${PPT_AI_BASE_URL}/api/ppt/generatePptx`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            task_id: taskId,
            template_id: templateId.toString(),
            content: markdownContent,
        }),
    });

    const data = await response.json();
    console.log('📊 Generate PPTX response:', data);

    if (data.code !== 200) {
        throw new Error(data.message || 'Failed to generate PPTX');
    }

    return data.data.id;
}

// Get download link for the PPT
export async function getPPTDownloadLink(pptId: string): Promise<string> {
    console.log('📊 Getting PPT download link for:', pptId);

    const response = await fetch(`${PPT_AI_BASE_URL}/api/ppt/downloadPptx?id=${pptId}`, {
        headers: {
            'Api-Secret': PPT_AI_API_SECRET,
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    const data = await response.json();
    console.log('📊 Download link response:', data);

    if (data.code !== 200) {
        throw new Error(data.message || 'Failed to get download link');
    }

    return data.data.link;
}

// High-level function to generate a complete PPT
export async function generateCompletePPT(
    options: PPTAIGenerationOptions
): Promise<{ downloadUrl: string; markdownContent: string; pptId: string }> {
    console.log('📊 Starting complete PPT generation:', options);

    // Step 1: Create task
    const taskId = await createPPTTask('text', options.topic);
    console.log('✅ Task created:', taskId);

    // Step 2: Generate content
    const markdownContent = await generatePPTContent(taskId, {
        length: options.length || 'medium',
        lang: options.lang || 'en',
        prompt: options.topic.substring(0, 50),
    });
    console.log('✅ Content generated:', markdownContent.substring(0, 100));

    // Step 3: Get a template (use first available or provided)
    let templateId = options.templateId;
    if (!templateId) {
        const templates = await getPPTTemplates(1, 10, { lang: 'en' });
        if (templates.length > 0) {
            templateId = templates[0].id;
            console.log('✅ Using template:', templateId);
        } else {
            // Default template ID if none available
            templateId = '1792803733332242432';
        }
    }

    // Step 4: Generate PPTX
    const pptId = await generatePPTXWithAPI(taskId, templateId, markdownContent);
    console.log('✅ PPTX generated:', pptId);

    // Step 5: Get download link
    const downloadUrl = await getPPTDownloadLink(pptId);
    console.log('✅ Download URL:', downloadUrl);

    return {
        downloadUrl,
        markdownContent,
        pptId,
    };
}

// Download the PPT file as a blob
export async function downloadPPTAsBlob(downloadUrl: string): Promise<Blob> {
    console.log('📥 Downloading PPT from:', downloadUrl);

    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error(`Failed to download PPT: ${response.status}`);
    }

    return await response.blob();
}
