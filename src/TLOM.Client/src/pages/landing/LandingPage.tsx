import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Star, MessageSquare, Heart, ChevronRight, ChevronLeft, Layers, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/* ─── Floating Blob Component ─── */
function FloatingBlob({ className, delay = 0 }: { className: string, delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-[100px] opacity-40 pointer-events-none ${className}`}
      animate={{
        x: [0, 40, -30, 0],
        y: [0, -50, 30, 0],
        scale: [1, 1.2, 0.8, 1],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear",
        delay
      }}
    />
  );
}

export function LandingPage() {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'end center']
  });

  const yPath = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  // Fetch single entries showcase
  const { data: showcaseEntries } = useQuery({
    queryKey: ['public-showcase'],
    queryFn: async () => {
      const res = await apiClient.get('/api/entries/public-showcase');
      return res.data;
    }
  });

  // Fetch full timelines showcase
  const { data: showcaseTimelines } = useQuery({
    queryKey: ['public-showcase-timelines'],
    queryFn: async () => {
      const res = await apiClient.get('/api/entries/public-showcase-timelines');
      return res.data;
    }
  });

  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [currentTimelineIndex, setCurrentTimelineIndex] = useState(0);

  // Auto-rotate single entries
  useEffect(() => {
    if (!showcaseEntries || showcaseEntries.length === 0) return;
    const interval = setInterval(() => {
      setCurrentEntryIndex((prev) => (prev + 1) % showcaseEntries.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [showcaseEntries]);

  // Auto-rotate timelines
  useEffect(() => {
    if (!showcaseTimelines || showcaseTimelines.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTimelineIndex((prev) => (prev + 1) % showcaseTimelines.length);
    }, 10000); // 10 seconds for reading a full timeline
    return () => clearInterval(interval);
  }, [showcaseTimelines]);

  const handleNextTimeline = () => {
    if (!showcaseTimelines) return;
    setCurrentTimelineIndex((prev) => (prev + 1) % showcaseTimelines.length);
  };

  const handlePrevTimeline = () => {
    if (!showcaseTimelines) return;
    setCurrentTimelineIndex((prev) => (prev - 1 + showcaseTimelines.length) % showcaseTimelines.length);
  };

  return (
    <div className="flex flex-col w-full bg-background overflow-hidden relative">
      <FloatingBlob className="w-[600px] h-[600px] bg-primary/20 -top-40 -left-40" delay={0} />
      <FloatingBlob className="w-[800px] h-[800px] bg-accent/15 top-1/2 -right-40" delay={5} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4wNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-[0.04] pointer-events-none mix-blend-overlay" />

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 flex flex-col items-center w-full max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            {t('landing.badge')}
          </div>
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 text-foreground font-display leading-[1.1]">
            {t('landing.hero_title')} <br className="hidden md:block"/>
            <span className="text-gradient">{t('landing.hero_highlight')}</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground/80 font-medium max-w-3xl mb-12 leading-relaxed">
            {t('landing.hero_desc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Button asChild size="lg" className="rounded-2xl px-10 h-14 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1">
              <Link to="/register">{t('landing.start_btn')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-2xl px-10 h-14 text-lg font-bold border-border/60 hover:bg-card/50 backdrop-blur-sm transition-all hover:-translate-y-1">
              <Link to="/login">{t('landing.signin_btn')}</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ─── Live Community Single Entries Showcase ─── */}
      {showcaseEntries && showcaseEntries.length > 0 && (
        <section className="relative w-full py-24 px-4 bg-gradient-to-b from-transparent via-card/30 to-transparent border-y border-border/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold font-display mb-4">{t('landing.showcase_title')} <span className="text-gradient">{t('landing.showcase_highlight')}</span></h2>
              <p className="text-muted-foreground text-lg">{t('landing.showcase_desc')}</p>
            </div>

            <div className="relative flex items-center justify-center min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEntryIndex}
                  initial={{ opacity: 0, x: 100, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -100, filter: 'blur(10px)' }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-3xl absolute"
                >
                  <div className="glass-strong rounded-[2.5rem] p-6 md:p-10 shadow-2xl border border-white/10 relative overflow-hidden group">
                    {showcaseEntries[currentEntryIndex].mediaItemCoverImageUrl && (
                      <div 
                        className="absolute inset-0 opacity-[0.05] blur-3xl pointer-events-none transition-opacity group-hover:opacity-[0.1] duration-700"
                        style={{ backgroundImage: `url(${showcaseEntries[currentEntryIndex].mediaItemCoverImageUrl})`, backgroundSize: 'cover' }}
                      />
                    )}
                    
                    <div className="flex flex-col md:flex-row gap-8 relative z-10">
                      <div className="shrink-0 w-32 h-48 md:w-48 md:h-72 rounded-2xl overflow-hidden shadow-xl bg-muted border border-border/50 relative">
                        {showcaseEntries[currentEntryIndex].mediaItemCoverImageUrl ? (
                          <img src={showcaseEntries[currentEntryIndex].mediaItemCoverImageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground uppercase tracking-widest text-center bg-muted/50">
                            No Image
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest">
                          {showcaseEntries[currentEntryIndex].mediaType}
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {showcaseEntries[currentEntryIndex].userAvatarUrl ? (
                              <img src={showcaseEntries[currentEntryIndex].userAvatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-bold text-primary uppercase">{showcaseEntries[currentEntryIndex].userUsername?.charAt(0) || 'U'}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm">@{showcaseEntries[currentEntryIndex].userUsername}</div>
                            <div className="text-[11px] text-muted-foreground uppercase tracking-widest mt-0.5">Just added</div>
                          </div>
                        </div>

                        <h3 className="text-3xl md:text-4xl font-display font-extrabold mb-3 leading-[1.1]">
                          {showcaseEntries[currentEntryIndex].mediaItemTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mb-6">
                          <span className="text-[11px] font-bold px-3 py-1 rounded-lg bg-primary/10 text-primary uppercase tracking-widest">
                            {showcaseEntries[currentEntryIndex].status}
                          </span>
                          {showcaseEntries[currentEntryIndex].rating && (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-lg bg-yellow-500/10 text-yellow-600">
                              <Star className="w-3.5 h-3.5 fill-current" /> {showcaseEntries[currentEntryIndex].rating}/10
                            </span>
                          )}
                        </div>

                        {showcaseEntries[currentEntryIndex].review && (
                          <p className="text-muted-foreground italic border-l-2 border-primary/40 pl-4 text-sm md:text-base line-clamp-3 mb-6">
                            "{showcaseEntries[currentEntryIndex].review}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            
            <div className="flex justify-center gap-2 mt-8">
              {showcaseEntries.map((_: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentEntryIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentEntryIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Real User Timelines (How It Looks) ─── */}
      {showcaseTimelines && showcaseTimelines.length > 0 && (
        <section ref={containerRef} className="relative w-full py-32 px-4 overflow-hidden">
          <div className="text-center mb-24 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold font-display mb-4">{t('landing.how_it_looks_title')} <span className="text-gradient">{t('landing.how_it_looks_highlight')}</span></h2>
            <p className="text-muted-foreground text-lg">{t('landing.how_it_looks_desc')}</p>
          </div>

          <div className="relative max-w-5xl mx-auto">
            {/* Timeline User Controls */}
            <div className="flex items-center justify-between mb-12 relative z-20 bg-card/40 backdrop-blur-md p-4 rounded-[2rem] border border-border/50 shadow-sm">
              <button onClick={handlePrevTimeline} className="w-12 h-12 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentTimelineIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-2 border-primary/30">
                    {showcaseTimelines[currentTimelineIndex].avatarUrl ? (
                      <img src={showcaseTimelines[currentTimelineIndex].avatarUrl} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-primary uppercase">{showcaseTimelines[currentTimelineIndex].username.charAt(0)}</span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-0.5">Timeline of</div>
                    <div className="text-xl font-extrabold text-foreground">@{showcaseTimelines[currentTimelineIndex].username}</div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button onClick={handleNextTimeline} className="w-12 h-12 rounded-full bg-background/80 border border-border flex items-center justify-center hover:bg-muted transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              {/* Glowing Vertical Line */}
              <div className="absolute left-[30px] md:left-1/2 top-0 bottom-0 w-1.5 bg-muted/50 rounded-full overflow-hidden -translate-x-1/2">
                <motion.div 
                  className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-accent to-primary rounded-full"
                  style={{ height: yPath }}
                />
              </div>

              {/* Timeline Items Carousel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTimelineIndex}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(10px)' }}
                  transition={{ duration: 0.6 }}
                  className="flex flex-col gap-16 md:gap-24 relative z-10 py-10"
                >
                  {showcaseTimelines[currentTimelineIndex].entries.map((entry: any, index: number) => {
                    const isEven = index % 2 === 0;
                    return (
                      <TimelineItem key={entry.id} entry={entry} isEven={isEven} index={index} />
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            
            {/* Dots for Timelines */}
            <div className="flex justify-center gap-2 mt-12">
              {showcaseTimelines.map((_: any, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentTimelineIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${idx === currentTimelineIndex ? 'bg-primary w-8' : 'bg-muted-foreground/30 hover:bg-muted-foreground/60'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* ─── Call to Action ─── */}
      <section className="py-32 relative overflow-hidden border-t border-border/30">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl mx-auto">
          <Layers className="w-16 h-16 text-primary mb-8 opacity-80" />
          <h2 className="text-5xl md:text-6xl font-extrabold font-display mb-8">{t('landing.cta_title')} <span className="text-gradient">{t('landing.cta_highlight')}</span></h2>
          <Button asChild size="lg" className="rounded-2xl px-12 h-16 text-xl font-bold shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all">
            <Link to="/register">{t('landing.create_account')}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function TimelineItem({ entry, isEven, index }: { entry: any, isEven: boolean, index: number }) {
  // Generate random gradient for the card glow based on index
  const colors = [
    'from-blue-500/20 to-cyan-500/20',
    'from-emerald-500/20 to-green-500/20',
    'from-orange-500/20 to-red-500/20',
    'from-amber-500/20 to-yellow-500/20',
    'from-purple-500/20 to-pink-500/20'
  ];
  const color = colors[index % colors.length];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.3 }}
      className={`relative flex items-center ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row group`}
    >
      <div className="absolute left-[30px] md:left-1/2 w-8 h-8 rounded-full bg-background border-4 border-primary z-10 -translate-x-1/2 flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:scale-125 transition-transform duration-500">
        <div className="w-2 h-2 rounded-full bg-primary" />
      </div>
      
      <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-16 text-left' : 'md:pr-16 md:text-right'} pl-16`}>
        <div className="glass-strong rounded-3xl p-6 shadow-xl border border-white/5 relative overflow-hidden group-hover:-translate-y-2 transition-all duration-500 flex flex-col md:flex-row gap-5">
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />
          
          {/* Timeline Entry Image */}
          <div className="shrink-0 w-24 h-36 rounded-xl overflow-hidden bg-muted relative z-10 shadow-md">
             {entry.mediaItemCoverImageUrl ? (
               <img src={entry.mediaItemCoverImageUrl} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase text-center bg-muted/50 p-2">No Image</div>
             )}
          </div>

          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <h3 className="text-2xl font-display font-bold mb-2 text-foreground line-clamp-2">{entry.mediaItemTitle}</h3>
            
            <div className={`flex flex-wrap items-center gap-2 mb-3 ${isEven ? 'justify-start' : 'md:justify-end justify-start'}`}>
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md">{entry.status}</span>
              <span className="px-2.5 py-1 bg-muted/80 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-widest rounded-md">{entry.mediaType}</span>
            </div>

            {entry.review && (
               <p className="text-muted-foreground font-medium text-sm leading-relaxed line-clamp-3 italic mb-3">"{entry.review}"</p>
            )}

            <div className={`flex items-center gap-4 mt-auto opacity-70 ${isEven ? 'justify-start' : 'md:justify-end justify-start'}`}>
               <span className="flex items-center gap-1.5 text-xs font-bold"><Heart className="w-3.5 h-3.5" /> {entry.likesCount}</span>
               <span className="flex items-center gap-1.5 text-xs font-bold"><MessageSquare className="w-3.5 h-3.5" /> {entry.commentsCount}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
