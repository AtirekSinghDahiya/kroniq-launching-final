import React, { useState, useEffect } from 'react';
import { Presentation, Loader, Download, Send, X, Plus, Eye, ChevronLeft, ChevronRight, Wand2, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';
import { useAuth } from '../../../contexts/AuthContext';
import { generatePPTXFile, downloadPPTX, GeneratedPPT } from '../../../lib/pptGenerationService';
import { createMessage, getUserProfile } from '../../../lib/firestoreService';
import { deductTokensForRequest } from '../../../lib/tokenService';
import { getModelCost } from '../../../lib/modelTokenPricing';
import { useStudioMode } from '../../../contexts/StudioModeContext';
import { createStudioProject, updateProjectState, loadProject, generateStudioProjectName, getUserProjects, StudioProject } from '../../../lib/studioProjectService';
import { THEME_PREVIEWS, analyzePromptForTheme, ThemeName } from '../../../lib/pptThemeIntelligence';
import { checkGenerationLimit, incrementGenerationCount } from '../../../lib/generationLimitsService';
import { getGenerationLimitMessage } from '../../../lib/unifiedGenerationService';
import { fetchAudioBlob } from '../../../lib/storageService';
import { StudioHeader, GenerationLimitData } from '../../Studio/StudioHeader';
import { quickEnhance } from '../../../lib/promptEnhancerService';

interface PPTStudioProps {
  onClose: () => void;
  projectId?: string;
  initialTopic?: string;
}

interface GeneratedPresentation {
  id: string;
  title: string;
  slideCount: number;
  timestamp: Date;
  data: GeneratedPPT; // Keep data for preview/regeneration fallback
  blob?: Blob; // Ephemeral
  storageUrl?: string; // Persistent
  projectId: string;
}

export const PPTStudio: React.FC<PPTStudioProps> = ({ onClose, projectId: initialProjectId, initialTopic }) => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { projectId: activeProjectId } = useStudioMode();
  const BUTTON_GRADIENT = 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500';

  const [prompt, setPrompt] = useState(initialTopic || '');
  const [slideCount, setSlideCount] = useState(10);
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProjectId || activeProjectId || null);
  const [presentations, setPresentations] = useState<GeneratedPresentation[]>([]);
  const [historyProjects, setHistoryProjects] = useState<StudioProject[]>([]);
  const [previewPresentation, setPreviewPresentation] = useState<GeneratedPresentation | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [includeAIImages, setIncludeAIImages] = useState(false);
  const [detectedTheme, setDetectedTheme] = useState<string | null>(null);
  const [pendingComment, setPendingComment] = useState('');
  const [limitInfo, setLimitInfo] = useState<string>('');
  const [generationLimit, setGenerationLimit] = useState<GenerationLimitData | undefined>(undefined);
  const [showThemeGrid, setShowThemeGrid] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await quickEnhance(prompt, 'ppt');
      setPrompt(enhanced);
      showToast('success', 'Prompt Enhanced!', 'AI improved your topic description');
    } catch (error) {
      console.error('Enhance failed:', error);
      showToast('error', 'Enhancement failed', 'Using original prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  useEffect(() => {
    if (prompt.trim().length > 10) {
      const analysis = analyzePromptForTheme(prompt);
      setDetectedTheme(analysis.recommendedTheme);
    } else setDetectedTheme(null);
  }, [prompt]);

  useEffect(() => {
    if (user?.uid) { loadData(); refreshProjects(); }
  }, [user]);

  useEffect(() => {
    if (initialProjectId && user?.uid) loadExistingProject(initialProjectId);
  }, [initialProjectId, user]);

  const refreshProjects = async () => {
    if (!user?.uid) return;
    const projectsResult = await getUserProjects(user.uid, 'ppt');
    if (projectsResult.success && projectsResult.projects) setHistoryProjects(projectsResult.projects);
  };

  const loadExistingProject = async (projectId: string) => {
    try {
      const result = await loadProject(projectId);
      if (result.success && result.project) {
        setCurrentProjectId(projectId);
        const state = result.project.session_state || {};
        setPrompt(state.prompt || '');

        const loadedPresentations = state.presentations || [];
        const reconstructedPresentations = await Promise.all(
          loadedPresentations.map(async (p: GeneratedPresentation) => {
            // Restore Blob: Try Storage URL first, then regenerate
            let blob = undefined;
            if (p.storageUrl) {
              try {
                const fetched = await fetchAudioBlob(p.storageUrl);
                if (fetched) blob = fetched;
              } catch (e) {
                console.warn(`Failed to fetch PPT blob for ${p.title}, upgrading to regeneration`, e);
              }
            }

            if (!blob && p.data) {
              console.log('🔄 Regenerating blob for presentation:', p.title);
              blob = await generatePPTXFile(p.data);
            }
            return { ...p, blob, timestamp: new Date(p.timestamp) };
          })
        );
        setPresentations(reconstructedPresentations);
      }
    } catch (error) { console.error('Error loading PPT project:', error); }
  };

  const saveProjectState = async (idToUse?: string | null, presentationsToSave?: GeneratedPresentation[], promptToSave?: string) => {
    if (!user?.uid) return null;
    const projectIdToCheck = idToUse || currentProjectId;
    const presentationsList = presentationsToSave || presentations;
    const promptText = promptToSave !== undefined ? promptToSave : prompt;

    // Remove blob, keep storageUrl and data
    const sanitizedPresentations = presentationsList.map(({ blob, ...rest }) => rest);

    const sessionState = { prompt: promptText, presentations: sanitizedPresentations };

    try {
      if (projectIdToCheck) {
        await updateProjectState({ projectId: projectIdToCheck, sessionState });
        return projectIdToCheck;
      } else {
        const projectName = generateStudioProjectName('ppt', promptText);
        const result = await createStudioProject({
          userId: user.uid,
          studioType: 'ppt',
          name: projectName,
          description: promptText,
          model: 'ppt-generator',
          sessionState
        });
        if (result.success && result.projectId) {
          setCurrentProjectId(result.projectId);
          showToast('success', 'Project Saved', 'Presentation saved');
          return result.projectId;
        }
      }
    } catch (error) { console.error('Error saving PPT project:', error); }
    return null;
  };

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      const profile = await getUserProfile(user.uid);
      if (profile) setTokenBalance((profile.tokensLimit || 0) - (profile.tokensUsed || 0));
      const limit = await checkGenerationLimit(user.uid, 'ppt');
      setLimitInfo(getGenerationLimitMessage('ppt', limit.isPaid, limit.current, limit.limit));
      setGenerationLimit({ current: limit.current, limit: limit.limit, isPaid: limit.isPaid });
    } catch (error) { console.error(error); }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) { showToast('error', 'Empty Prompt', 'Describe your topic'); return; }
    if (!user?.uid) { showToast('error', 'Login Required', 'Please log in'); return; }

    setIsGenerating(true);
    setProgress('Initializing...');

    try {
      let projectId = currentProjectId;
      if (!projectId) {
        projectId = await saveProjectState(null, [], prompt);
        if (!projectId) throw new Error("Could not create project");
        setCurrentProjectId(projectId);
      }

      await createMessage(projectId, 'user', prompt);

      // Use local PptxGenJS generation
      setProgress('Generating content with AI...');
      const { generatePPTContent } = await import('../../../lib/pptGenerationService');
      const pptData = await generatePPTContent({
        topic: prompt,
        slideCount,
        theme: selectedTheme,
        includeImages: true
      });

      setProgress('Creating PPTX file...');
      const blob = await generatePPTXFile(pptData);

      // Skip cloud upload if it's likely to fail (CORS issues)
      // Just use local blob storage which works fine
      setProgress('Finalizing...');
      let storageUrl = '';
      // Try upload with a short timeout (3 seconds)
      try {
        const { uploadStudioAsset } = await import('../../../lib/storageService');
        const uploadPromise = uploadStudioAsset(projectId, blob, 'other');
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timeout')), 3000)
        );
        const uploadRes = await Promise.race([uploadPromise, timeoutPromise]) as any;
        if (uploadRes?.success && uploadRes?.url) {
          storageUrl = uploadRes.url;
        }
      } catch (e) {
        console.warn("PPT cloud upload skipped (CORS/timeout):", e);
        // This is fine - the blob is still available for download
      }

      // Token Logic - fixed pricing for PPT generation
      const modelCost = getModelCost('ppt-generator');
      const baseTokens = modelCost?.tokensPerMessage || 5000;
      const slideCost = slideCount * 300;
      const promptCost = Math.ceil(prompt.length / 4);
      const tokensToDeduct = Math.ceil(baseTokens + slideCost + promptCost);

      await deductTokensForRequest(user.uid, 'ppt-generator', 'internal', tokensToDeduct, 'ppt');
      await loadData();

      const presentationData: GeneratedPresentation = {
        id: Date.now().toString(),
        title: pptData.title,
        slideCount: pptData.slides.length,
        timestamp: new Date(),
        data: pptData,
        blob,
        storageUrl,
        projectId
      };

      await createMessage(projectId, 'assistant', JSON.stringify({
        type: 'ppt', title: pptData.title, slideCount: pptData.slides.length, theme: pptData.theme
      }));

      const newPresentations = [presentationData, ...presentations];
      setPresentations(newPresentations);
      showToast('success', 'Generated!', `Used ${tokensToDeduct.toLocaleString()} tokens`);

      await saveProjectState(projectId, newPresentations, prompt);
      await incrementGenerationCount(user.uid, 'ppt');
      await refreshProjects();
      setPrompt('');

    } catch (error: any) {
      console.error('PPT generation error:', error);
      showToast('error', 'Failed', error?.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
      setProgress('');
    }
  };

  const handleDownload = (presentation: GeneratedPresentation) => {
    if (presentation.blob) {
      downloadPPTX(presentation.blob, `${presentation.title}_presentation`);
      showToast('success', 'Downloaded!', 'File saved');
    } else {
      showToast('error', 'Error', 'Presentation file not available');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black text-white font-sans overflow-hidden">
      <StudioHeader
        icon={Presentation}
        title="Presentation Studio"
        subtitle="AI PowerPoints"
        color="#F472B6"
        limitInfo={limitInfo}
        generationLimit={generationLimit}
        tokenBalance={tokenBalance}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[30%] right-[10%] w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-pink-900/10 rounded-full blur-[80px] md:blur-[120px]" />
          <div className="absolute bottom-[0%] left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-purple-900/10 rounded-full blur-[60px] md:blur-[100px]" />
        </div>

        {/* Sidebar */}
        <div className="hidden lg:flex lg:w-72 border-r border-white/5 flex-col bg-black/40 backdrop-blur-xl h-full z-10 transition-all">
          <div className="p-4 border-b border-white/5">
            <button
              onClick={() => { setPrompt(''); setPresentations([]); setCurrentProjectId(null); }}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 ${BUTTON_GRADIENT} text-white font-medium rounded-xl shadow-lg shadow-pink-500/20`}
            >
              <Plus className="w-4 h-4" /> New Presentation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {historyProjects.map(proj => (
              <div key={proj.id} onClick={() => loadExistingProject(proj.id)} className={`p-3 rounded-xl cursor-pointer transition-all border ${currentProjectId === proj.id ? 'bg-white/10 border-pink-500/50' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                <div className="font-medium text-sm text-white truncate mb-1">{proj.name.replace('Presentation: ', '')}</div>
                <div className="text-[10px] text-white/40">{new Date(proj.updatedAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center p-3 md:p-8 overflow-y-auto custom-scrollbar z-10 relative pb-40 md:pb-4">
          <div className="w-full max-w-4xl text-center mb-4 sm:mb-8">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] bg-gradient-to-tr from-pink-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Presentation className="w-8 h-8 sm:w-10 sm:h-10 text-pink-400" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2">AI Presentation Studio</h2>
            <p className="text-white/40 text-sm sm:text-base">Turn ideas into professional slides in seconds.</p>
          </div>

          {/* Input */}
          <div className="w-full max-w-4xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden backdrop-blur-md mb-4 sm:mb-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your presentation topic..."
              className="w-full h-20 sm:h-32 px-4 sm:px-6 py-3 sm:py-4 bg-transparent border-none text-white text-sm sm:text-base focus:outline-none resize-none"
              disabled={isGenerating}
            />

            <div className="px-3 sm:px-6 py-2 sm:py-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/20">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <select value={slideCount} onChange={e => setSlideCount(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none">
                  <option value={5}>5 slides</option>
                  <option value={8}>8 slides</option>
                  <option value={10}>10 slides</option>
                  <option value={12}>12 slides</option>
                </select>
                <button onClick={() => setShowThemeGrid(!showThemeGrid)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ background: THEME_PREVIEWS[selectedTheme]?.gradient || '#fff' }} />
                  <span className="capitalize">{selectedTheme}</span>
                  {detectedTheme && <span className="text-[10px] bg-green-500/20 text-green-400 px-1 rounded">AI</span>}
                </button>
                {showThemeGrid && (
                  <div className="absolute mt-12 bg-black/90 border border-white/20 rounded-xl p-4 z-50 shadow-2xl grid grid-cols-4 gap-2 w-96">
                    {Object.entries(THEME_PREVIEWS).map(([k, t]) => (
                      <button key={k} onClick={() => { setSelectedTheme(k as ThemeName); setShowThemeGrid(false); }} className={`p-2 rounded-lg border ${selectedTheme === k ? 'border-white/50 bg-white/10' : 'border-white/10'}`}>
                        <div className="h-6 rounded mb-1" style={{ background: t.gradient }} />
                        <span className="text-[10px] text-white/70 block truncate">{t.name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <button
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className={`p-2 rounded-lg hover:bg-white/10 transition-all ${isEnhancing ? 'text-purple-400 animate-pulse' : 'text-white/40 hover:text-purple-400'}`}
                  title="Enhance prompt with AI"
                >
                  <Wand2 className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-pink-500/10 flex items-center gap-2 w-full sm:w-auto justify-center ${isGenerating ? 'bg-white/10 text-white/30' : `${BUTTON_GRADIENT} text-white`}`}
              >
                {isGenerating ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isGenerating ? progress : 'Generate'}
              </button>
            </div>
          </div>

          {/* Results */}
          {presentations.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-6xl">
              {presentations.map(p => (
                <div key={p.id} className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-all">
                  <div className="aspect-video bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex items-center justify-center relative">
                    <Presentation className="w-12 h-12 text-white/30" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => { setPreviewPresentation(p); setCurrentSlideIndex(0); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"><Eye className="w-5 h-5" /></button>
                      <button onClick={() => handleDownload(p)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"><Download className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white truncate">{p.title}</h3>
                    <div className="flex justify-between mt-2 text-xs text-white/40">
                      <span>{p.slideCount} slides</span>
                      <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Fixed Bottom Input Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40">
          {showMobileInput && (
            <div className="p-3 border-b border-white/10 flex flex-wrap gap-2">
              <select value={slideCount} onChange={e => setSlideCount(parseInt(e.target.value))} className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white">
                <option value={5}>5 slides</option>
                <option value={8}>8 slides</option>
                <option value={10}>10 slides</option>
              </select>
              <button onClick={() => setShowThemeGrid(!showThemeGrid)} className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: THEME_PREVIEWS[selectedTheme]?.gradient || '#fff' }} />
                <span className="capitalize">{selectedTheme}</span>
              </button>
            </div>
          )}
          <div className="p-2 flex items-center gap-2">
            <button onClick={() => setShowMobileInput(!showMobileInput)} className="p-2 bg-white/5 rounded-lg border border-white/10">
              {showMobileInput ? <ChevronDown className="w-4 h-4 text-white/60" /> : <ChevronUp className="w-4 h-4 text-white/60" />}
            </button>
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your presentation..."
              className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 focus:border-pink-500/50 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none" disabled={isGenerating} />
            <button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()} className={`p-2.5 ${BUTTON_GRADIENT} rounded-xl shadow-lg disabled:opacity-40`}>
              {isGenerating ? <Loader className="w-5 h-5 animate-spin text-white" /> : <Send className="w-5 h-5 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewPresentation && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{previewPresentation.title}</h2>
            <button onClick={() => setPreviewPresentation(null)}><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 p-8 relative">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-4">{previewPresentation.data.slides[currentSlideIndex].title}</h3>
              <p className="text-white/60 max-w-2xl">{previewPresentation.data.slides[currentSlideIndex].content[0]}</p>
            </div>
            <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} className="absolute left-4 p-2 bg-black/50 rounded-full hover:bg-black/80"><ChevronLeft /></button>
            <button onClick={() => setCurrentSlideIndex(Math.min(previewPresentation.data.slides.length - 1, currentSlideIndex + 1))} className="absolute right-4 p-2 bg-black/50 rounded-full hover:bg-black/80"><ChevronRight /></button>
          </div>
          <div className="text-center mt-4 text-white/40">Slide {currentSlideIndex + 1} of {previewPresentation.data.slides.length}</div>
        </div>
      )}
    </div>
  );
};
