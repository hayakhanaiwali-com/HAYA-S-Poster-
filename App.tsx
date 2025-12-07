import React, { useState } from 'react';
import { GeneratedPosterState } from './types';
import { analyzeTextForPoster, generatePosterBackground } from './services/geminiService';
import { PosterPreview } from './components/PosterPreview';
import { Button } from './components/Button';
import { CheckCircle, Download, Image as ImageIcon, Sparkles, Type as TypeIcon } from 'lucide-react';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [state, setState] = useState<GeneratedPosterState>({
    config: null,
    backgroundImageUrl: null,
    isLoading: false,
    error: null,
    step: 'idle'
  });

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setState(prev => ({ ...prev, isLoading: true, error: null, step: 'analyzing' }));

    try {
      // Step 1: Analyze Text
      const config = await analyzeTextForPoster(inputText);
      setState(prev => ({ ...prev, config, step: 'generating_image' }));

      // Step 2: Generate Background Image
      // We start this immediately after but update state independently to show progress
      const imageUrl = await generatePosterBackground(config.imagePrompt);
      
      setState(prev => ({ 
        ...prev, 
        backgroundImageUrl: imageUrl, 
        isLoading: false, 
        step: 'complete' 
      }));

    } catch (error: any) {
      console.error("Generation failed", error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || "Failed to generate poster. Please check your API key and try again.",
        step: 'idle'
      }));
    }
  };

  const handleDownload = () => {
    // Basic implementation: Instruct user (since actual canvas capture requires heavy libs)
    alert("To save your poster, please right-click the image area or use your device's screenshot tool for the highest quality.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Gemini Poster Designer
            </h1>
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TypeIcon className="w-5 h-5 text-indigo-400" />
                Input Text
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="poster-text" className="block text-sm font-medium text-gray-400 mb-2">
                    What should your poster say?
                  </label>
                  <textarea
                    id="poster-text"
                    rows={4}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-lg"
                    placeholder="e.g. Save the Planet, Jazz Night, Summer Sale..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={100}
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Keep it punchy for best results.</span>
                    <span>{inputText.length}/100</span>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate} 
                  isLoading={state.isLoading}
                  className="w-full"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Poster
                </Button>
                
                {state.error && (
                   <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {state.error}
                   </div>
                )}
              </div>
            </div>

            {/* Analysis Results (Visible when generated) */}
            {state.config && (
              <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/30 animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">AI Design Analysis</h3>
                
                <div className="space-y-4">
                   <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
                         <span className="text-indigo-400 text-xs">Mood</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300">{state.config.moodDescription}</p>
                      </div>
                   </div>

                   <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                         <span className="text-purple-400 text-xs">Font</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 capitalize">{state.config.fontStyle.replace('font-', '')} Typography</p>
                      </div>
                   </div>

                   <div>
                      <p className="text-xs text-gray-500 mb-2">Color Palette</p>
                      <div className="flex gap-2">
                        {[
                          state.config.colorPalette.primary, 
                          state.config.colorPalette.secondary, 
                          state.config.colorPalette.accent,
                          state.config.colorPalette.text
                        ].map((color, i) => (
                          <div 
                            key={i} 
                            className="w-10 h-10 rounded-full border border-white/10 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Preview */}
          <div className="lg:col-span-8 flex flex-col items-center">
             <div className="w-full max-w-[600px] mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-200">Preview</h2>
                <div className="flex gap-2">
                  {state.step === 'complete' && (
                     <Button variant="secondary" onClick={handleDownload} className="!py-2 !px-4 text-sm">
                        <Download className="w-4 h-4" />
                        Save
                     </Button>
                  )}
                </div>
             </div>

             {/* Status Indicators */}
             <div className="w-full max-w-[600px] mb-4 flex items-center gap-4 text-sm text-gray-400 min-h-[24px]">
                {state.step !== 'idle' && (
                  <>
                    <span className={`flex items-center gap-2 ${state.step === 'analyzing' ? 'text-indigo-400 animate-pulse' : 'text-green-500'}`}>
                       {state.step === 'analyzing' ? <div className="w-2 h-2 rounded-full bg-indigo-400"/> : <CheckCircle className="w-4 h-4" />}
                       Analyzing Text
                    </span>
                    <span className="w-8 h-[1px] bg-gray-700"></span>
                    <span className={`flex items-center gap-2 ${state.step === 'generating_image' ? 'text-indigo-400 animate-pulse' : state.step === 'complete' ? 'text-green-500' : 'text-gray-600'}`}>
                       {state.step === 'generating_image' ? <div className="w-2 h-2 rounded-full bg-indigo-400"/> : state.step === 'complete' ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-700"/>}
                       Creating Art
                    </span>
                  </>
                )}
             </div>

             <PosterPreview 
               text={inputText} 
               config={state.config} 
               backgroundImageUrl={state.backgroundImageUrl}
               isLoading={state.isLoading}
             />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;