import { useState, useEffect, useRef } from 'react';
import { generateJournalImage, generateJournalAudio, generateSectionContent } from './services/geminiService';
import { motion, AnimatePresence } from 'motion/react';
import { Coffee, BookOpen, Share2, Download, Play, Pause, Facebook, Linkedin, Twitter, Globe, Shield, Cloud, Map, TrendingUp, Cpu, Info, Lightbulb } from 'lucide-react';
import Markdown from 'react-markdown';
import { Section, SectionData } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Section>('intro');
  const [sections, setSections] = useState<Partial<Record<Section, SectionData>>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [date] = useState(new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const tabs = [
    { id: 'intro', label: 'Édito', icon: BookOpen },
    { id: 'world', label: 'Monde', icon: Globe },
    { id: 'geopolitics', label: 'Géopolitique', icon: Shield },
    { id: 'weather', label: 'Météo & Belgique', icon: Cloud },
    { id: 'europe', label: 'Europe', icon: Map },
    { id: 'finance', label: 'Bourse & Crypto', icon: TrendingUp },
    { id: 'ai', label: 'IA & Futur', icon: Cpu },
  ];

  const fetchSection = async (sectionId: Section) => {
    if (sections[sectionId]) return;

    setIsLoading(true);
    setIsPlaying(false);
    try {
      const data = await generateSectionContent(sectionId);
      
      const [img, audio] = await Promise.all([
        generateJournalImage(data.summary),
        generateJournalAudio(`${data.title}. ${data.summary}. ${data.content}`)
      ]);

      setSections(prev => ({
        ...prev,
        [sectionId]: { ...data, audio, image: img }
      }));
    } catch (error) {
      console.error(`Error fetching ${sectionId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSection(activeTab);
  }, [activeTab]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadImage = () => {
    const currentImg = sections[activeTab]?.image;
    if (currentImg) {
      const link = document.createElement('a');
      link.href = currentImg;
      link.download = `le-contre-${activeTab}.png`;
      link.click();
    }
  };

  const share = (platform: string) => {
    const url = window.location.href;
    const text = `Le Contre - ${sections[activeTab]?.title || 'Journal'}. Par Atmani Bachir.`;
    let shareUrl = "";
    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const currentData = sections[activeTab];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-serif selection:bg-emerald-100">
      {/* Header */}
      <header className="border-b border-black/5 py-6 px-6 md:px-12 flex flex-col items-center gap-6 sticky top-0 bg-[#FDFCFB]/90 backdrop-blur-xl z-50">
        <div className="flex flex-col md:flex-row justify-between items-center w-full gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase italic">
              Le Contre
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] font-sans mt-1 opacity-60">
              6 AM • Par Atmani Bachir • IA Édition
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 font-sans text-[10px] uppercase tracking-widest opacity-70">
            <span>{date}</span>
          </div>
        </div>
        
        <div className="w-full relative">
          <nav className="flex items-center gap-2 bg-black/5 p-1 rounded-full overflow-x-auto max-w-full no-scrollbar scroll-smooth">
            <div className="flex items-center gap-2 min-w-max px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Section)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] uppercase tracking-wider font-sans transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-white text-emerald-700 shadow-sm font-bold' 
                    : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-6"
            >
              <Coffee className="w-10 h-10 text-emerald-600 animate-pulse" />
              <p className="italic text-base opacity-60 font-sans tracking-wide">Vérification des faits en temps réel...</p>
            </motion.div>
          ) : currentData ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                {currentData.title}
              </h2>

              {currentData.image && (
                <div className="relative group mb-10">
                  <img 
                    src={currentData.image} 
                    alt="Illustration" 
                    className="w-full aspect-video object-cover rounded-xl shadow-xl shadow-emerald-900/5"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={downloadImage}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}

              {currentData.audio && (
                <div className="mb-10 flex items-center gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                  <button 
                    onClick={toggleAudio}
                    className="bg-emerald-600 text-white p-2.5 rounded-full hover:bg-emerald-700 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <div className="flex-1">
                    <p className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-emerald-800">Version Audio</p>
                    <p className="text-[9px] font-sans opacity-50 italic">Vérifié par Google Search & IA</p>
                  </div>
                  <audio 
                    ref={audioRef} 
                    src={currentData.audio} 
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                </div>
              )}

              <article className="prose prose-stone prose-lg max-w-none">
                <div className="markdown-body leading-relaxed text-lg md:text-xl text-stone-800 dropcap mb-12">
                  <Markdown>{currentData.content}</Markdown>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="p-6 bg-stone-100 rounded-2xl border border-stone-200">
                    <div className="flex items-center gap-2 mb-3 text-emerald-700">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs uppercase font-sans font-bold tracking-widest">La Vérité Brute</span>
                    </div>
                    <p className="text-sm italic text-stone-600 leading-relaxed">
                      {currentData.truthContent}
                    </p>
                  </div>
                  <div className="p-6 bg-stone-100 rounded-2xl border border-stone-200">
                    <div className="flex items-center gap-2 mb-3 text-blue-700">
                      <Info className="w-4 h-4" />
                      <span className="text-xs uppercase font-sans font-bold tracking-widest">Faits Physiques</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {currentData.physicalFacts}
                    </p>
                  </div>
                </div>

                <div className="p-8 bg-emerald-900 text-emerald-50 rounded-2xl shadow-2xl mb-12">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm uppercase font-sans font-bold tracking-[0.2em]">Conseil Stratégique</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{currentData.strategicAdvice.action}</h4>
                  <p className="text-emerald-100/80 text-sm leading-relaxed">
                    {currentData.strategicAdvice.details}
                  </p>
                </div>
              </article>

              <div className="mt-16 pt-8 border-t border-black/5 flex flex-col items-center">
                <div className="flex gap-3">
                  <button onClick={() => share('facebook')} className="p-2.5 rounded-full bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button onClick={() => share('linkedin')} className="p-2.5 rounded-full bg-stone-100 text-stone-600 hover:bg-blue-50 hover:text-blue-700 transition-all">
                    <Linkedin className="w-4 h-4" />
                  </button>
                  <button onClick={() => share('twitter')} className="p-2.5 rounded-full bg-stone-100 text-stone-600 hover:bg-sky-50 hover:text-sky-500 transition-all">
                    <Twitter className="w-4 h-4" />
                  </button>
                  <button onClick={() => share('tiktok')} className="p-2.5 rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="mt-12 p-6 bg-stone-50 border border-stone-200 rounded-lg text-center">
                  <p className="text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-stone-600 mb-2">Certification d'Authenticité</p>
                  <p className="text-[11px] font-sans text-stone-500 leading-relaxed max-w-md mx-auto italic">
                    Le contenu de ce journal est généré en temps réel par intelligence artificielle à partir de sources mondiales vérifiées via Google Search. 
                    Toute invention de faits est strictement proscrite par nos protocoles de génération.
                  </p>
                </div>

                <div className="mt-8 text-center space-y-2">
                  <p className="opacity-40 font-sans text-[9px] uppercase tracking-[0.4em]">
                    © Atmani Bachir • Le Contre • Tous droits réservés
                  </p>
                  <p className="opacity-20 font-sans text-[8px] uppercase tracking-[0.1em] max-w-xs mx-auto">
                    Le contenu de cette application est strictement réservé à son usage exclusif. Toute reproduction, même partielle, est interdite sans autorisation préalable de l'auteur.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
