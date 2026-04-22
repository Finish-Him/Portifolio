import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, BookOpen, Clock, Tag, Rss, Sparkles,
  ArrowRight, Calendar, Search, Filter, ExternalLink,
  Linkedin, Github
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOG_POSTS, getAllCategories } from "@/data/blogPosts";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => ["Todos", ...getAllCategories()], []);

  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchesCategory =
        selectedCategory === "Todos" || post.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = BLOG_POSTS.find((p) => p.featured);

  return (
    <div className="min-h-screen bg-[#060d1b] text-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/60 bg-[#060d1b]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">MSc Academy</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Rss className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white">Blog</span>
          </div>
          <div className="w-24" />
        </div>
      </div>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="container relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI Engineering na Prática — Artigos técnicos por Moises Costa
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-4 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Blog
              </span>{" "}
              <span className="text-white">de AI Engineering</span>
            </h1>
            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl">
              Artigos técnicos sobre LangChain, LangGraph, RAG, prompt engineering, FastAPI e arquitetura de agentes de IA em produção. Conteúdo baseado em experiência real.
            </p>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar artigos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-slate-800/80 transition-all text-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Featured Post ───────────────────────────────────────────────── */}
      {featuredPost && !searchQuery && selectedCategory === "Todos" && (
        <section className="pb-12">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">Destaque</span>
            </div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.5 }}
            >
              <Link href={`/blog/${featuredPost.slug}`}>
                <div className="group rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#0c1629]/80 to-[#0a1020]/80 backdrop-blur-sm p-8 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 grid lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${featuredPost.gradient}`} />
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{featuredPost.category}</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                          Destaque
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mb-3 leading-tight group-hover:text-blue-100 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-slate-400 leading-relaxed mb-6">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {featuredPost.tags.map((tag) => (
                          <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 text-slate-400 text-xs border border-slate-700/40 font-mono">
                            <Tag className="h-2.5 w-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(featuredPost.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {featuredPost.readTime} de leitura
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center lg:justify-end">
                      <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:gap-4 transition-all">
                        <span>Ler artigo</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Category Filter ─────────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="container">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-slate-500" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-white border border-slate-700/40"
                }`}
              >
                {cat}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500">
              {filteredPosts.length} artigo{filteredPosts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </section>

      {/* ── Posts Grid ──────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="container">
          <AnimatePresence mode="wait">
            {filteredPosts.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20"
              >
                <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500">Nenhum artigo encontrado para "{searchQuery}"</p>
                <button
                  onClick={() => { setSearchQuery(""); setSelectedCategory("Todos"); }}
                  className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  Limpar filtros
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPosts.map((post, i) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="group rounded-2xl border border-slate-800/60 bg-[#0c1629]/60 backdrop-blur-sm p-6 h-full hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col">
                        {/* Top */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${post.gradient}`} />
                          <span className="px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 text-xs border border-slate-600/40">
                            {post.category}
                          </span>
                        </div>

                        <h3 className="font-display font-bold text-white text-base mb-3 leading-snug group-hover:text-blue-100 transition-colors flex-1">
                          {post.title}
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-5 line-clamp-3">
                          {post.excerpt}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs border border-slate-700/40 font-mono">
                              <Tag className="h-2.5 w-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-4 border-t border-slate-800/40">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-10 text-center"
          >
            <h3 className="text-xl font-display font-bold text-white mb-3">
              Quer mais conteúdo de AI Engineering?
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Siga no LinkedIn para notificações de novos artigos, projetos open-source e insights sobre IA em produção.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="https://www.linkedin.com/in/moises-costa-rj/" target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 gap-2">
                  <Linkedin className="h-4 w-4" />
                  Seguir no LinkedIn
                </Button>
              </a>
              <a href="https://github.com/Finish-Him" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-white gap-2">
                  <Github className="h-4 w-4" />
                  Ver GitHub
                </Button>
              </a>
              <Link href="/">
                <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-white gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Portfólio
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
