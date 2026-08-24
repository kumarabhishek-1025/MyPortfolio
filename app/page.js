'use client';
import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Github, ExternalLink, Mail, Linkedin, Code2, Cpu, Rocket, Trophy,
  ArrowRight, MapPin, Calendar, Sparkles as SparklesIcon, Zap, Brain,
  Terminal, Box, Satellite, Loader2, Play, BarChart3, BadgeCheck
} from 'lucide-react';

const HeroScene = dynamic(() => import('@/components/three/HeroScene'), { ssr: false, loading: () => null });
const GuidePath = dynamic(() => import('@/components/three/GuidePath'), { ssr: false, loading: () => null });

// ============ SEED DATA (from resume) ============
const PROFILE = {
  name: 'Kumar Abhishek',
  tagline: 'Computer Science Engineer — AI & Robotics',
  summary: 'Third-year CS engineer building AI-powered products end-to-end — from dual-LLM interview systems to civic-tech geospatial platforms — with 1,100+ LeetCode problems solved and multiple national/global hackathon podiums.',
  education: 'B.Tech CSE (AI & Robotics), VIT Chennai — graduating 2028',
  cgpa: '10.0/10.0 (core CS) · 8.47/10 overall',
  location: 'Chennai, India',
};

const STATS = [
  { value: '10.0', suffix: '', label: 'CGPA (Core CS)', icon: Trophy },
  { value: '1100', suffix: '+', label: 'LeetCode Solved', icon: Code2 },
  { value: '5', suffix: '+', label: 'Projects Shipped', icon: Rocket },
  { value: '3', suffix: 'rd', label: 'Global Hackathon (BITS)', icon: SparklesIcon },
];

const SKILLS = {
  'Languages': ['C++', 'Python', 'TypeScript', 'JavaScript'],
  'Frontend': ['Next.js', 'React', 'React Three Fiber', 'Framer Motion', 'Tailwind CSS'],
  'Backend / Cloud': ['Supabase', 'Firebase', 'Node.js'],
  'AI / ML': ['Gemini API', 'Groq (LLaMA 3.3 70B)', 'Prompt Engineering', 'MediaPipe', 'OpenCV', 'Isolation Forest / LSTM'],
  'Robotics': ['Forward/Inverse Kinematics', 'DH Parameters', 'ROS concepts', 'OSRM / Nominatim'],
  'Tools': ['Git / GitHub', 'Vercel', 'Overleaf / LaTeX', 'Docker'],
};

