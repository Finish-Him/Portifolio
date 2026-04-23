# MSc Academy - Arquimedes Math Agent TODO

## Fase 1: Setup e Infraestrutura
- [x] Upload assets (logo MSc, avatar Arquimedes) via manus-upload-file
- [x] Configurar paleta de cores MSc no index.css (roxo, azul royal, índigo, lavanda, dourado)
- [x] Configurar tipografia (Google Fonts) e tema escuro MSc
- [x] Criar schema do banco de dados (topics, exercises, chat_sessions, chat_messages, user_progress)
- [x] Executar migrações SQL

## Fase 2: Backend
- [x] Endpoint SSE para chat com streaming LLM token-a-token (/api/chat/stream)
- [x] System prompt do Arquimedes (personalidade, didática, contexto matemático)
- [x] Router tRPC para tópicos matemáticos (listar, detalhar)
- [x] Router tRPC para exercícios (listar por tópico/nível, verificar resposta, gerar via LLM)
- [x] Router tRPC para progresso do aluno (salvar, consultar)
- [x] Router tRPC para TTS (converter texto em áudio via Forge API)
- [x] Router tRPC para geração de imagens ilustrativas
- [x] Seed de exercícios pré-gerados por tópico e nível
- [x] Autenticação no endpoint SSE via cookie de sessão (segurança)
- [x] Notificações ao dono sobre marcos de progresso (10 exercícios, 5-streak)

## Fase 3: Frontend
- [x] Layout principal com navegação (topbar) e tema MSc
- [x] Página Home/Landing com apresentação da plataforma e CTA
- [x] Página de Chat com streaming SSE token-a-token
- [x] Indicador de digitação do Arquimedes durante streaming
- [x] Renderização de markdown nas respostas do chat (Streamdown)
- [x] Página de Tópicos (cards dos 7 tópicos com ícones)
- [x] Página de Exercícios por tópico com feedback imediato
- [x] Painel de Progresso do aluno (estatísticas, conquistas)
- [x] Design responsivo mobile/desktop
- [x] Modo escuro com tema MSc
- [x] Transições suaves e micro-interações (Framer Motion)
- [x] Player de áudio TTS com controles (play/pause/replay) no chat
- [x] Avatar Arquimedes com estados visuais (idle, thinking, speaking, celebrating)

## Fase 4: Assets Visuais
- [x] Gerar imagens ilustrativas para cada tópico matemático (7 imagens)
- [x] Integrar imagens nos cards de tópicos

