import { useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "wouter";
import {
  ArrowRight, ArrowUp, Sun, Moon, ExternalLink,
  MessageCircle, Bot, BookOpen, GraduationCap,
  Github, Linkedin, Globe, Trophy, Briefcase,
  Code2, Brain, Cpu, Database, Layers, Zap,
  ChevronRight, ChevronDown, MapPin, Mail, Award, Lock,
  Menu, X, Sparkles, Target, Shield, Phone, BookMarked, Newspaper,
  Package, Scale
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── i18n ────────────────────────────────────────────────────────────────────
type Lang = "pt" | "en" | "es";

const T: Record<Lang, Record<string, string>> = {
  pt: {
    headline: "AI Engineer & Full Stack Developer",
    subheadline: "Construindo agentes inteligentes de produção com LangChain, LangGraph e Python. Especialista em orquestração agêntica, pipelines RAG e sistemas LLM escaláveis.",
    cta_agents: "Testar Agentes ao Vivo",
    cta_linkedin: "Ver LinkedIn",
    cta_github: "Ver GitHub",
    nav_agents: "Agentes",
    nav_about: "Sobre",
    nav_stack: "Stack",
    nav_career: "Carreira",
    nav_links: "Links",
    nav_login: "Entrar",
    badge_top1: "Top 1 Brasil",
    badge_top8: "Top 8 Global",
    badge_remote: "Remote LATAM → US/EU",
    section_agents: "Agentes de IA em Produção",
    section_agents_desc: "Cada agente é um sistema completo: arquitetura, orquestração, avaliação e deploy end-to-end. Clique para testar ao vivo.",
    agent_demo: "Demo ao Vivo",
    agent_soon: "Em Breve",
    section_about: "Sobre Mim",
    about_text: "12+ anos em TI, 6+ anos em Python. Engenheiro de IA focado em aplicações LLM de produção e pipelines RAG que entregam resultados. Atualmente na equipe de desenvolvimento (DTIC) do Detran-RJ, liderando modernização de backend e adoção de IA.",
    section_stack: "Stack Técnica",
    section_achievements: "Conquistas & Certificações",
    ach_manus_top1: "Top 1 Brasil — Manus Academy",
    ach_manus_top1_desc: "87% de score, 5 tentativas. Ranking diário.",
    ach_manus_top8: "Top 8 Global — Manus Academy",
    ach_manus_top8_desc: "13 distintivos, 2.740 pontos. Top 30 global atual.",
    ach_hf: "35+ Apps no Hugging Face",
    ach_hf_desc: "21 Spaces interativos, 20 datasets e 2 modelos customizados.",
    ach_langchain: "LangChain Academy — Certified",
    ach_langchain_desc: "Certificação em LangChain, LangGraph e LangSmith.",
    ach_anthropic: "Anthropic Academy — Certified",
    ach_anthropic_desc: "Certificação em Claude e prompt engineering avançado.",
    ach_redhat: "Red Hat Certified — Developer Path",
    ach_redhat_desc: "Certificação profissional em desenvolvimento.",
    section_career: "Experiência Profissional",
    career_detran_title: "Senior Python Developer",
    career_detran_org: "Detran-RJ · DTIC",
    career_detran_period: "2019 – Presente",
    career_detran_desc: "REST APIs com FastAPI, pipelines GenAI com LangChain/OpenAI/Anthropic, RAG para análise de contratos, XGBoost para analytics, Docker + Grafana. Líder de estratégia de ferramentas de IA.",
    career_detran2_title: "Analista de Sistemas / Suporte Técnico",
    career_detran2_org: "Detran-RJ · Corregedoria & Ouvidoria",
    career_detran2_period: "2014 – 2019",
    career_detran2_desc: "Referência técnica interna, desenvolvimento de ferramentas, documentação, Scrum, tradução entre stakeholders técnicos e não-técnicos.",
    section_links: "Links & Contato",
    footer_copy: "Todos os direitos reservados",
    availability: "Disponível para trabalho remoto — LATAM → US/EU. PJ ou CLT. Inglês fluente.",
    contact_email: "moises.costa12345@gmail.com",
    scroll_explore: "Explorar",
    back_to_top: "Voltar ao topo",
    nav_arquimedes: "Ir para Arquimedes",
    nav_blog: "Blog",
    nav_register: "Criar Conta",
    nav_demo: "Demo",
    whatsapp: "WhatsApp",
    hf_spaces: "Hugging Face",
  },
  en: {
    headline: "AI Engineer & Full Stack Developer",
    subheadline: "Building production-grade intelligent agents with LangChain, LangGraph & Python. Specialist in agentic orchestration, RAG pipelines and scalable LLM systems.",
    cta_agents: "Try Live Agents",
    cta_linkedin: "View LinkedIn",
    cta_github: "View GitHub",
    nav_agents: "Agents",
    nav_about: "About",
    nav_stack: "Stack",
    nav_career: "Career",
    nav_links: "Links",
    nav_login: "Sign In",
    badge_top1: "Manus Academy Top 1 Brazil",
    badge_top8: "Manus Academy Top 30 Global",
    badge_remote: "Remote LATAM → US/EU",
    section_agents: "Production AI Agents",
    section_agents_desc: "Each agent is a complete system: architecture, orchestration, evaluation, and end-to-end deployment. Click to try live.",
    agent_demo: "Live Demo",
    agent_soon: "Coming Soon",
    section_about: "About Me",
    about_text: "12+ years in IT, 6+ years in Python. AI Engineer focused on production-grade LLM applications and RAG pipelines that ship. Currently at Detran-RJ's development team (DTIC), leading backend modernization and AI adoption.",
    section_stack: "Tech Stack",
    section_achievements: "Achievements & Certifications",
    ach_manus_top1: "Top 1 Brazil — Manus Academy",
    ach_manus_top1_desc: "87% score, 5 attempts. Daily ranking.",
    ach_manus_top8: "Top 8 Global — Manus Academy",
    ach_manus_top8_desc: "13 badges, 2,740 points. Currently Top 30 global.",
    ach_hf: "35+ Hugging Face Apps",
    ach_hf_desc: "21 interactive Spaces, 20 datasets, and 2 custom models.",
    ach_langchain: "LangChain Academy — Certified",
    ach_langchain_desc: "Certified in LangChain, LangGraph and LangSmith.",
    ach_anthropic: "Anthropic Academy — Certified",
    ach_anthropic_desc: "Certified in Claude and advanced prompt engineering.",
    ach_redhat: "Red Hat Certified — Developer Path",
    ach_redhat_desc: "Professional development certification.",
    section_career: "Professional Experience",
    career_detran_title: "Senior Python Developer",
    career_detran_org: "Detran-RJ · DTIC",
    career_detran_period: "2019 – Present",
    career_detran_desc: "REST APIs with FastAPI, GenAI pipelines with LangChain/OpenAI/Anthropic, RAG for contract analysis, XGBoost for analytics, Docker + Grafana. AI tooling strategy lead.",
    career_detran2_title: "Systems Analyst / Technical Support",
    career_detran2_org: "Detran-RJ · Internal Affairs & Ombudsman",
    career_detran2_period: "2014 – 2019",
    career_detran2_desc: "Internal technical reference, tool development, documentation, Scrum, bridging technical and non-technical stakeholders.",
    section_links: "Links & Contact",
    footer_copy: "All rights reserved",
    availability: "Available for remote work — LATAM → US/EU. Contractor or full-time.",
    contact_email: "moises.costa12345@gmail.com",
    scroll_explore: "Explore",
    back_to_top: "Back to top",
    nav_arquimedes: "Go to Arquimedes",
    nav_blog: "Blog",
    nav_register: "Create Account",
    nav_demo: "Demo",
    whatsapp: "WhatsApp",
    hf_spaces: "Hugging Face",
  },
  es: {
    headline: "AI Engineer & Full Stack Developer",
    subheadline: "Construyendo agentes inteligentes de producción con LangChain, LangGraph y Python. Especialista en orquestación agéntica, pipelines RAG y sistemas LLM escalables.",
    cta_agents: "Probar Agentes en Vivo",
    cta_linkedin: "Ver LinkedIn",
    cta_github: "Ver GitHub",
    nav_agents: "Agentes",
    nav_about: "Sobre",
    nav_stack: "Stack",
    nav_career: "Carrera",
    nav_links: "Enlaces",
    nav_login: "Entrar",
    badge_top1: "Top 1 Brasil",
    badge_top8: "Top 8 Global",
    badge_remote: "Remoto LATAM → US/EU",
    section_agents: "Agentes de IA en Producción",
    section_agents_desc: "Cada agente es un sistema completo: arquitectura, orquestación, evaluación y deploy end-to-end. Haz clic para probar en vivo.",
    agent_demo: "Demo en Vivo",
    agent_soon: "Próximamente",
    section_about: "Sobre Mí",
    about_text: "12+ años en TI, 6+ años en Python. Ingeniero de IA enfocado en aplicaciones LLM de producción y pipelines RAG que entregan resultados. Actualmente en el equipo de desarrollo (DTIC) de Detran-RJ, liderando modernización de backend y adopción de IA.",
    section_stack: "Stack Técnico",
    section_achievements: "Logros & Certificaciones",
    ach_manus_top1: "Top 1 Brasil — Manus Academy",
    ach_manus_top1_desc: "87% de score, 5 intentos. Ranking diario.",
    ach_manus_top8: "Top 8 Global — Manus Academy",
    ach_manus_top8_desc: "13 insignias, 2.740 puntos. Top 30 global actual.",
    ach_hf: "35+ Apps en Hugging Face",
    ach_hf_desc: "21 Spaces interactivos, 20 datasets y 2 modelos customizados.",
    ach_langchain: "LangChain Academy — Certified",
    ach_langchain_desc: "Certificación en LangChain, LangGraph y LangSmith.",
    ach_anthropic: "Anthropic Academy — Certified",
    ach_anthropic_desc: "Certificación en Claude e ingeniería de prompts avanzada.",
    ach_redhat: "Red Hat Certified — Developer Path",
    ach_redhat_desc: "Certificación profesional de desarrollo.",
    section_career: "Experiencia Profesional",
    career_detran_title: "Senior Python Developer",
    career_detran_org: "Detran-RJ · DTIC",
    career_detran_period: "2019 – Presente",
    career_detran_desc: "REST APIs con FastAPI, pipelines GenAI con LangChain/OpenAI/Anthropic, RAG para análisis de contratos, XGBoost para analytics, Docker + Grafana. Líder de estrategia de herramientas IA.",
    career_detran2_title: "Analista de Sistemas / Soporte Técnico",
    career_detran2_org: "Detran-RJ · Corregedoria & Ouvidoria",
    career_detran2_period: "2014 – 2019",
    career_detran2_desc: "Referencia técnica interna, desarrollo de herramientas, documentación, Scrum, puente entre stakeholders técnicos y no técnicos.",
    section_links: "Enlaces & Contacto",
    footer_copy: "Todos los derechos reservados",
    availability: "Disponible para trabajo remoto — LATAM → US/EU. Contratista o tiempo completo. Inglés fluido.",
    contact_email: "moises.costa12345@gmail.com",
    scroll_explore: "Explorar",
    back_to_top: "Volver arriba",
    nav_arquimedes: "Ir a Arquimedes",
    nav_blog: "Blog",
    nav_register: "Crear Cuenta",
    nav_demo: "Demo",
    whatsapp: "WhatsApp",
    hf_spaces: "Hugging Face",
  },
};

// ─── Agents ──────────────────────────────────────────────────────────────────
const AGENTS = [
  {
    id: "arquimedes",
    name: "Arquimedes",
    tagline: { pt: "Agente de Matemática Interativa", en: "Interactive Math Agent", es: "Agente de Matemáticas Interactivo" },
    desc: { pt: "LLM + TTS + Streaming SSE + Exercícios adaptativos. Ensina adição, subtração, divisão, frações, conjuntos, porcentagem e regra de 3.", en: "LLM + TTS + SSE Streaming + Adaptive exercises. Teaches addition, subtraction, division, fractions, sets, percentages and rule of three.", es: "LLM + TTS + Streaming SSE + Ejercicios adaptativos. Enseña suma, resta, división, fracciones, conjuntos, porcentaje y regla de tres." },
    stack: ["LangChain", "React", "tRPC", "SSE", "TTS", "MySQL"],
    avatar: "/manus-storage/Arquimedes_f63227f7.webp",
    href: "/arquimedes/chat",
    available: true,
    gradient: "from-blue-500 via-cyan-500 to-blue-600",
    glow: "shadow-blue-500/20",
  },
  {
    id: "atlas",
    name: "Atlas",
    tagline: { pt: "Patrimônio DTIC — Detran-RJ", en: "DTIC Asset Management — Detran-RJ", es: "Patrimonio DTIC — Detran-RJ" },
    desc: { pt: "Agente para gestão de patrimônio da DTIC do Detran-RJ. Controle de ativos, rastreamento e relatórios automatizados.", en: "Agent for DTIC asset management at Detran-RJ. Asset control, tracking and automated reporting.", es: "Agente para gestión de patrimonio DTIC de Detran-RJ. Control de activos, seguimiento e informes automatizados." },
    stack: ["LangGraph", "FastAPI", "PostgreSQL", "Supabase", "PGvector"],
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/atlas_avatar_v2-7i7xiDPiuVvvtmb4YQmRbp.webp",
    href: "/agents",
    available: true,
    gradient: "from-emerald-500 via-teal-500 to-emerald-600",
    glow: "shadow-emerald-500/20",
  },
  {
    id: "artemis",
    name: "Artemis",
    tagline: { pt: "Preparação para a OAB", en: "Brazilian Bar Exam Prep", es: "Preparación para la OAB" },
    desc: { pt: "Agente especializado para preparação da prova da OAB. Questões, simulados e explicações contextualizadas.", en: "Specialized agent for Brazilian Bar Exam preparation. Questions, mock exams and contextualized explanations.", es: "Agente especializado para preparación del examen OAB. Preguntas, simulacros y explicaciones contextualizadas." },
    stack: ["RAG", "LangChain", "PGvector", "React", "FastAPI"],
    avatar: "/manus-storage/ArtemisPrincipal_e1733188.png",
    href: "/agents",
    available: true,
    gradient: "from-amber-500 via-orange-500 to-amber-600",
    glow: "shadow-amber-500/20",
  },
];

// ─── Tech Stack ──────────────────────────────────────────────────────────────
const STACK_CATEGORIES = [
  {
    title: { pt: "Agentes & LLMs", en: "Agents & LLMs", es: "Agentes & LLMs" },
    icon: Brain,
    items: ["LangChain", "LangGraph", "CrewAI", "LangSmith", "OpenAI", "Anthropic", "MCP"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: { pt: "Backend & APIs", en: "Backend & APIs", es: "Backend & APIs" },
    icon: Cpu,
    items: ["Python", "FastAPI", "Pydantic", "REST APIs", "tRPC", "Node.js"],
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: { pt: "Dados & Vector DBs", en: "Data & Vector DBs", es: "Datos & Vector DBs" },
    icon: Database,
    items: ["PostgreSQL", "Supabase", "PGvector", "Pinecone", "FAISS", "Redis", "MongoDB"],
    color: "from-purple-500 to-violet-500",
  },
  {
    title: { pt: "Frontend & DevOps", en: "Frontend & DevOps", es: "Frontend & DevOps" },
    icon: Layers,
    items: ["React", "Tailwind", "Docker", "Git", "AWS", "Grafana", "CI/CD"],
    color: "from-amber-500 to-orange-500",
  },
];

// ─── Links ───────────────────────────────────────────────────────────────────
const LINKS = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/moises-costa-rj/", icon: Linkedin, desc: "linkedin.com/in/moises-costa-rj" },
  { label: "GitHub", href: "https://github.com/Finish-Him", icon: Github, desc: "github.com/Finish-Him" },
  { label: "GitHub (MSc)", href: "https://github.com/Msc-Consultoriarj-org", icon: Github, desc: "github.com/Msc-Consultoriarj-org" },
  { label: "Hugging Face", href: "https://huggingface.co/Finish-him", icon: Globe, desc: "huggingface.co/Finish-him" },
  { label: "WhatsApp", href: "https://wa.me/5521990741351", icon: Phone, desc: "+55 21 99074-1351" },
];

// ─── Sections for scroll-spy ─────────────────────────────────────────────────
const SECTIONS = ["agents", "about", "stack", "career", "links"];

// ─── Animation variants ──────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const fadeLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0 } };
const fadeRight = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0 } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [lang, setLang] = useState<Lang>("en");
  const [activeSection, setActiveSection] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useMemo(() => T[lang], [lang]);

  // Scroll-spy
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
      const sections = SECTIONS.map(id => document.getElementById(id));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i];
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(SECTIONS[i]);
          return;
        }
      }
      setActiveSection("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#060d1b] text-slate-100 overflow-x-hidden">
      {/* ── Animated background ──────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }} />
        <div className="absolute top-0 left-1/3 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[180px]" />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#060d1b]/70 backdrop-blur-2xl border-b border-blue-500/10">
        <div className="container flex h-16 items-center justify-between">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 group">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/favicon_msc-EyS528Y8qNEEzSwHrNmBLT.webp"
              alt="MSc"
              className="h-9 w-9 rounded-xl shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/30 transition-shadow"
            />
            <span className="font-display font-bold text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:block">
              Moisés Costa · AI Engineer
            </span>
          </button>

          {/* Desktop nav — simplified: Blog + Agents demos only */}
          <div className="hidden lg:flex items-center gap-1">
            <Link href="/blog">
              <button className="relative px-4 py-2 text-sm font-medium rounded-lg transition-all text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5" />
                Blog
              </button>
            </Link>
            <div className="w-px h-5 bg-slate-700/60 mx-1" />
            <Link href="/agents">
              <button className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all text-blue-400 hover:text-white hover:bg-blue-500/10 flex items-center gap-1.5 border border-blue-500/20 hover:border-blue-500/40">
                <Bot className="h-3.5 w-3.5" />
                Arquimedes
              </button>
            </Link>
            <Link href="/agents">
              <button className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all text-emerald-400 hover:text-white hover:bg-emerald-500/10 flex items-center gap-1.5 border border-emerald-500/20 hover:border-emerald-500/40">
                <Package className="h-3.5 w-3.5" />
                Atlas
              </button>
            </Link>
            <Link href="/agents">
              <button className="relative px-3 py-2 text-sm font-medium rounded-lg transition-all text-amber-400 hover:text-white hover:bg-amber-500/10 flex items-center gap-1.5 border border-amber-500/20 hover:border-amber-500/40">
                <Scale className="h-3.5 w-3.5" />
                Artemis
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div className="flex items-center bg-white/5 rounded-xl p-0.5 border border-white/5">
              {(["pt", "en", "es"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    lang === l
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-500 hover:text-white"
                  }`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <Link href="/arquimedes/chat">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white gap-2 shadow-lg shadow-blue-600/20 border-0">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/register">
                  <Button size="sm" variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 gap-1.5 hidden sm:flex">
                    {t.nav_register}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-blue-600/20">
                    {t.nav_login}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-blue-500/10 bg-[#060d1b]/95 backdrop-blur-2xl"
            >
              <div className="container py-4 flex flex-col gap-1">
                <Link href="/blog">
                  <button className="px-4 py-3 text-left rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 w-full flex items-center gap-2">
                    <Newspaper className="h-4 w-4" /> Blog
                  </button>
                </Link>
                <Link href="/agents">
                  <button className="px-4 py-3 text-left rounded-xl text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-500/10 w-full flex items-center gap-2">
                    <Bot className="h-4 w-4" /> Arquimedes
                  </button>
                </Link>
                <Link href="/agents">
                  <button className="px-4 py-3 text-left rounded-xl text-sm font-medium text-emerald-400 hover:text-white hover:bg-emerald-500/10 w-full flex items-center gap-2">
                    <Package className="h-4 w-4" /> Atlas
                  </button>
                </Link>
                <Link href="/agents">
                  <button className="px-4 py-3 text-left rounded-xl text-sm font-medium text-amber-400 hover:text-white hover:bg-amber-500/10 w-full flex items-center gap-2">
                    <Scale className="h-4 w-4" /> Artemis
                  </button>
                </Link>
                <div className="border-t border-slate-800/40 my-1" />
                <Link href="/register">
                  <button className="px-4 py-3 text-left rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 w-full">
                    {t.nav_register}
                  </button>
                </Link>
                <Link href="/login">
                  <button className="px-4 py-3 text-left rounded-xl text-sm font-medium text-blue-400 hover:text-white hover:bg-blue-500/10 w-full">
                    {t.nav_login}
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Hero background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/hero_banner_ai-bfBC6DN9kp5zN4bjYEnUZf.webp"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b]/60 via-[#060d1b]/80 to-[#060d1b]" />
        </div>

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            {/* Left: Text content (3 cols) */}
            <motion.div
              className="lg:col-span-3"
              initial="hidden"
              animate="visible"
              variants={fadeLeft}
              transition={{ duration: 0.7 }}
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-2.5 mb-8">
                <a
                  href="https://academy.manus.im"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Manus Academy — Top 1 Brazil"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/15 to-amber-500/15 border border-yellow-500/30 text-yellow-400 text-sm font-bold shadow-lg shadow-yellow-500/5 hover:from-yellow-500/25 hover:to-amber-500/25 hover:border-yellow-500/50 transition-all cursor-pointer"
                >
                  <Trophy className="h-4 w-4" /> {t.badge_top1}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <a
                  href="https://academy.manus.im"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Manus Academy — Top 8 Global"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/30 text-blue-400 text-sm font-bold shadow-lg shadow-blue-500/5 hover:from-blue-500/25 hover:to-cyan-500/25 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <Award className="h-4 w-4" /> {t.badge_top8}
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold shadow-lg shadow-emerald-500/5">
                  <Globe className="h-4 w-4" /> {t.badge_remote}
                </span>
              </div>

              {/* Name with glow */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold leading-[1.05] mb-3 tracking-tight">
                <span className="relative">
                  Moises Costa
                  <span className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 blur-2xl -z-10" />
                </span>
              </h1>

              {/* Title gradient */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-6 leading-tight">
                {t.headline}
              </h2>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
                {t.subheadline}
              </p>

              {/* CTAs — Row 1: primary actions */}
              <div className="flex flex-wrap gap-3 mb-3">
                <Button
                  size="lg"
                  onClick={() => scrollTo("agents")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white gap-2.5 text-base px-7 py-5 shadow-2xl shadow-blue-600/30 border-0 rounded-xl font-bold"
                >
                  <Sparkles className="h-5 w-5" />
                  {t.cta_agents}
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <a href="https://www.linkedin.com/in/moises-costa-rj/" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white gap-2.5 text-base px-7 py-5 rounded-xl font-bold border border-slate-700/60 shadow-lg">
                    <Linkedin className="h-5 w-5 text-blue-400" />
                    {t.cta_linkedin}
                  </Button>
                </a>
                <a href="https://github.com/Finish-Him" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white gap-2.5 text-base px-7 py-5 rounded-xl font-bold border border-slate-700/60 shadow-lg">
                    <Github className="h-5 w-5" />
                    {t.cta_github}
                  </Button>
                </a>
              </div>
              {/* CTAs — Row 2: HuggingFace + WhatsApp */}
              <div className="flex flex-wrap gap-3">
                <a href="https://huggingface.co/Finish-him" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-orange-500/15 hover:bg-orange-500/25 text-orange-300 hover:text-orange-200 gap-2.5 text-base px-7 py-5 rounded-xl font-bold border border-orange-500/30 shadow-lg">
                    <span className="text-lg leading-none">🤗</span>
                    {t.hf_spaces}
                  </Button>
                </a>
                <a href="https://wa.me/5521990741351" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white gap-2.5 text-base px-7 py-5 rounded-xl font-bold border-0 shadow-xl shadow-green-900/30">
                    <Phone className="h-5 w-5" />
                    {t.whatsapp}
                  </Button>
                </a>
              </div>
            </motion.div>

            {/* Right: Profile image (2 cols) */}
            <motion.div
              className="lg:col-span-2 flex justify-center"
              initial="hidden"
              animate="visible"
              variants={fadeRight}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/30 to-cyan-600/30 rounded-3xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/20 shadow-2xl shadow-blue-900/40">
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/profile_ai_engineer-Y3uUawQh9TVRML9GeMC5Kr.webp"
                    alt="Moises Costa — AI Engineer"
                    className="w-72 sm:w-80 lg:w-96 aspect-[3/4] object-cover"
                  />
                  {/* Overlay gradient */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#060d1b] to-transparent" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            onClick={() => scrollTo("agents")}
          >
            <span className="text-xs text-slate-500 font-medium">{t.scroll_explore}</span>
            <ChevronDown className="h-5 w-5 text-blue-400" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          AGENTS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="agents" className="py-24 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/section_agents_bg-kqyffqVFMSJzxRF7K3iZnk.webp"
            alt=""
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b] via-transparent to-[#060d1b]" />
        </div>

        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">AI Agents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-3">{t.section_agents}</h2>
            <p className="text-slate-400 mb-16 max-w-xl text-lg">{t.section_agents_desc}</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="group"
              >
                <div className={`relative rounded-2xl border border-slate-800/60 bg-[#0c1629]/80 backdrop-blur-sm overflow-hidden transition-all duration-500 h-full flex flex-col ${
                  agent.available
                    ? `hover:border-blue-500/40 hover:shadow-2xl hover:${agent.glow} hover:-translate-y-2`
                    : "opacity-50"
                }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Top gradient bar with glow */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${agent.gradient} shadow-lg`} />

                  {/* Card inner glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${agent.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />

                  <div className="p-7 flex flex-col flex-1 relative z-10">
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-4 mb-5">
                      {agent.avatar ? (
                        <div className="relative">
                          <div className={`absolute -inset-1 bg-gradient-to-r ${agent.gradient} rounded-xl blur opacity-40`} />
                          <img src={agent.avatar} alt={agent.name} className="relative w-16 h-16 rounded-xl object-cover shadow-xl" />
                        </div>
                      ) : (
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center shadow-xl`}>
                          <Bot className="h-8 w-8 text-white/90" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-display font-extrabold text-white">{agent.name}</h3>
                        <p className="text-sm text-slate-400">{agent.tagline[lang]}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 leading-relaxed mb-5 flex-1">{agent.desc[lang]}</p>

                    {/* Stack pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {agent.stack.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 text-xs font-mono border border-blue-500/10">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    {agent.available ? (
                      <Link href={agent.href}>
                        <Button className={`w-full bg-gradient-to-r ${agent.gradient} hover:opacity-90 text-white gap-2 shadow-lg border-0 rounded-xl py-5 font-bold`}>
                          <Zap className="h-4 w-4" />
                          {t.agent_demo}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full opacity-40 gap-2 rounded-xl py-5">
                        <Lock className="h-4 w-4" />
                        {t.agent_soon}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="about" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b] via-[#0a1225] to-[#060d1b]" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeLeft} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-blue-500 to-transparent" />
                <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">About</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-8">{t.section_about}</h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">{t.about_text}</p>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-slate-400">Rio de Janeiro, Brazil</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <a href="mailto:moises.costa12345@gmail.com" className="text-blue-400 hover:text-cyan-400 transition-colors">
                    {t.contact_email}
                  </a>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 mb-8">
                <p className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  {t.availability}
                </p>
              </div>

              {/* Cross-links */}
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" className="border-slate-700/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 gap-2 rounded-xl" onClick={() => scrollTo("stack")}>
                  <Code2 className="h-4 w-4" /> {t.section_stack}
                </Button>
                <Button variant="outline" size="sm" className="border-slate-700/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 gap-2 rounded-xl" onClick={() => scrollTo("career")}>
                  <Briefcase className="h-4 w-4" /> {t.section_career}
                </Button>
                <Button variant="outline" size="sm" className="border-slate-700/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 gap-2 rounded-xl" onClick={() => scrollTo("agents")}>
                  <Bot className="h-4 w-4" /> {t.nav_agents}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CAREER SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="career" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b] via-[#0a1225] to-[#060d1b]" />
        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">Career</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-16">{t.section_career}</h2>
          </motion.div>

          {/* Detran Identity Card */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.5 }} className="mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-[#0c1629]/80 to-emerald-500/5 backdrop-blur-sm shadow-xl shadow-blue-900/10">
              <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow-lg">
                <img src="/manus-storage/detran-logo-horizontal_bf146ebc.png" alt="Detran RJ" className="h-10 w-auto" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-display font-extrabold text-white text-xl">Detran-RJ · DTIC</h3>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">12 Anos</span>
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">Concursado 2013</span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Approved in the 2013 public competition · Possession on <strong className="text-blue-400">April 4, 2014</strong> · Worked at <strong className="text-blue-400">DTIC — Directorate of Information and Communication Technology</strong>. Responsible for modernizing legacy systems, implementing GenAI pipelines, REST APIs with FastAPI and technical leadership in strategic projects.
                </p>
              </div>
            </div>
          </motion.div>

          <div className="max-w-3xl space-y-8">
            {[
              { title: t.career_detran_title, org: t.career_detran_org, period: t.career_detran_period, desc: t.career_detran_desc, current: true },
              { title: t.career_detran2_title, org: t.career_detran2_org, period: t.career_detran2_period, desc: t.career_detran2_desc, current: false },
            ].map((job, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15 }}
              >
                <div className={`relative pl-10 border-l-2 ${job.current ? "border-blue-500" : "border-slate-700/60"}`}>
                  <div className={`absolute left-[-9px] top-1 w-4 h-4 rounded-full border-2 ${
                    job.current ? "bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/40" : "bg-slate-700 border-slate-600"
                  }`} />
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-display font-extrabold text-white text-xl">{job.title}</h3>
                    {job.current && (
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 shadow-lg shadow-blue-500/5">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                    <Briefcase className="h-4 w-4 text-blue-400/60" />
                    <span>{job.org}</span>
                    <span className="text-slate-700">|</span>
                    <span>{job.period}</span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{job.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cross-link */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: 0.3 }} className="mt-12 flex gap-3">
            <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 gap-2 rounded-xl" onClick={() => scrollTo("stack")}>
              <Code2 className="h-4 w-4" /> {t.section_stack}
            </Button>
            <a href="https://www.linkedin.com/in/moises-costa-rj/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 gap-2 rounded-xl">
                <Linkedin className="h-4 w-4" /> {t.cta_linkedin}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ACHIEVEMENTS SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="achievements" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b] via-[#0a1225] to-[#060d1b]" />
        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-yellow-500 to-transparent" />
              <span className="text-yellow-400 text-sm font-bold tracking-widest uppercase">Achievements</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-12">{t.section_achievements}</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: t.ach_manus_top1, desc: t.ach_manus_top1_desc, img: "/manus-storage/top1_manus_c14e2927.png", gradient: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-500/30", icon: "🏆" },
              { title: t.ach_manus_top8, desc: t.ach_manus_top8_desc, img: "/manus-storage/top8_manus_global_19f36b79.jpg", gradient: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", icon: "🌍" },
              { title: t.ach_hf, desc: t.ach_hf_desc, img: null, gradient: "from-purple-500/15 to-violet-500/15", border: "border-purple-500/30", icon: "🤗" },
              { title: t.ach_langchain, desc: t.ach_langchain_desc, img: null, gradient: "from-green-500/15 to-emerald-500/15", border: "border-green-500/30", icon: "🦜" },
              { title: t.ach_anthropic, desc: t.ach_anthropic_desc, img: null, gradient: "from-orange-500/15 to-amber-500/15", border: "border-orange-500/30", icon: "🧠" },
              { title: t.ach_redhat, desc: t.ach_redhat_desc, img: null, gradient: "from-red-500/15 to-rose-500/15", border: "border-red-500/30", icon: "🎓" },
            ].map((ach, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className={`flex items-center gap-4 p-4 rounded-xl border ${ach.border} bg-gradient-to-r ${ach.gradient} backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-default`}
              >
                {ach.img ? (
                  <img src={ach.img} alt={ach.title} className="w-16 h-12 rounded-lg object-cover shrink-0 shadow-lg" />
                ) : (
                  <div className="w-16 h-12 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-2xl">
                    {ach.icon}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-bold text-sm text-white truncate">{ach.title}</div>
                  <div className="text-xs text-slate-400">{ach.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          TECH STACK SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="stack" className="py-24 relative">
        <div className="absolute inset-0 z-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/section_stack_bg-ewFuaNugQWYQkes9ePKGzK.webp"
            alt=""
            className="w-full h-full object-cover opacity-8"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#060d1b] via-[#060d1b]/90 to-[#060d1b]" />
        </div>

        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">Tech Stack</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-16">{t.section_stack}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STACK_CATEGORIES.map((cat, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={scaleIn}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group"
              >
                <div className="rounded-2xl border border-slate-800/60 bg-[#0c1629]/60 backdrop-blur-sm p-6 h-full hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-lg`}>
                      <cat.icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-white">{cat.title[lang]}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cat.items.map((item) => (
                      <span key={item} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-300 text-xs font-mono border border-slate-700/40 hover:border-blue-500/30 hover:text-blue-300 transition-colors cursor-default">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cross-link */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.4, delay: 0.4 }} className="mt-12 text-center">
            <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-blue-400 hover:border-blue-500/40 gap-2 rounded-xl" onClick={() => scrollTo("agents")}>
              <Bot className="h-4 w-4" /> {t.nav_agents}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          LINKS & CONTACT SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="links" className="py-24 relative">
        <div className="container relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">Connect</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold mb-16">{t.section_links}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {LINKS.map((link, i) => (
              <motion.a
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={scaleIn}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="group flex items-center gap-4 p-5 rounded-2xl border border-slate-800/60 bg-[#0c1629]/60 backdrop-blur-sm hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all border border-blue-500/10 group-hover:border-blue-500/30">
                  <link.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-white">{link.label}</div>
                  <div className="text-xs text-slate-500 truncate">{link.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 text-slate-700 group-hover:text-blue-400 transition-colors shrink-0" />
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-800/30 py-12 relative">
        <div className="container relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/favicon_msc-EyS528Y8qNEEzSwHrNmBLT.webp"
                alt="MSc Academy"
                className="h-10 w-10 rounded-xl shadow-lg shadow-blue-500/10"
              />
              <div>
                <div className="font-display font-bold text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MSc Academy</div>
                <div className="text-xs text-slate-500">&copy; {new Date().getFullYear()} Moises Costa. {t.footer_copy}.</div>
              </div>
            </div>

            {/* Footer nav links */}
            <div className="flex items-center gap-6">
              {SECTIONS.map((id) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="text-xs text-slate-500 hover:text-blue-400 transition-colors capitalize"
                >
                  {t[`nav_${id}` as keyof typeof t] || id}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {LINKS.map((link, i) => (
                <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-400 transition-colors">
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Back to top button ────────────────────────────────────────── */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-2xl shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-500 transition-all"
            title={t.back_to_top}
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
