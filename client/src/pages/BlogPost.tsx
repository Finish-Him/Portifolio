import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, Clock, Tag, Calendar, Rss,
  Linkedin, Github, ArrowRight, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPostBySlug, BLOG_POSTS } from "@/data/blogPosts";
import { Streamdown } from "streamdown";

interface BlogPostProps {
  slug: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function BlogPost({ slug }: BlogPostProps) {
  const post = useMemo(() => getPostBySlug(slug), [slug]);

  // Related posts (same category, excluding current)
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    return BLOG_POSTS.filter(
      (p) => p.slug !== slug && (p.category === post.category || p.featured)
    ).slice(0, 3);
  }, [post, slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#060d1b] text-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-slate-700 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-white mb-2">Artigo não encontrado</h1>
          <p className="text-slate-400 mb-6">O artigo que você está procurando não existe ou foi removido.</p>
          <Link href="/blog">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d1b] text-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="border-b border-slate-800/60 bg-[#060d1b]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/blog">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Blog</span>
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <Rss className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-bold text-white truncate max-w-[200px]">{post.title}</span>
          </div>
          <div className="w-24" />
        </div>
      </div>

      {/* ── Article Header ──────────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/8 via-transparent to-purple-600/8" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="container relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Category + gradient bar */}
            <div className="flex items-center gap-3 mb-6">
              <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${post.gradient}`} />
              <span className="text-sm font-bold text-blue-400 uppercase tracking-widest">{post.category}</span>
              {post.featured && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                  Destaque
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-800/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime} de leitura
              </span>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs border border-slate-700/40 font-mono">
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Article Content ─────────────────────────────────────────────── */}
      <section className="pb-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none
              prose-headings:font-display prose-headings:font-extrabold
              prose-h1:text-3xl prose-h1:text-white prose-h1:mb-6 prose-h1:mt-10
              prose-h2:text-2xl prose-h2:text-white prose-h2:mb-4 prose-h2:mt-8
              prose-h3:text-xl prose-h3:text-slate-100 prose-h3:mb-3 prose-h3:mt-6
              prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-4
              prose-strong:text-white prose-strong:font-bold
              prose-code:text-cyan-300 prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
              prose-pre:bg-[#0c1629] prose-pre:border prose-pre:border-slate-700/60 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:text-slate-400 prose-blockquote:italic
              prose-ul:text-slate-300 prose-ol:text-slate-300
              prose-li:mb-1
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300
              prose-table:border-collapse
              prose-th:bg-slate-800/60 prose-th:text-slate-200 prose-th:p-3 prose-th:border prose-th:border-slate-700/60
              prose-td:text-slate-300 prose-td:p-3 prose-td:border prose-td:border-slate-700/60
              prose-hr:border-slate-800/60"
          >
            <Streamdown>{post.content}</Streamdown>
          </motion.div>
        </div>
      </section>

      {/* ── Author Card ─────────────────────────────────────────────────── */}
      <section className="pb-16">
        <div className="container max-w-4xl">
          <div className="rounded-2xl border border-slate-800/60 bg-[#0c1629]/60 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-blue-500/20 flex-shrink-0">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663548238703/KFrFYg84PBb8CrQscNDMJb/profile_ai_engineer-Y3uUawQh9TVRML9GeMC5Kr.webp"
                alt="Moises Costa"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1">Autor</p>
              <h3 className="text-white font-display font-bold text-lg mb-1">Moises Costa</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                AI Engineer & Full Stack Developer. 12+ anos em TI, 6+ anos em Python. Senior Developer no Detran-RJ (DTIC). Top 1 Brasil e Top 8 Global no Manus Academy.
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <a href="https://www.linkedin.com/in/moises-costa-rj/" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 gap-1.5">
                  <Linkedin className="h-3.5 w-3.5" />
                  LinkedIn
                </Button>
              </a>
              <a href="https://github.com/Finish-Him" target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="border-slate-700/60 text-slate-400 hover:text-white gap-1.5">
                  <Github className="h-3.5 w-3.5" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Posts ───────────────────────────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="pb-24">
          <div className="container max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px flex-1 max-w-[40px] bg-gradient-to-r from-blue-500 to-transparent" />
              <span className="text-blue-400 text-xs font-bold tracking-widest uppercase">Leia Também</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {relatedPosts.map((related, i) => (
                <motion.div
                  key={related.slug}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Link href={`/blog/${related.slug}`}>
                    <div className="group rounded-xl border border-slate-800/60 bg-[#0c1629]/60 p-4 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-900/10 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
                      <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${related.gradient} mb-3`} />
                      <h4 className="text-sm font-bold text-white leading-snug mb-2 group-hover:text-blue-100 transition-colors flex-1">
                        {related.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-3 border-t border-slate-800/40">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {related.readTime}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Back to Blog ────────────────────────────────────────────────── */}
      <section className="pb-24">
        <div className="container max-w-4xl">
          <div className="flex flex-wrap gap-3">
            <Link href="/blog">
              <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-white gap-2">
                <ArrowLeft className="h-4 w-4" />
                Todos os artigos
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="border-slate-700/60 text-slate-400 hover:text-white gap-2">
                Portfólio
              </Button>
            </Link>
            <Link href="/arquimedes/chat">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white border-0 gap-2">
                Testar Arquimedes
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