const PROJECTS = [
  {
    slug: 'prepwise',
    title: 'Prepwise',
    category: 'AI / ML',
    status: 'completed',
    featured: true,
    tagline: 'A dual-LLM mock interview platform with an AI interviewer that adapts its mood to how you perform.',
    description: 'Dual-LLM pipeline combining Groq LLaMA 3.3 70B and Gemini for real-time answer analysis. Features the Adaptive Interviewer Persona Engine (AIPE) — five mood states driven by EMA smoothing of candidate performance, with dynamic prompt injection and ElevenLabs voice-parameter mapping. Includes an eight-layer client-side proctoring system, streaming STT with prosody-based tone detection, and a React Three Fiber 3D frontend.',
    tech: ['Next.js 14', 'R3F', 'Groq LLaMA 3.3', 'Gemini API', 'ElevenLabs', 'Supabase'],
    accent: 'cyan',
    icon: Brain,
    live_url: 'https://prep-wise-ai-mock-interviewer-4mkgwquea.vercel.app/',
    github_url: 'https://github.com/kumarabhishek/prepwise',
  },
  {
    slug: 'batt-x',
    title: 'BATT-X',
    category: 'AI / ML',
    status: 'in_progress',
    featured: true,
    tagline: 'Predicting the remaining useful life of EV batteries with role-based dashboards and a live 3D digital twin.',
    description: 'Built for Smart India Hackathon 2026. Full-stack platform for EV battery health monitoring and RUL prediction, with role-based dashboards (fleet operator, technician, admin) and a React Three Fiber 3D "digital twin" visualization of battery state in real time.',
    tech: ['Next.js', 'R3F', 'Python ML', 'Supabase'],
    accent: 'violet',
    icon: Zap,
    live_url: null,
    github_url: 'https://github.com/kumarabhishek/batt-x',
  },
  {
    slug: 'cleanair',
    title: 'CleanAir & Clear Streets',
    category: 'Full-Stack',
    status: 'completed',
    featured: true,
    tagline: 'Fusing NASA satellite data with live AQI and traffic data to surface hidden pollution hotspots across India.',
    description: 'Geospatial civic-tech platform integrating NASA FIRMS (fire data), NASA GIBS (satellite imagery), OpenWeatherMap AQI, and Gemini. Multi-role system (citizen/worker/admin) with Firebase real-time sync, NASA data fusion for hidden-hotspot detection, pan-India scalability via Nominatim geocoding, and live OSRM navigation for field workers.',
    tech: ['Gemini API', 'Firebase', 'NASA FIRMS/GIBS', 'OSRM', 'Nominatim'],
    accent: 'cyan',
    icon: Satellite,
    live_url: 'https://cleanair-streets.vercel.app',
    github_url: 'https://github.com/kumarabhishek/cleanair',
  },
  {
    slug: 'iriscomm',
    title: 'IrisComm',
    category: 'AI / ML',
    status: 'completed',
    featured: false,
    tagline: 'Letting people communicate using only eye movement, powered by real-time computer vision.',
    description: 'Real-time gaze-tracking assistive communication app built with MediaPipe and OpenCV, enabling users with limited mobility to communicate through eye movement alone.',
    tech: ['Python', 'MediaPipe', 'OpenCV'],
    accent: 'violet',
    icon: Brain,
    live_url: null,
    github_url: 'https://github.com/kumarabhishek/iriscomm',
  },
  {
    slug: 'sentinelops',
    title: 'SentinelOps',
    category: 'Systems',
    status: 'in_progress',
    featured: false,
    tagline: 'A Kubernetes operator that detects anomalies and heals your cluster before you even notice.',
    description: 'Self-healing Kubernetes operator using Prometheus/Loki telemetry, Isolation Forest/LSTM anomaly detection, and an LLM-based decision engine with OPA (Open Policy Agent) guardrails to safely automate remediation actions.',
    tech: ['Kubernetes', 'Prometheus', 'Loki', 'Python', 'OPA'],
    accent: 'cyan',
    icon: Terminal,
    live_url: null,
    github_url: 'https://github.com/kumarabhishek/sentinelops',
  },
];

const EXPERIENCE = [
  { year: '2026', title: 'Research Intern — VIT Chennai SRIP', desc: 'Built and published research around Prepwise (AI interview platform). IEEE-style literature comparison and technical documentation.' },
  { year: '2026', title: 'Smart India Hackathon 2026 — Competing', desc: 'BATT-X (EV Battery RUL) and Space Debris Detection & Collision Avoidance.' },
  { year: '2026', title: 'Infosys Springboard — Virtual Intern', desc: 'Completed virtual internship program with hands-on industry modules.' },
  { year: '2025', title: 'Enginow AI-Thon (BITS Pilani) — 3rd Place Global', desc: 'Global podium finish among international competitors.' },
  { year: '2025', title: 'CodeRush (DSA-based Coding Contest)', desc: 'Secured 5th Rank.' },
  { year: '2025', title: 'NEOCODEATHON — Top 10 Finalist', desc: 'National coding competition finalist.' },
];

const CERTIFICATIONS = [
  {
    title: 'Programming Certifications — Python, C & C++',
    issuer: 'IIT Bombay & MHRD, Government of India',
    desc: 'Certified by IIT Bombay and MHRD, Government of India.',
    scores: [
      { label: 'Python', value: 80 },
      { label: 'C', value: 92 },
      { label: 'C++', value: 92 },
    ],
    color: 'cyan',
    icon: BadgeCheck,
  },
  {
    title: 'AWS AI Practitioner Challenge',
    issuer: 'Udacity × AWS',
    desc: 'AI fundamentals, generative AI concepts, and practical AWS AI applications.',
    color: 'violet',
    icon: Brain,
  },
  {
    title: 'AI Skills Passport',
    issuer: 'EY & Microsoft',
    desc: 'Certificate of Completion — applied AI skills program.',
    color: 'cyan',
    icon: SparklesIcon,
  },
  {
    title: 'Data Analytics Job Simulation',
    issuer: 'Deloitte Australia (Forage)',
    desc: 'Certificate of Completion — hands-on data analytics job simulation.',
    color: 'violet',
    icon: BarChart3,
  },
];

