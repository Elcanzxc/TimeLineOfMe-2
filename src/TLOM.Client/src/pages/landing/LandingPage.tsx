import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { Link } from 'react-router-dom';

const timelineData = [
  { year: 2005, title: 'Batman Begins', type: 'Movie', desc: 'The start of an amazing journey.' },
  { year: 2011, title: 'Skyrim', type: 'Game', desc: 'A whole new world opened up.' },
  { year: 2015, title: 'The Witcher 3', type: 'Game', desc: 'Masterpiece of storytelling.' },
  { year: 2021, title: 'Dune', type: 'Movie', desc: 'Cinematic perfection.' },
  { year: 2024, title: 'Final Fantasy VII Rebirth', type: 'Game', desc: 'Nostalgia meets modern.' }
];

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const yPath = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="flex flex-col w-full bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10 flex flex-col items-center"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-foreground">
            Your Life in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Media</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Track the movies, games, books, and music that shaped who you are. Create your beautiful timeline, share it with friends, and discover new experiences.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg" className="rounded-full px-8 text-lg shadow-lg">
              <Link to="/register">Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 text-lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </motion.div>

        {/* Abstract Background Elements */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
      </section>

      {/* Scroll-driven Timeline Demo */}
      <section ref={containerRef} className="relative w-full max-w-4xl mx-auto py-32 px-4">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-bold">How it looks</h2>
          <p className="text-muted-foreground mt-2">A timeline of your greatest memories</p>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-1 bg-muted rounded-full overflow-hidden -translate-x-1/2">
            <motion.div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary to-accent rounded-full"
              style={{ height: yPath }}
            />
          </div>

          {/* Timeline Items */}
          <div className="flex flex-col gap-24">
            {timelineData.map((item, index) => {
              const isEven = index % 2 === 0;
              return (
                <TimelineItem key={index} item={item} isEven={isEven} index={index} />
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-32 flex flex-col items-center justify-center bg-muted/30 text-center px-4">
        <h2 className="text-4xl font-bold mb-6">Ready to build your timeline?</h2>
        <Button asChild size="lg" className="rounded-full px-10">
          <Link to="/register">Create Account</Link>
        </Button>
      </section>
    </div>
  );
}

function TimelineItem({ item, isEven, index }: { item: any, isEven: boolean, index: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative flex items-center ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} flex-row`}
    >
      {/* Circle Marker */}
      <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full bg-background border-4 border-primary z-10 -translate-x-1/2" />
      
      {/* Content */}
      <div className={`w-full md:w-1/2 ${isEven ? 'md:pl-12 text-left' : 'md:pr-12 md:text-right'} pl-12`}>
        <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
          <span className="text-sm font-bold text-primary mb-1 block">{item.year}</span>
          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
          <span className="inline-block px-2 py-1 bg-muted text-xs rounded-md mb-3">{item.type}</span>
          <p className="text-muted-foreground text-sm">{item.desc}</p>
        </div>
      </div>
    </motion.div>
  );
}
