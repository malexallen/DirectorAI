import React, { useState, useRef } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import TreatmentView from './components/TreatmentView';
import VideoPreview from './components/VideoPreview';
import PromptModal from './components/PromptModal';
import { generateTreatment, generateConceptVideo, extractVideoPrompt } from './services/geminiService';
import { SongMetadata, VideoGenerationState } from './types';

const App: React.FC = () => {
  const [isProcessingText, setIsProcessingText] = useState(false);
  const [treatment, setTreatment] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proposedPrompt, setProposedPrompt] = useState('');

  const [videoState, setVideoState] = useState<VideoGenerationState>({
    isGenerating: false,
    videoUrl: null,
    error: null,
    statusMessage: ''
  });

  const resultRef = useRef<HTMLDivElement>(null);

  const handleFormSubmit = async (data: SongMetadata, audioFile?: File) => {
    setIsProcessingText(true);
    setTreatment(null);
    setVideoState(prev => ({ ...prev, videoUrl: null, error: null }));

    try {
      const text = await generateTreatment(data, audioFile);
      setTreatment(text);
      
      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error(error);
      alert("Failed to generate treatment. Please check your API Key.");
    } finally {
      setIsProcessingText(false);
    }
  };

  const handleOpenVideoConfig = () => {
    if (!treatment) return;
    
    const extractedPrompt = extractVideoPrompt(treatment);
    setProposedPrompt(extractedPrompt);
    setIsModalOpen(true);
  };

  const handleConfirmGenerateVideo = async (finalPrompt: string) => {
    setIsModalOpen(false);
    
    setVideoState({
      isGenerating: true,
      videoUrl: null,
      error: null,
      statusMessage: 'Initializing...'
    });

    try {
      const url = await generateConceptVideo(finalPrompt, (status) => {
        setVideoState(prev => ({ ...prev, statusMessage: status }));
      });
      setVideoState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        videoUrl: url 
      }));
    } catch (error: any) {
      setVideoState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error.message || "Failed to generate video"
      }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col gap-8 relative">
        
        <section className="max-w-4xl mx-auto w-full">
          <div className="mb-8 text-center">
             <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Create your masterpiece.</h2>
             <p className="text-zinc-400 max-w-xl mx-auto">
               Upload your track or describe your vision. Our AI director will generate a complete visual treatment and concept scene.
             </p>
          </div>
          
          <InputForm 
            onSubmit={handleFormSubmit} 
            isProcessing={isProcessingText} 
          />
        </section>

        {treatment && (
          <section ref={resultRef} className="max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-10 duration-700">
            <TreatmentView 
              content={treatment} 
              onGenerateVideo={handleOpenVideoConfig}
              isVideoLoading={videoState.isGenerating}
              hasVideo={!!videoState.videoUrl}
            />
          </section>
        )}
      </main>

      <VideoPreview videoState={videoState} />

      <PromptModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmGenerateVideo}
        initialPrompt={proposedPrompt}
      />
      
      <footer className="border-t border-zinc-900 py-6 text-center text-zinc-600 text-sm">
        &copy; {new Date().getFullYear()} AI Music Video Director. Built with Google Gemini & Veo.
      </footer>
    </div>
  );
};

export default App;