// ============ COMPONENTS ============

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#about', label: 'About' },
    { href: '#skills', label: 'Skills' },
    { href: '#projects', label: 'Projects' },
    { href: '#timeline', label: 'Timeline' },
    { href: '#certifications', label: 'Certifications' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-2' : 'py-4'}`}
    >
      <div className={`max-w-6xl mx-auto px-6 flex items-center justify-between rounded-2xl transition-all ${scrolled ? 'glass mx-4 md:mx-auto py-3' : 'py-4'}`}>
        <a href="#hero" className="font-display text-lg font-bold tracking-tight">
          <span className="gradient-text">KA</span>
          <span className="text-muted-foreground font-mono text-xs ml-2">/ portfolio</span>
        </a>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <a key={l.href} href={l.href} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5">
              {l.label}
            </a>
          ))}
        </div>
        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
          <a href="#contact">Get in touch</a>
        </Button>
      </div>
    </motion.nav>
  );
}

function RotatingText() {
  const words = ['AI interview systems', 'geospatial platforms', 'robotics pipelines', 'self-healing infra', 'digital twins'];
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % words.length), 2400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block min-w-[280px]">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-block gradient-text font-semibold"
        >
          {words[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />
      <div className="absolute inset-0">
        <HeroScene />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <Badge variant="outline" className="mb-6 border-primary/40 text-primary bg-primary/5 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse mr-2" />
            Available for internships · Summer 2026
          </Badge>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-6">
            Kumar<br />
            <span className="gradient-text">Abhishek</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light">
            Computer Science Engineer — <span className="text-primary">AI &amp; Robotics</span>
          </p>
          <p className="text-lg text-muted-foreground/80 mb-10 max-w-2xl">
            I build <RotatingText /> end-to-end.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan group">
              <a href="#projects" className="flex items-center gap-2">View Projects <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></a>
            </Button>
            <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
              <a href="#contact">Get Resume</a>
            </Button>
          </div>
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-xs font-mono uppercase tracking-widest"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        scroll ↓
      </motion.div>
    </section>
  );
}

function CountUp({ value, suffix }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const target = parseFloat(value);
    if (isNaN(target)) { return; }
    const dur = 1500;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  const isDecimal = value.includes('.');
  const display = isNaN(parseFloat(value)) ? value : (isDecimal ? n.toFixed(1) : Math.floor(n).toLocaleString());
  return <span ref={ref}>{display}{suffix}</span>;
}