## Fase 5: Testes e Deploy
- [x] Testes vitest para routers principais (11 testes passando)
- [x] Checkpoint e deploy no Manus (https://arquimath-kfrfyg84.manus.space)
- [x] Repositório no GitHub (https://github.com/Finish-Him/Arquimedes)
- [x] Space no Hugging Face (https://huggingface.co/spaces/Finish-him/MSc-Academy)

## Fase 6: Reestruturação de Rotas
- [x] Mover Arquimedes para /arquimedes (chat, tópicos, exercícios, progresso)
- [x] Home page como portfólio de agentes MSc Academy
- [x] Card do Atlas (próximo agente) na home
- [x] AppLayout atualizado com navegação por agente

## Fase 7: README e Documentação
- [x] README.md bilíngue (EN + PT) com badges, cores e formatação visual
- [x] Commit e push final com documentação completa

## Fase 8: Redesign Completo — Portfólio AI Engineer

### Autenticação Simplificada
- [x] Remover Manus OAuth, implementar login simples com users hardcoded
- [x] Criar usuário admin/admin e Moises/admin
- [x] Criar página de login com formulário estilizado
- [x] Permitir acesso demo sem login (1 click da home)

### Paleta de Cores — Roxo → Azul
- [x] Substituir paleta roxo por paleta azul em index.css
- [x] Atualizar todos os componentes para usar nova paleta azul
- [x] Corrigir logo com fundo branco em background escuro (usando rounded-lg)

### Home Page — Portfólio AI Engineer para Recrutadores
- [x] Seção 1: Hero/Headline — AI Engineer Developer (primeira impressão impactante)
- [x] Seção 2: Conquistas (Top 8 Manus Global, Top 1 BR, Manus Academy, Langchain Academy, Anthropic Academy)
- [x] Seção 3: Agentes IA (Arquimedes, Atlas, Artemis) com acesso direto 1-click demo
- [x] Seção 4: Experiência Profissional (Detran-RJ, Equipe de Desenvolvimento DTIC)
- [x] Seção 5: Links (LinkedIn, GitHub, HuggingFace)
- [x] Seção 6: Download de Currículo (CTA LinkedIn como alternativa)
- [x] SEO agressivo com meta tags, keywords, Open Graph, structured data
- [x] Multi-idioma: PT, EN, ES
- [x] Copy voltada para recrutadores AI Engineer (nacional e internacional)
- [x] Menos texto, mais informação visual
- [x] Remover ícones genéricos
- [x] CTAs estratégicos para recrutadores

### Assets
- [x] Upload das imagens de ranking (top1.png, Top8Manus.jpg)
- [x] Corrigir logo MSc sem fundo branco (rounded-lg no container)

### Gaps a Resolver
- [x] Adicionar conquistas LangChain Academy e Anthropic Academy na seção About
- [x] Implementar JSON-LD structured data no index.html
- [x] Tratar logo MSc para remover fundo branco em dark mode (rounded container)

## Fase 9: Home Page Premium — Visual Impactante

### Assets Visuais (Nano Banana)
- [x] Hero banner/background com estilo tech AI
- [x] Favicon customizado MSc Academy (.ico + 192px)
- [x] Imagem de perfil profissional estilizada
- [x] Ícones/ilustrações para seções (agentes, stack, carreira)

### Visual Premium
- [x] Gradientes sofisticados e degradês multi-camada
- [x] Efeitos 3D e relevo nos cards
- [x] Tipografia impactante com hierarquia visual clara
- [x] Transições e animações suaves entre seções
- [x] Bordas e sombras com profundidade
- [x] Micro-interações em hover/focus

### Navegação Interconectada
- [x] Menu sticky com scroll-spy (highlight da seção ativa)
- [x] Botões de navegação entre seções (scroll indicator)
- [x] CTAs em cada seção levando para outras partes do site
- [x] Botão "voltar ao topo" flutuante
- [x] Breadcrumbs visuais ou indicador de progresso de scroll
- [x] Links cruzados entre agentes, stack e carreira
- [x] Zero páginas órfãs — tudo interconectado

### Seções Otimizadas
- [x] Cada seção com propósito claro e objetivo visual
- [x] Menos texto, mais informação visual
- [x] Cards com hover 3D e sombras dinâmicas
- [x] Seção de conquistas com imagens reais dos rankings

## Fase 10: Atualizações v2.1
- [x] Upload assets Artemis (avatar, principal, voz) e logos Detran-RJ
- [x] HuggingFace e WhatsApp (+55 21 99074-1351) adicionados na seção Links
- [x] Seção Detran expandida: história 12 anos, concurso 2013, posse 04/04/2014, DTIC
- [x] Logo Detran-RJ na seção de carreira
- [x] Página placeholder Blog
- [x] Página placeholder Atlas
- [x] Página placeholder Artemis com avatar
- [x] Página de Cadastro (Register)
- [x] Navbar atualizada: Blog, Artemis Demo, Atlas Demo, Arquimedes Demo, Login, Criar Conta visíveis
- [x] Testes e checkpoint v2.1 (15/15 passando)

## Fase 11: Blog SEO + Hero CTAs v2.2
- [x] HuggingFace e WhatsApp adicionados ao hero da Home (Seção Principal) — segunda linha de CTAs
- [x] Blog completo com 5 artigos técnicos de AI Engineering (conteúdo real, não placeholder)
- [x] Página de listagem do Blog com busca, filtro por categoria e post em destaque
- [x] Página de artigo individual (/blog/:slug) com markdown, autor, posts relacionados
- [x] Dados de artigos em /client/src/data/blogPosts.ts (estático, SEO-friendly)
- [x] Rota /blog/:slug registrada no App.tsx
- [x] Artigos publicados: LangGraph, RAG em Produção, Prompt Engineering, MCP, Full Stack AI, Detran-RJ Case Study

## Fase 13: Suíte Completa de Testes

- [x] Instalar Playwright e configurar para E2E
- [x] Testes unitários: db helpers (saveContactLead, getTopics, etc.)
- [x] Testes unitários: atlasStreaming system prompt builder
- [x] Testes unitários: streaming.ts helpers
- [x] Testes de integração: tRPC contact.submitContact
- [x] Testes de integração: tRPC auth.me (autenticado e não autenticado)
- [x] Testes de integração: endpoint SSE /api/chat/stream
- [x] Testes de integração: endpoint SSE /api/atlas/stream
- [x] Testes E2E: Home page carrega corretamente
- [x] Testes E2E: Navegação entre páginas (Blog, Agents)
- [x] Testes E2E: Chat do Arquimedes envia mensagem e recebe resposta
- [x] Testes E2E: Formulário de contato submissão com sucesso
- [x] Testes E2E: Download do CV
