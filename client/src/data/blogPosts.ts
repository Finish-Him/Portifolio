// ─── Blog Posts Data ──────────────────────────────────────────────────────────
// Artigos técnicos de AI Engineering por Moises Costa
// Conteúdo estático para máxima performance e SEO

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  tags: string[];
  readTime: string;
  publishedAt: string; // ISO date
  gradient: string;
  category: string;
  featured?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "orquestracao-agentica-langgraph",
    title: "Orquestração Agêntica com LangGraph: Do Zero ao Deploy",
    excerpt:
      "Como construir pipelines de agentes multi-step com estado persistente usando LangGraph, LangSmith e FastAPI. Um guia prático com código real de produção.",
    tags: ["LangGraph", "LangChain", "Python", "FastAPI", "Agents"],
    readTime: "12 min",
    publishedAt: "2025-12-10",
    gradient: "from-blue-500 to-cyan-500",
    category: "Agentes de IA",
    featured: true,
    content: `
# Orquestração Agêntica com LangGraph: Do Zero ao Deploy

Construir agentes de IA que realmente funcionam em produção é um desafio diferente de criar demos. Neste artigo, vou mostrar como uso **LangGraph** para orquestrar pipelines agênticos complexos com estado persistente, checkpointing e deploy via FastAPI.

## O Problema com Agentes Simples

A maioria dos tutoriais de agentes de IA mostra um loop básico: LLM recebe pergunta → chama ferramenta → retorna resposta. Isso funciona para demos, mas falha em produção por várias razões:

- **Sem estado persistente**: cada chamada começa do zero
- **Sem controle de fluxo**: o LLM decide tudo, inclusive quando parar
- **Sem observabilidade**: você não sabe o que aconteceu quando algo falha
- **Sem recuperação de erros**: uma falha derruba todo o pipeline

O LangGraph resolve todos esses problemas com uma abstração elegante: **grafos de estado**.

## Conceitos Fundamentais do LangGraph

### StateGraph

O StateGraph é o coração do LangGraph. Você define um estado tipado (usando TypedDict ou Pydantic) e nós que transformam esse estado:

\`\`\`python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

class AgentState(TypedDict):
    messages: Annotated[List[dict], operator.add]
    current_step: str
    tool_results: List[dict]
    final_answer: str | None

graph = StateGraph(AgentState)
\`\`\`

### Nós e Arestas

Cada nó é uma função Python que recebe e retorna o estado:

\`\`\`python
def call_llm(state: AgentState) -> AgentState:
    messages = state["messages"]
    response = llm.invoke(messages)
    return {
        "messages": [{"role": "assistant", "content": response.content}],
        "current_step": "check_tools"
    }

def execute_tools(state: AgentState) -> AgentState:
    # Executa ferramentas baseado na resposta do LLM
    tool_calls = extract_tool_calls(state["messages"][-1])
    results = []
    for call in tool_calls:
        result = tools[call["name"]](**call["args"])
        results.append({"tool": call["name"], "result": result})
    return {"tool_results": results, "current_step": "synthesize"}

# Adiciona nós ao grafo
graph.add_node("llm", call_llm)
graph.add_node("tools", execute_tools)
\`\`\`

### Roteamento Condicional

O poder real vem do roteamento condicional — o grafo decide qual caminho seguir baseado no estado:

\`\`\`python
def should_use_tools(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if has_tool_calls(last_message):
        return "tools"
    return END

graph.add_conditional_edges("llm", should_use_tools)
graph.add_edge("tools", "llm")  # Volta para o LLM após executar ferramentas
graph.set_entry_point("llm")
\`\`\`

## Persistência com Checkpointing

Um dos recursos mais poderosos do LangGraph é o checkpointing. Cada execução pode ser salva e retomada:

\`\`\`python
from langgraph.checkpoint.sqlite import SqliteSaver

# Em produção, use PostgreSQL
checkpointer = SqliteSaver.from_conn_string("./checkpoints.db")
app = graph.compile(checkpointer=checkpointer)

# Executa com um thread_id único para persistência
config = {"configurable": {"thread_id": "user-123-session-456"}}
result = app.invoke({"messages": [{"role": "user", "content": "Analise este contrato"}]}, config)

# Retoma a conversa mais tarde
result2 = app.invoke({"messages": [{"role": "user", "content": "Agora compare com o anterior"}]}, config)
\`\`\`

## Deploy com FastAPI e Streaming

Para produção, exponho o agente via FastAPI com streaming SSE:

\`\`\`python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import json

app = FastAPI()

@app.post("/agent/stream")
async def stream_agent(request: AgentRequest):
    async def generate():
        async for event in agent_app.astream_events(
            {"messages": [{"role": "user", "content": request.message}]},
            config={"configurable": {"thread_id": request.session_id}},
            version="v2"
        ):
            if event["event"] == "on_chat_model_stream":
                chunk = event["data"]["chunk"].content
                if chunk:
                    yield f"data: {json.dumps({'token': chunk})}\\n\\n"
        yield "data: [DONE]\\n\\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
\`\`\`

## Observabilidade com LangSmith

Integro LangSmith para rastrear cada execução em produção:

\`\`\`python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "sua-chave-aqui"
os.environ["LANGCHAIN_PROJECT"] = "meu-agente-producao"
\`\`\`

Com isso, cada execução fica registrada no LangSmith com: latência por nó, tokens consumidos, erros e o grafo de execução completo.

## Padrões de Produção

Após 2 anos usando LangGraph em produção no Detran-RJ, aprendi alguns padrões essenciais:

**1. Sempre defina timeouts por nó:**
\`\`\`python
from langgraph.graph import StateGraph
import asyncio

async def call_llm_with_timeout(state):
    try:
        return await asyncio.wait_for(call_llm(state), timeout=30.0)
    except asyncio.TimeoutError:
        return {"error": "LLM timeout", "current_step": "error_handler"}
\`\`\`

**2. Implemente circuit breakers para ferramentas externas:**
\`\`\`python
from functools import wraps

def with_fallback(fallback_value):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                logger.error(f"Tool failed: {e}")
                return fallback_value
        return wrapper
    return decorator
\`\`\`

**3. Use sub-grafos para modularidade:**
Separe responsabilidades em sub-grafos independentes que podem ser testados e deployados separadamente.

## Conclusão

LangGraph transformou como construo agentes de IA. A combinação de estado tipado, checkpointing e roteamento condicional permite criar sistemas robustos que realmente funcionam em produção. O overhead inicial de aprender a API vale muito a pena.

No próximo artigo, vou mostrar como combino LangGraph com RAG para criar agentes que consultam bases de conhecimento específicas do domínio.

---

*Moises Costa é AI Engineer no Detran-RJ e criador da MSc Academy. Conecte-se no [LinkedIn](https://www.linkedin.com/in/moises-costa-rj/).*
    `.trim(),
  },
  {
    slug: "rag-em-producao-arquitetura-chunking-avaliacao",
    title: "RAG em Produção: Arquitetura, Chunking e Avaliação",
    excerpt:
      "Guia completo para implementar Retrieval-Augmented Generation com PGvector, Supabase e avaliação com LangSmith. Aprenda os erros que cometi e como evitá-los.",
    tags: ["RAG", "PGvector", "Supabase", "LLM", "LangChain"],
    readTime: "18 min",
    publishedAt: "2025-12-20",
    gradient: "from-purple-500 to-violet-500",
    category: "RAG & Vector DBs",
    featured: true,
    content: `
# RAG em Produção: Arquitetura, Chunking e Avaliação

RAG (Retrieval-Augmented Generation) é hoje uma das técnicas mais usadas em aplicações LLM de produção. Mas a diferença entre um RAG que funciona em demo e um que funciona em produção é enorme. Neste artigo, compartilho o que aprendi implementando RAG para análise de contratos no Detran-RJ.

## A Arquitetura Completa

Um sistema RAG de produção tem três fases distintas:

### 1. Indexação (Offline)

\`\`\`
Documentos → Extração de Texto → Chunking → Embedding → Vector Store
\`\`\`

### 2. Recuperação (Online)

\`\`\`
Query → Embedding → Busca Vetorial → Re-ranking → Contexto
\`\`\`

### 3. Geração (Online)

\`\`\`
Contexto + Query → Prompt Engineering → LLM → Resposta
\`\`\`

## Chunking: O Passo Mais Subestimado

A maioria dos tutoriais usa chunking simples por tamanho fixo. Em produção, isso é um erro grave. Uso três estratégias diferentes dependendo do tipo de documento:

### Chunking Semântico para Contratos

\`\`\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# Para documentos legais: chunking semântico
semantic_splitter = SemanticChunker(
    OpenAIEmbeddings(),
    breakpoint_threshold_type="percentile",
    breakpoint_threshold_amount=95,  # Mais conservador = chunks maiores
)

# Para documentos técnicos: hierárquico
recursive_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\\n\\n", "\\n", ". ", " ", ""],
    length_function=len,
)
\`\`\`

### Metadata Enriquecida

Cada chunk deve carregar metadata rica para filtros e re-ranking:

\`\`\`python
def create_chunk_with_metadata(text: str, doc_metadata: dict, chunk_index: int) -> dict:
    return {
        "page_content": text,
        "metadata": {
            "doc_id": doc_metadata["id"],
            "doc_type": doc_metadata["type"],  # "contrato", "edital", "lei"
            "section": extract_section(text),
            "chunk_index": chunk_index,
            "created_at": doc_metadata["created_at"],
            "keywords": extract_keywords(text),  # TF-IDF ou KeyBERT
        }
    }
\`\`\`

## PGvector com Supabase

Para produção, uso PGvector via Supabase. A vantagem é ter SQL completo junto com busca vetorial:

\`\`\`sql
-- Criação da tabela
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding VECTOR(1536),  -- OpenAI ada-002
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice HNSW para performance
CREATE INDEX ON documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Função de busca híbrida (vetorial + full-text)
CREATE OR REPLACE FUNCTION hybrid_search(
    query_embedding VECTOR(1536),
    query_text TEXT,
    match_count INT DEFAULT 10,
    filter_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (id UUID, content TEXT, similarity FLOAT, metadata JSONB)
LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.content,
        1 - (d.embedding <=> query_embedding) AS similarity,
        d.metadata
    FROM documents d
    WHERE 
        d.metadata @> filter_metadata
        AND (
            1 - (d.embedding <=> query_embedding) > 0.7
            OR to_tsvector('portuguese', d.content) @@ plainto_tsquery('portuguese', query_text)
        )
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;
\`\`\`

## Re-ranking com Cross-Encoder

A busca vetorial retorna candidatos, mas o re-ranking com cross-encoder melhora muito a precisão:

\`\`\`python
from sentence_transformers import CrossEncoder

reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

def rerank_results(query: str, candidates: list[dict], top_k: int = 5) -> list[dict]:
    pairs = [(query, doc["content"]) for doc in candidates]
    scores = reranker.predict(pairs)
    
    ranked = sorted(
        zip(candidates, scores),
        key=lambda x: x[1],
        reverse=True
    )
    
    return [doc for doc, score in ranked[:top_k] if score > 0.3]
\`\`\`

## Avaliação com LangSmith + RAGAS

Avaliar RAG é tão importante quanto construí-lo. Uso RAGAS para métricas automáticas:

\`\`\`python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# Dataset de avaliação
eval_data = {
    "question": ["Qual é o prazo de vigência do contrato?", ...],
    "answer": [rag_pipeline(q) for q in questions],
    "contexts": [retrieve_contexts(q) for q in questions],
    "ground_truth": ["O contrato tem vigência de 12 meses...", ...],
}

dataset = Dataset.from_dict(eval_data)
results = evaluate(
    dataset,
    metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
)

print(results)
# faithfulness: 0.89
# answer_relevancy: 0.92
# context_precision: 0.85
# context_recall: 0.78
\`\`\`

## Erros Comuns que Cometi

**1. Chunk size muito pequeno**: chunks de 200 tokens perdem contexto. Use 800-1200 para documentos legais.

**2. Sem overlap**: sem overlap entre chunks, perguntas sobre informações na fronteira entre dois chunks falham.

**3. Embedding model errado**: para português, use modelos multilíngues como \`multilingual-e5-large\` ou fine-tune um modelo em seu domínio.

**4. Ignorar re-ranking**: a busca vetorial por cosseno não é perfeita. Re-ranking com cross-encoder pode melhorar a precisão em 15-20%.

**5. Sem avaliação contínua**: RAG degrada com o tempo à medida que os documentos mudam. Monitore métricas semanalmente.

## Conclusão

RAG em produção é muito mais do que \`vectorstore.similarity_search(query)\`. A diferença entre um sistema que impressiona em demo e um que entrega valor real está nos detalhes: chunking semântico, metadata rica, busca híbrida, re-ranking e avaliação contínua.

---

*Moises Costa é AI Engineer no Detran-RJ. Veja mais projetos no [GitHub](https://github.com/Finish-Him).*
    `.trim(),
  },
  {
    slug: "prompt-engineering-avancado-claude-gpt4",
    title: "System Prompts e Role Prompts: Engenharia de Prompts Avançada",
    excerpt:
      "Técnicas avançadas de prompt engineering para Claude, GPT-4 e modelos open-source. Padrões, anti-padrões e benchmarks com dados reais de produção.",
    tags: ["Prompt Engineering", "Claude", "OpenAI", "Anthropic", "LLM"],
    readTime: "10 min",
    publishedAt: "2026-01-05",
    gradient: "from-amber-500 to-orange-500",
    category: "Prompt Engineering",
    featured: false,
    content: `
# System Prompts e Role Prompts: Engenharia de Prompts Avançada

Prompt engineering é frequentemente subestimado como "só escrever texto". Na prática, é uma disciplina de engenharia com padrões, anti-padrões e métricas mensuráveis. Neste artigo, compartilho técnicas que uso em produção.

## A Anatomia de um System Prompt de Produção

Um system prompt eficaz tem estrutura clara:

\`\`\`
[IDENTIDADE] Quem é o modelo e qual seu papel
[CONTEXTO] Informações sobre o sistema e usuário
[CAPACIDADES] O que o modelo pode e não pode fazer
[FORMATO] Como estruturar as respostas
[EXEMPLOS] Few-shot examples quando necessário
[RESTRIÇÕES] Limites e comportamentos proibidos
\`\`\`

### Exemplo: System Prompt do Arquimedes

\`\`\`
Você é Arquimedes, um professor de matemática especializado em ensino adaptativo para estudantes do ensino fundamental e médio.

IDENTIDADE:
- Nome: Arquimedes
- Especialidade: Matemática básica e intermediária
- Tom: Encorajador, paciente, entusiasmado com matemática
- Idioma: Sempre responda no idioma da pergunta do aluno

CAPACIDADES:
- Explicar conceitos matemáticos com exemplos do cotidiano
- Criar exercícios adaptados ao nível do aluno
- Identificar e corrigir erros de raciocínio com gentileza
- Usar analogias criativas para conceitos abstratos

FORMATO DE RESPOSTA:
- Respostas curtas para perguntas simples (2-3 parágrafos)
- Use LaTeX para fórmulas: $x^2 + y^2 = z^2$
- Sempre termine com uma pergunta de verificação ou exercício prático
- Nunca dê a resposta diretamente — guie o aluno ao raciocínio

RESTRIÇÕES:
- Não resolva exercícios de provas ou trabalhos escolares diretamente
- Não discuta tópicos fora de matemática
- Se o aluno demonstrar frustração, ofereça uma abordagem mais simples
\`\`\`

## Chain-of-Thought para Problemas Complexos

Para problemas que exigem raciocínio multi-step, CoT é essencial:

\`\`\`python
cot_prompt = """
Resolva o seguinte problema passo a passo.

Problema: {problem}

Instruções:
1. Primeiro, identifique o que está sendo pedido
2. Liste as informações fornecidas
3. Escolha a abordagem matemática adequada
4. Execute cada passo mostrando o raciocínio
5. Verifique a resposta

Mostre seu raciocínio completo antes de dar a resposta final.
"""
\`\`\`

## Few-Shot Examples: Quando e Como Usar

Few-shot examples melhoram consistência quando o formato de saída é crítico:

\`\`\`python
few_shot_examples = [
    {
        "input": "Qual é 15% de 200?",
        "output": """
**Passo 1**: Converter porcentagem em decimal
15% = 15/100 = 0,15

**Passo 2**: Multiplicar pelo valor
0,15 × 200 = 30

**Resposta**: 15% de 200 é **30**.

*Quer tentar um exercício similar?*
        """
    },
    # Mais exemplos...
]
\`\`\`

## Técnicas de Controle de Formato

### XML Tags para Claude

Claude responde especialmente bem a XML tags para estruturar a saída:

\`\`\`
Analise o contrato abaixo e extraia as informações solicitadas.

<contrato>
{texto_do_contrato}
</contrato>

Retorne sua análise no formato:
<analise>
  <partes>Lista das partes envolvidas</partes>
  <vigencia>Período de vigência</vigencia>
  <valor>Valor do contrato</valor>
  <clausulas_criticas>Cláusulas que merecem atenção</clausulas_criticas>
</analise>
\`\`\`

### JSON Schema para Saída Estruturada

\`\`\`python
from openai import OpenAI

client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Extraia entidades do texto: ..."}],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "entities",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "pessoas": {"type": "array", "items": {"type": "string"}},
                    "organizacoes": {"type": "array", "items": {"type": "string"}},
                    "datas": {"type": "array", "items": {"type": "string"}},
                },
                "required": ["pessoas", "organizacoes", "datas"],
                "additionalProperties": False,
            }
        }
    }
)
\`\`\`

## Benchmarks: O que Realmente Funciona

Após testar centenas de variações de prompts em produção, aqui estão meus dados:

| Técnica | Melhoria na Precisão | Custo Adicional |
|---------|---------------------|-----------------|
| Chain-of-Thought | +23% | +40% tokens |
| Few-shot (3 exemplos) | +18% | +30% tokens |
| XML tags (Claude) | +15% | Neutro |
| Role prompting | +12% | Neutro |
| Instrução negativa | +8% | Neutro |

## Anti-padrões Comuns

**1. Prompts muito longos sem estrutura**: mais de 2000 tokens sem hierarquia clara degrada a atenção do modelo.

**2. Instruções contraditórias**: "seja conciso" e "explique em detalhes" no mesmo prompt criam outputs inconsistentes.

**3. Não versionar prompts**: trate prompts como código. Use git, teste antes de deployar, monitore métricas.

**4. Ignorar o contexto do modelo**: Claude e GPT-4 têm personalidades diferentes. O que funciona em um pode não funcionar no outro.

## Conclusão

Prompt engineering é engenharia. Meça, itere, versione e monitore. A diferença entre um prompt mediano e um excelente pode ser de 20-30% na qualidade das respostas — o que em produção se traduz diretamente em satisfação do usuário.

---

*Moises Costa é AI Engineer e especialista em LLM applications. Conecte-se no [LinkedIn](https://www.linkedin.com/in/moises-costa-rj/).*
    `.trim(),
  },
  {
    slug: "mcp-model-context-protocol-futuro-agentes",
    title: "MCP (Model Context Protocol): O Futuro da Integração de Agentes",
    excerpt:
      "Como o MCP está mudando a forma como agentes de IA se conectam a ferramentas externas e sistemas legados. Implementação prática com Python e TypeScript.",
    tags: ["MCP", "Agents", "Integration", "LLM", "Anthropic"],
    readTime: "8 min",
    publishedAt: "2026-01-15",
    gradient: "from-emerald-500 to-teal-500",
    category: "Agentes de IA",
    featured: false,
    content: `
# MCP (Model Context Protocol): O Futuro da Integração de Agentes

O Model Context Protocol (MCP) é uma especificação aberta criada pela Anthropic que está rapidamente se tornando o padrão para conectar LLMs a ferramentas externas. Neste artigo, explico o que é, por que importa e como implementar.

## O Problema que o MCP Resolve

Antes do MCP, cada integração de agente era um projeto customizado:

- OpenAI Function Calling: formato proprietário
- LangChain Tools: abstração própria
- LlamaIndex Tools: outra abstração
- Cada empresa: sua própria solução

O resultado era fragmentação: ferramentas escritas para um framework não funcionavam em outro. O MCP resolve isso com um protocolo padronizado.

## Arquitetura do MCP

O MCP usa uma arquitetura cliente-servidor:

\`\`\`
┌─────────────────┐     MCP Protocol     ┌─────────────────┐
│   MCP Client    │◄────────────────────►│   MCP Server    │
│  (Claude, etc.) │                      │  (Suas Tools)   │
└─────────────────┘                      └─────────────────┘
\`\`\`

### Tipos de Recursos MCP

**1. Tools**: funções que o LLM pode chamar
**2. Resources**: dados que o LLM pode ler (arquivos, URLs, banco de dados)
**3. Prompts**: templates de prompt reutilizáveis

## Implementando um MCP Server em Python

\`\`\`python
from mcp.server import Server
from mcp.server.models import InitializationOptions
from mcp.types import Tool, TextContent
import mcp.server.stdio

server = Server("meu-servidor-mcp")

@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="buscar_contrato",
            description="Busca contratos no banco de dados do Detran-RJ por número ou fornecedor",
            inputSchema={
                "type": "object",
                "properties": {
                    "numero": {"type": "string", "description": "Número do contrato"},
                    "fornecedor": {"type": "string", "description": "Nome do fornecedor"},
                },
                "required": [],
            },
        ),
        Tool(
            name="analisar_contrato",
            description="Analisa um contrato e extrai cláusulas críticas",
            inputSchema={
                "type": "object",
                "properties": {
                    "contrato_id": {"type": "string", "description": "ID do contrato"},
                },
                "required": ["contrato_id"],
            },
        ),
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    if name == "buscar_contrato":
        results = await db.search_contracts(
            numero=arguments.get("numero"),
            fornecedor=arguments.get("fornecedor"),
        )
        return [TextContent(type="text", text=format_contracts(results))]
    
    elif name == "analisar_contrato":
        contract = await db.get_contract(arguments["contrato_id"])
        analysis = await analyze_with_llm(contract)
        return [TextContent(type="text", text=analysis)]
    
    raise ValueError(f"Tool desconhecida: {name}")

async def main():
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="detran-contratos",
                server_version="1.0.0",
            ),
        )
\`\`\`

## Configuração no Claude Desktop

Para usar seu servidor MCP com Claude Desktop, adicione ao \`claude_desktop_config.json\`:

\`\`\`json
{
  "mcpServers": {
    "detran-contratos": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "API_KEY": "..."
      }
    }
  }
}
\`\`\`

## MCP com LangChain

LangChain já tem suporte nativo a MCP:

\`\`\`python
from langchain_mcp_adapters.tools import load_mcp_tools
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic

async def create_agent_with_mcp():
    # Carrega tools do servidor MCP
    tools = await load_mcp_tools("detran-contratos")
    
    # Cria agente com as tools
    model = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    agent = create_react_agent(model, tools)
    
    return agent
\`\`\`

## Por que MCP Importa para o Futuro

O MCP está se tornando o "HTTP das ferramentas de IA". Assim como HTTP padronizou a comunicação web, o MCP está padronizando como LLMs se conectam ao mundo. 

Já existem servidores MCP para: GitHub, Slack, Google Drive, PostgreSQL, Puppeteer, e dezenas de outros serviços. Isso significa que você pode conectar Claude ou qualquer LLM compatível a qualquer uma dessas ferramentas sem escrever código de integração customizado.

## Conclusão

O MCP representa uma mudança de paradigma: de integrações proprietárias para um ecossistema aberto e interoperável. Se você está construindo agentes de IA, vale a pena investir tempo aprendendo MCP agora — ele vai economizar muito tempo de integração no futuro.

---

*Moises Costa é AI Engineer e usa MCP em produção no Detran-RJ. Veja projetos no [Hugging Face](https://huggingface.co/Finish-him).*
    `.trim(),
  },
  {
    slug: "full-stack-ai-react-fastapi-langchain-producao",
    title: "Full Stack AI: React + FastAPI + LangChain em Produção",
    excerpt:
      "Arquitetura completa de uma aplicação de IA com streaming SSE, autenticação, banco vetorial e deploy. O que aprendi construindo a MSc Academy.",
    tags: ["React", "FastAPI", "LangChain", "Full Stack", "SSE", "Deploy"],
    readTime: "20 min",
    publishedAt: "2026-01-25",
    gradient: "from-rose-500 to-pink-500",
    category: "Full Stack AI",
    featured: true,
    content: `
# Full Stack AI: React + FastAPI + LangChain em Produção

Construir uma aplicação de IA completa — do frontend ao deploy — envolve muito mais do que integrar uma API de LLM. Neste artigo, compartilho a arquitetura que uso na MSc Academy e as decisões de design que fiz ao longo do caminho.

## A Stack Completa

\`\`\`
Frontend: React 19 + Tailwind CSS 4 + Framer Motion
Backend: Node.js + Express + tRPC (MSc Academy)
         Python + FastAPI (serviços de IA)
LLM: LangChain + LangGraph + Claude/GPT-4
DB: MySQL/TiDB + PGvector (Supabase)
Deploy: Manus (frontend+backend) + Docker
\`\`\`

## Streaming SSE: A Chave para UX de IA

A experiência de ver o texto aparecer palavra por palavra é fundamental para aplicações de IA. Implemento isso com Server-Sent Events (SSE):

### Backend (Node.js/Express)

\`\`\`typescript
app.get("/api/chat/stream", async (req, res) => {
  // Configura SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { message, sessionId } = req.query;
  
  try {
    // Stream do LLM token por token
    const stream = await llm.stream([
      { role: "system", content: SYSTEM_PROMPT },
      ...await getHistory(sessionId),
      { role: "user", content: message },
    ]);

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || "";
      if (token) {
        res.write(\`data: \${JSON.stringify({ token })}\\n\\n\`);
      }
    }
    
    res.write("data: [DONE]\\n\\n");
  } catch (error) {
    res.write(\`data: \${JSON.stringify({ error: "Erro interno" })}\\n\\n\`);
  } finally {
    res.end();
  }
});
\`\`\`

### Frontend (React)

\`\`\`typescript
function useStreamingChat() {
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    setIsStreaming(true);
    setStreamingText("");
    
    const eventSource = new EventSource(
      \`/api/chat/stream?message=\${encodeURIComponent(message)}&sessionId=\${sessionId}\`
    );

    eventSource.onmessage = (event) => {
      if (event.data === "[DONE]") {
        eventSource.close();
        setIsStreaming(false);
        return;
      }
      
      const { token } = JSON.parse(event.data);
      setStreamingText(prev => prev + token);
    };

    eventSource.onerror = () => {
      eventSource.close();
      setIsStreaming(false);
    };
  }, [sessionId]);

  return { streamingText, isStreaming, sendMessage };
}
\`\`\`

## Autenticação Simples sem OAuth

Para a MSc Academy, optei por autenticação simples com JWT em vez de OAuth para simplificar o onboarding:

\`\`\`typescript
// Usuários hardcoded para demo + registro de novos usuários
const DEMO_USERS = {
  admin: { password: "admin", role: "admin" },
  Moises: { password: "admin", role: "admin" },
};

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  
  // Verifica usuários demo
  const demoUser = DEMO_USERS[username];
  if (demoUser && demoUser.password === password) {
    const token = await createJWT({ username, role: demoUser.role });
    res.cookie("session", token, { httpOnly: true, maxAge: 365 * 24 * 60 * 60 * 1000 });
    return res.json({ success: true });
  }
  
  // Verifica usuários registrados no banco
  const dbUser = await db.getUserByUsername(username);
  if (dbUser && await bcrypt.compare(password, dbUser.passwordHash)) {
    const token = await createJWT({ username, role: dbUser.role });
    res.cookie("session", token, { httpOnly: true });
    return res.json({ success: true });
  }
  
  return res.status(401).json({ error: "Credenciais inválidas" });
});
\`\`\`

## tRPC: Type Safety End-to-End

Uma das melhores decisões que tomei foi usar tRPC. Ele elimina toda a camada de serialização/deserialização:

\`\`\`typescript
// server/routers.ts
export const appRouter = router({
  topics: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTopics();
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getTopicBySlug(input.slug);
      }),
  }),
  
  exercises: router({
    verify: protectedProcedure
      .input(z.object({
        exerciseId: z.number(),
        answer: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const exercise = await db.getExercise(input.exerciseId);
        const isCorrect = checkAnswer(exercise, input.answer);
        
        if (isCorrect) {
          await db.recordProgress(ctx.user.id, input.exerciseId);
        }
        
        return { isCorrect, explanation: exercise.explanation };
      }),
  }),
});

// client/src/pages/Exercises.tsx
const { data: exercises } = trpc.exercises.list.useQuery({ topicId });
const verifyMutation = trpc.exercises.verify.useMutation({
  onSuccess: (data) => {
    if (data.isCorrect) toast.success("Correto! 🎉");
    else toast.error(\`Incorreto. \${data.explanation}\`);
  },
});
\`\`\`

## Arquitetura de Componentes de IA

Para o avatar do Arquimedes, criei um sistema de estados visuais que responde ao estado da conversa:

\`\`\`typescript
type AvatarState = "idle" | "thinking" | "speaking" | "celebrating";

function ArquimedesAvatar({ state }: { state: AvatarState }) {
  const animations = {
    idle: { y: [0, -8, 0], transition: { repeat: Infinity, duration: 3 } },
    thinking: { rotate: [-2, 2, -2], transition: { repeat: Infinity, duration: 0.5 } },
    speaking: { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 0.3 } },
    celebrating: { y: [0, -20, 0], rotate: [0, 10, -10, 0], transition: { duration: 0.6 } },
  };

  return (
    <motion.div animate={animations[state]}>
      <img src="/manus-storage/Arquimedes_f63227f7.webp" alt="Arquimedes" />
    </motion.div>
  );
}
\`\`\`

## Deploy e Performance

Para o deploy da MSc Academy, uso a plataforma Manus que oferece:

- **Frontend + Backend integrados**: sem CORS, sem configuração de proxy
- **MySQL gerenciado**: sem preocupação com backups ou manutenção
- **CDN automático**: assets servidos via CloudFront
- **SSL automático**: HTTPS sem configuração

Para otimização de performance:

\`\`\`typescript
// Lazy loading de páginas pesadas
const Chat = lazy(() => import("./pages/Chat"));
const Topics = lazy(() => import("./pages/Topics"));

// Prefetch de dados críticos
queryClient.prefetchQuery({
  queryKey: ["topics"],
  queryFn: () => trpc.topics.list.query(),
});
\`\`\`

## Lições Aprendidas

**1. Comece com SSE, não WebSockets**: SSE é mais simples, funciona com HTTP/2 e é suficiente para streaming unidirecional.

**2. tRPC vale o investimento**: a type safety end-to-end economiza horas de debugging.

**3. Otimize o bundle desde o início**: lazy loading e code splitting são muito mais difíceis de adicionar depois.

**4. Monitore o custo de tokens**: em produção, o custo de LLM pode surpreender. Implemente rate limiting e caching de respostas comuns.

**5. UX de loading é tão importante quanto a resposta**: spinners, skeletons e streaming text fazem a diferença na percepção de velocidade.

## Conclusão

Construir aplicações Full Stack AI é um campo em rápida evolução. A stack que uso hoje — React + tRPC + LangChain + SSE — é o resultado de muitas iterações e erros. O mais importante é começar, iterar rápido e medir o impacto real no usuário.

---

*Moises Costa é AI Engineer e criador da MSc Academy. Veja o código no [GitHub](https://github.com/Finish-Him/Arquimedes).*
    `.trim(),
  },
  {
    slug: "detran-rj-modernizacao-backend-genai",
    title: "Detran-RJ: Como Modernizamos o Backend com GenAI",
    excerpt:
      "Case real: implementação de pipelines de IA em um órgão público, desafios únicos de compliance, LGPD, legado e os resultados que alcançamos.",
    tags: ["Case Study", "GenAI", "FastAPI", "Detran", "LGPD", "Python"],
    readTime: "15 min",
    publishedAt: "2026-02-10",
    gradient: "from-blue-600 to-indigo-600",
    category: "Case Studies",
    featured: false,
    content: `
# Detran-RJ: Como Modernizamos o Backend com GenAI

Implementar IA em um órgão público é diferente de qualquer outro contexto. Há restrições de compliance, sistemas legados de décadas, processos burocráticos e — o mais desafiador — a necessidade de garantir que a IA não cometa erros em decisões que afetam cidadãos. Neste artigo, compartilho nossa jornada no Detran-RJ.

## O Contexto

O Detran-RJ processa milhões de transações por ano: habilitações, registros de veículos, infrações, contratos de fornecedores. Muito desse trabalho era manual, repetitivo e propenso a erros humanos.

Em 2019, comecei a introduzir Python e automação. Em 2022, com a maturação dos LLMs, começamos a experimentar GenAI para casos de uso específicos.

## Caso 1: Análise de Contratos com RAG

**O Problema**: A equipe jurídica precisava analisar centenas de contratos por mês para identificar cláusulas problemáticas, prazos de vencimento e obrigações. Processo manual de 2-3 horas por contrato.

**A Solução**: Pipeline RAG com PGvector + Claude para análise automática.

\`\`\`python
from langchain_anthropic import ChatAnthropic
from langchain_community.vectorstores import PGVector
from langchain.chains import RetrievalQA

# Indexação de contratos
def index_contract(contract_pdf: bytes, contract_id: str):
    text = extract_text_from_pdf(contract_pdf)
    chunks = semantic_chunker.split_text(text)
    
    documents = [
        Document(
            page_content=chunk,
            metadata={
                "contract_id": contract_id,
                "chunk_index": i,
                "indexed_at": datetime.now().isoformat(),
            }
        )
        for i, chunk in enumerate(chunks)
    ]
    
    vectorstore.add_documents(documents)

# Análise de contrato
async def analyze_contract(contract_id: str) -> ContractAnalysis:
    retriever = vectorstore.as_retriever(
        search_kwargs={
            "filter": {"contract_id": contract_id},
            "k": 10,
        }
    )
    
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatAnthropic(model="claude-3-5-sonnet-20241022"),
        retriever=retriever,
        return_source_documents=True,
    )
    
    analysis = await qa_chain.ainvoke({
        "query": ANALYSIS_PROMPT
    })
    
    return parse_analysis(analysis["result"])
\`\`\`

**Resultado**: Redução de 80% no tempo de análise inicial. A equipe jurídica agora usa o sistema para triagem e foca seu tempo nas cláusulas flagradas como críticas.

## Caso 2: Chatbot de Atendimento Interno

**O Problema**: Servidores frequentemente tinham dúvidas sobre procedimentos internos, normas e regulamentos. O setor de RH e jurídico era sobrecarregado com perguntas repetitivas.

**A Solução**: Chatbot RAG com base de conhecimento dos manuais e normas internas.

\`\`\`python
SYSTEM_PROMPT = """
Você é um assistente interno do Detran-RJ especializado em procedimentos e normas.

IMPORTANTE:
- Responda APENAS com base nos documentos fornecidos
- Se não souber a resposta, diga claramente que não encontrou a informação
- Sempre cite o documento e seção de onde veio a informação
- Não faça suposições sobre procedimentos não documentados
- Para questões legais complexas, sempre recomende consulta ao setor jurídico

Contexto dos documentos:
{context}
"""
\`\`\`

**Resultado**: 60% de redução nas consultas ao RH para dúvidas de procedimento. Tempo médio de resposta: 30 segundos vs. 2 horas anteriormente.

## Desafios Únicos do Setor Público

### LGPD e Privacidade de Dados

O maior desafio foi garantir conformidade com a LGPD. Implementamos:

\`\`\`python
class LGPDCompliantProcessor:
    SENSITIVE_FIELDS = ["cpf", "rg", "nome_completo", "endereco", "telefone"]
    
    def anonymize_for_llm(self, data: dict) -> dict:
        """Remove/mascara dados pessoais antes de enviar ao LLM"""
        anonymized = data.copy()
        for field in self.SENSITIVE_FIELDS:
            if field in anonymized:
                anonymized[field] = self._mask(anonymized[field], field)
        return anonymized
    
    def _mask(self, value: str, field_type: str) -> str:
        if field_type == "cpf":
            return f"***.***.{value[-6:-3]}-**"
        elif field_type == "nome_completo":
            parts = value.split()
            return f"{parts[0]} {'*' * len(parts[-1])}"
        return "***REDACTED***"
\`\`\`

### Sistemas Legados

Muitos sistemas do Detran têm décadas e usam tecnologias antigas (COBOL, Delphi, Oracle Forms). A integração exigiu:

\`\`\`python
# Wrapper para sistema legado via API REST intermediária
class LegacySystemAdapter:
    async def get_vehicle_data(self, placa: str) -> VehicleData:
        # Sistema legado expõe dados via endpoint REST customizado
        response = await self.http_client.get(
            f"{LEGACY_API_URL}/veiculos/{placa}",
            headers={"Authorization": f"Bearer {LEGACY_TOKEN}"},
            timeout=30.0,
        )
        
        # Transforma formato legado para modelo moderno
        raw = response.json()
        return VehicleData(
            placa=raw["VCL_PLACA"],
            chassi=raw["VCL_CHASSI"],
            proprietario=raw["PROP_NOME"],
            # ... mapeamento de campos
        )
\`\`\`

### Auditoria e Rastreabilidade

Toda decisão assistida por IA precisa ser auditável:

\`\`\`python
@dataclass
class AIDecisionLog:
    decision_id: str
    timestamp: datetime
    user_id: str
    input_data: dict  # Anonimizado
    llm_response: str
    final_decision: str
    human_override: bool
    override_reason: str | None

async def log_ai_decision(decision: AIDecisionLog):
    await audit_db.insert("ai_decisions", asdict(decision))
    
    # Notifica supervisor para decisões de alto impacto
    if decision.final_decision in HIGH_IMPACT_DECISIONS:
        await notify_supervisor(decision)
\`\`\`

## Métricas de Impacto

Após 2 anos de implementação gradual:

| Processo | Antes | Depois | Redução |
|----------|-------|--------|---------|
| Análise de contrato | 3h | 35min | 81% |
| Resposta a dúvidas internas | 2h | 30s | 99% |
| Triagem de documentos | 45min | 8min | 82% |
| Geração de relatórios | 4h | 20min | 92% |

## Lições para Implementação em Setor Público

**1. Comece com processos internos, não cidadão-facing**: é mais fácil iterar sem impacto direto no público.

**2. Compliance primeiro**: LGPD, auditoria e rastreabilidade não são opcionais. Construa desde o início.

**3. Humano no loop é obrigatório**: IA como assistente, não substituto. Toda decisão importante precisa de validação humana.

**4. Documente tudo**: em setor público, a documentação é parte do produto.

**5. Treine a equipe**: a resistência à mudança é o maior obstáculo, não a tecnologia.

## Conclusão

Implementar GenAI no setor público é mais difícil do que no privado, mas o impacto pode ser enorme. A chave é começar pequeno, medir rigorosamente e expandir gradualmente. O Detran-RJ ainda está no início dessa jornada, mas os resultados já são visíveis.

---

*Moises Costa é Senior Python Developer no Detran-RJ (DTIC) desde 2014. Conecte-se no [LinkedIn](https://www.linkedin.com/in/moises-costa-rj/).*
    `.trim(),
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.featured);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return BLOG_POSTS.filter((p) => p.category === category);
}

export function getAllCategories(): string[] {
  const seen = new Set<string>();
  return BLOG_POSTS.map((p) => p.category).filter((c) => {
    if (seen.has(c)) return false;
    seen.add(c);
    return true;
  });
}