function About() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-primary font-mono text-sm uppercase tracking-widest mb-4">// about</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-10 max-w-4xl leading-tight">
            Building at the <span className="gradient-text">intersection</span> of intelligence, robotics, and product.
          </h2>
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <p className="text-lg text-muted-foreground leading-relaxed">{PROFILE.summary}</p>
            <div className="space-y-3 text-muted-foreground">
              <div className="flex items-start gap-3"><Rocket className="w-5 h-5 text-primary mt-1 shrink-0" /><span>{PROFILE.education}</span></div>
              <div className="flex items-start gap-3"><Trophy className="w-5 h-5 text-primary mt-1 shrink-0" /><span>{PROFILE.cgpa}</span></div>
              <div className="flex items-start gap-3"><MapPin className="w-5 h-5 text-primary mt-1 shrink-0" /><span>{PROFILE.location}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Card className="glass p-6 border-white/5 hover:border-primary/30 transition-all hover:glow-cyan group">
                  <s.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <div className="text-3xl md:text-4xl font-display font-bold text-glow mb-1">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Skills() {
  return (
    <section id="skills" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-primary font-mono text-sm uppercase tracking-widest mb-4">// stack</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-16">
            The tools I ship <span className="gradient-text">with.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(SKILLS).map(([cat, items], i) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="glass p-6 border-white/5 hover:border-accent/30 transition-all h-full">
                  <h3 className="font-display text-lg font-semibold mb-4 text-accent">{cat}</h3>
                  <div className="flex flex-wrap gap-2">
                    {items.map(item => (
                      <span key={item} className="text-sm px-3 py-1 rounded-full bg-white/5 border border-white/10 text-foreground/80 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all cursor-default">
                        {item}
                      </span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProjectCard({ p, index }) {
  const [live, setLive] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const Icon = p.icon;
  const accent = p.accent === 'cyan' ? 'primary' : 'accent';
  const accentClass = p.accent === 'cyan' ? 'text-primary border-primary/40' : 'text-accent border-accent/40';
  const glowClass = p.accent === 'cyan' ? 'glow-cyan' : 'glow-violet';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className="relative"
      style={{ perspective: 1200 }}
    >
      <motion.div
        animate={{ rotateY: live ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-[440px]"
      >
        {/* FRONT — case study */}
        <Card
          className={`absolute inset-0 glass border-white/5 p-6 flex flex-col overflow-hidden group hover:border-white/20 transition-all ${live ? '' : 'hover:' + glowClass}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: p.accent === 'cyan' ? '#22d3ee' : '#a855f7' }} />

          <div className="flex items-start justify-between mb-4 relative">
            <div className={`p-3 rounded-xl bg-white/5 border ${accentClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <Badge variant="outline" className={`${accentClass} bg-transparent text-[10px] uppercase tracking-wider`}>
              {p.status === 'in_progress' ? '• In progress' : p.status === 'completed' ? '• Shipped' : p.status}
            </Badge>
          </div>

          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">{p.category}</div>
          <h3 className="font-display text-2xl font-bold mb-2">{p.title}</h3>
          <p className={`text-sm mb-3 ${p.accent === 'cyan' ? 'text-primary/90' : 'text-accent/90'}`}>{p.tagline}</p>
          <p className="text-sm text-muted-foreground line-clamp-4 mb-4 flex-1">{p.description}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {p.tech.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground">{t}</span>
            ))}
            {p.tech.length > 4 && <span className="text-[10px] font-mono px-2 py-0.5 text-muted-foreground">+{p.tech.length - 4}</span>}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="flex gap-2">
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener" className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* LIVE MODE TOGGLE */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Live Mode</div>
                <div className={`text-[9px] font-mono ${p.live_url ? (p.accent === 'cyan' ? 'text-primary' : 'text-accent') : 'text-muted-foreground/50'}`}>
                  {p.live_url ? 'AVAILABLE' : 'COMING SOON'}
                </div>
              </div>
              <div title={!p.live_url ? 'Live demo coming soon' : ''}>
                <Switch
                  checked={live}
                  onCheckedChange={setLive}
                  disabled={!p.live_url}
                  className={`data-[state=checked]:bg-primary ${p.live_url ? 'ring-1 ring-primary/30' : 'opacity-50'}`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* BACK — live iframe */}
        <Card
          className="absolute inset-0 glass border-primary/30 overflow-hidden flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-primary">LIVE · {p.title}</span>
            </div>
            <div className="flex items-center gap-2">
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener" className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button onClick={() => setLive(false)} className="text-xs text-muted-foreground hover:text-foreground px-2">✕</button>
            </div>
          </div>
          <div className="relative flex-1 bg-black">
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Booting live demo…</div>
                <div className="h-1 w-40 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary" initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }} />
                </div>
              </div>
            )}
            {live && p.live_url && (
              <iframe onError={() => window.open(p.live_url, "_blank")}
                src={p.live_url}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
                onLoad={() => setIframeLoading(false)}
                title={p.title}
              />
            )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function Projects() {
  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <p className="text-primary font-mono text-sm uppercase tracking-widest mb-4">// projects</p>
              <h2 className="font-display text-4xl md:text-6xl font-bold">
                Things I&apos;ve <span className="gradient-text">shipped.</span>
              </h2>
            </div>
            <div className="glass rounded-xl p-4 border-primary/20 max-w-md">
              <div className="flex items-center gap-2 mb-1">
                <Play className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-widest text-primary">Live Mode</span>
              </div>
              <p className="text-xs text-muted-foreground">Flip the switch on any card to load the actual deployed app right inside the card.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((p, i) => <ProjectCard key={p.slug} p={p} index={i} />)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Certifications() {
  return (
    <section id="certifications" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-primary font-mono text-sm uppercase tracking-widest mb-4">// credentials</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-16">
            Certified &amp; <span className="gradient-text">verified.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {CERTIFICATIONS.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <Card className={`glass border-white/5 p-8 h-full flex flex-col relative overflow-hidden group hover:border-white/20 transition-all ${c.color === 'cyan' ? 'hover:glow-cyan' : 'hover:glow-violet'}`}>
                  <div
                    className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-15 blur-3xl group-hover:opacity-30 transition-opacity pointer-events-none"
                    style={{ background: c.color === 'cyan' ? '#22d3ee' : '#a855f7' }}
                  />
                  <div className="flex items-start justify-between mb-5 relative">
                    <div className={`p-3 rounded-xl bg-white/5 border ${c.color === 'cyan' ? 'text-primary border-primary/40' : 'text-accent border-accent/40'} group-hover:scale-110 transition-transform`}>
                      <c.icon className="w-5 h-5" />
                    </div>
                    <Badge variant="outline" className={`${c.color === 'cyan' ? 'text-primary border-primary/40' : 'text-accent border-accent/40'} bg-transparent text-[10px] uppercase tracking-wider`}>
                      • Verified
                    </Badge>
                  </div>
                  <h3 className="font-display text-xl font-bold leading-snug mb-2 relative">{c.title}</h3>
                  <p className={`text-xs font-mono uppercase tracking-widest mb-3 relative ${c.color === 'cyan' ? 'text-primary/90' : 'text-accent/90'}`}>{c.issuer}</p>
                  <p className="text-sm text-muted-foreground mb-4 relative">{c.desc}</p>
                  {c.scores && (
                    <div className="mt-auto space-y-3 relative pt-4 border-t border-white/5">
                      {c.scores.map((s, si) => (
                        <div key={s.label} className="flex items-center gap-3">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground w-12 shrink-0">{s.label}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${s.value}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 + si * 0.15, ease: 'easeOut' }}
                              className={`h-full rounded-full ${c.color === 'cyan' ? 'bg-gradient-to-r from-primary/60 to-primary glow-cyan' : 'bg-gradient-to-r from-accent/60 to-accent glow-violet'}`}
                            />
                          </div>
                          <span className={`text-[11px] font-mono shrink-0 ${c.color === 'cyan' ? 'text-primary' : 'text-accent'}`}>{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="timeline" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-primary font-mono text-sm uppercase tracking-widest mb-4">// journey</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-16">
            The <span className="gradient-text">road so far.</span>
          </h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
            {EXPERIENCE.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative flex items-start gap-6 mb-10 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12' : 'md:ml-auto md:pl-12'}`}
              >
                <div className="absolute left-4 md:left-auto md:right-full md:mr-[-6px] top-2 w-3 h-3 rounded-full bg-primary glow-cyan" style={i % 2 === 0 ? {} : { left: 'auto', right: 'auto', marginLeft: '-6px' }} />
                <Card className="glass border-white/5 p-6 flex-1 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span className="text-xs font-mono text-primary uppercase tracking-widest">{e.year}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-1">{e.title}</h3>
                  <p className="text-sm text-muted-foreground">{e.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Message sent! I\'ll get back to you soon.');
      setForm({ name: '', email: '', message: '' });
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <p className="text-primary font-mono text-sm uppercase tracking-widest mb-4">// contact</p>
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-6">
            Let&apos;s build <span className="gradient-text">something.</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl">
            Internships, hackathon teams, research collaboration, or just a hello — my inbox is open.
          </p>

          <div className="grid md:grid-cols-2 gap-10">
            <form onSubmit={submit} className="space-y-4">
              <Input placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="glass border-white/10 h-12" />
              <Input placeholder="Your email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="glass border-white/10 h-12" />
              <Textarea placeholder="What's on your mind?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="glass border-white/10 min-h-[140px]" />
              <Button type="submit" disabled={loading} size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan w-full">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send message
              </Button>
            </form>

            <div className="space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'kabhishek76673@gmail.com', href: 'mailto:kabhishek76673@gmail.com' },
                { icon: Github, label: 'GitHub', value: '@kumarabhishek-1025', href: 'https://github.com/kumarabhishek-1025' },
                { icon: Linkedin, label: 'LinkedIn', value: 'Kumar Abhishek', href: 'https://www.linkedin.com/in/kumar-abhishek-62573029a/' },
                { icon: MapPin, label: 'Based in', value: 'Chennai, India', href: null },
              ].map(c => (
                <motion.a
                  key={c.label}
                  href={c.href || '#'}
                  target={c.href?.startsWith('http') ? '_blank' : undefined}
                  rel="noopener"
                  whileHover={{ x: 6 }}
                  className="flex items-center gap-4 p-4 glass rounded-xl border-white/5 hover:border-primary/30 transition-colors block"
                >
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <c.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{c.label}</div>
                    <div className="text-sm font-medium">{c.value}</div>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CursorAura() {
  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);
  const auraX = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.7 });
  const auraY = useSpring(my, { stiffness: 180, damping: 22, mass: 0.7 });
  const trailX = useSpring(mx, { stiffness: 320, damping: 30, mass: 0.5 });
  const trailY = useSpring(my, { stiffness: 320, damping: 30, mass: 0.5 });
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ripples, setRipples] = useState([]);
  const rippleId = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const onMove = (e) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
      setActive(!!(e.target.closest && e.target.closest('a, button, [role="button"], input, textarea, label, .cursor-pointer')));
    };
    const onDown = (e) => {
      const id = ++rippleId.current;
      setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setRipples((r) => r.filter((p) => p.id !== id)), 650);
    };
    const onLeave = () => setVisible(false);
    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mousedown', onDown);
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  return (
    <>
      {/* soft trailing aura */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[60] pointer-events-none rounded-full"
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
          width: active ? 72 : 44,
          height: active ? 72 : 44,
          background:
            'radial-gradient(circle, rgba(34,211,238,0.16) 0%, rgba(168,85,247,0.08) 45%, transparent 70%)',
          filter: 'blur(1px)',
          opacity: visible ? 1 : 0,
          transition: 'width 0.3s ease, height 0.3s ease, opacity 0.35s ease',
        }}
      />
      {/* crisp trailing ring */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[60] pointer-events-none rounded-full"
        style={{
          x: trailX,
          y: trailY,
          translateX: '-50%',
          translateY: '-50%',
          width: active ? 40 : 26,
          height: active ? 40 : 26,
          border: `1px solid ${active ? 'rgba(34,211,238,0.8)' : 'rgba(34,211,238,0.45)'}`,
          boxShadow: active ? '0 0 18px 2px rgba(34,211,238,0.25)' : 'none',
          opacity: visible ? (active ? 1 : 0.7) : 0,
          transition: 'width 0.25s ease, height 0.25s ease, border-color 0.25s ease',
        }}
      />
      {/* exact dot */}
      <motion.div
        aria-hidden
        className="fixed top-0 left-0 z-[61] pointer-events-none rounded-full bg-primary"
        style={{
          x: mx,
          y: my,
          translateX: '-50%',
          translateY: '-50%',
          width: active ? 9 : 6,
          height: active ? 9 : 6,
          boxShadow: '0 0 12px 3px rgba(34,211,238,0.65)',
          opacity: visible ? 1 : 0,
          transition: 'width 0.2s ease, height 0.2s ease',
        }}
      />
      {/* click ripples */}
      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            aria-hidden
            className="fixed z-[59] pointer-events-none rounded-full border border-primary/60"
            style={{ left: r.x, top: r.y, translateX: '-50%', translateY: '-50%' }}
            initial={{ width: 8, height: 8, opacity: 0.8 }}
            animate={{ width: 90, height: 90, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  const currentlyBuilding = PROJECTS.find(p => p.status === 'in_progress');
  return (
    <footer className="relative border-t border-white/5 py-12 px-6 mt-20">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm text-muted-foreground">
            Currently building: <span className="text-accent font-medium">{currentlyBuilding?.title}</span>
          </span>
        </div>
        <div className="text-xs font-mono text-muted-foreground">
          © 2025 Kumar Abhishek · Built with Next.js + R3F
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <GuidePath />
      <CursorAura />
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <Timeline />
      <Certifications />
      <Contact />
      <Footer />
    </main>
  );
}

export default App;

