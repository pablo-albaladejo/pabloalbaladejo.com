# AWS Community Day Spain 2026 — CFP submission pack

> Ready-to-paste. Facts verified 2026-07-19 against primary sources (deep
> research, 3-vote adversarial). Every technical claim below is checkable
> against a GA AWS service or an official doc — that's the whole edge.

## Confirmed CFP facts

- **Deadline: 31 Aug 2026, 23:59 (UTC+02:00).** (Call opened 16 Jun.)
- **Event: Sat 17 Oct 2026**, CNTG (Centro de Novas Tecnoloxías de Galicia),
  Santiago de Compostela.
- **Formats: 10 min OR 30 min**, each + 5–10 min Q&A. (No 45-min slot.)
- **All topics welcome; GenAI named explicitly.** Only stated committee
  preference is **level: intermediate-to-advanced technical** (not topic).
- Submit via https://sessionize.com/aws-community-day-spain-2026/

**⚠️ Check on the form yourself (research could NOT confirm):** max number of
proposals per speaker, and whether English is accepted (event is Galicia/ES —
likely Spanish-first; mark Spanish, note you can present in English if a track
needs it).

## Factual corrections applied (so a reviewer can't catch a false claim)

1. **Lambda response streaming is NOT "new/GA in 2026."** GA was **2023**; the
   Apr 2026 milestone is *regional parity* (now in all regions). Phrase it as
   "available in every region," never "new."
2. **OTel GenAI conventions are experimental** ("Development" status), moved to
   their own repo, and use **`gen_ai.provider.name="aws.bedrock"`** — the old
   `gen_ai.system` is deprecated. Don't call them stable.
3. **S3 Vectors + Bedrock KB limits:** ≤1 KB / 35 metadata keys per vector,
   **semantic search only (no hybrid)**. Don't overstate filtering or claim
   hybrid search.

## Priority (submit these; lead with #1)

1. **Multi-tenant RAG** (30 min, advanced) — flagship: every claim verifiable
   against GA services (S3 Vectors GA 2 Dec 2025; Bedrock KB multi-tenancy is
   AWS-documented).
2. **LLM observability on AWS** (30 min, advanced).
3. **GEO** (10 min lightning).
Backups if a slot needs filling: LLM evals (30), 100%-AI-agent software (30).

---

## Reusable form fields

- **Tagline:** Senior Backend + AI Engineer @ Aircall · Creator of Kaiord
- **Bio (~55 words):** Pablo Albaladejo is a Senior Backend + AI engineer at
  Aircall, where his systems process 1M+ call transcriptions a day. He builds
  products end to end with AI agents and created Kaiord — an open-source,
  local-first platform where every line was written by AI agents, published to
  npm and the official MCP registry. He writes about evals, observability and
  agentic development at pabloalbaladejo.com.
- **Links:** pabloalbaladejo.com · linkedin.com/in/pabloalbaladejomestre ·
  github.com/pablo-albaladejo
- **Speaking experience (honest):** newer to big stages; every talk is backed
  by public open-source code and a published essay the audience can verify — a
  4-part dev.to series on observable AI streaming and four technical essays on
  the blog.
- **Why me / why this talk (pattern):** "Everything I present is verifiable:
  the code is open source, the numbers are real, and the essays are published.
  No toy demos — the system I actually run in production."

---

## Talk 1 — Multi-tenant RAG in production with Bedrock Knowledge Bases + S3 Vectors (30 min, advanced) — FLAGSHIP

**Title:** RAG multi-tenant en producción: una sola Knowledge Base de Bedrock, muchos clientes

**Abstract (≥600 chars):**
> ¿Cómo sirves un chatbot RAG con la marca y los datos de decenas de empresas sin montar una infraestructura por cliente? En esta sesión construimos RAG multi-tenant real sobre AWS serverless: una única Amazon Bedrock Knowledge Base con aislamiento por tenant mediante metadata filtering (el patrón "pool" del whitepaper de AWS), respaldada por Amazon S3 Vectors —GA desde diciembre de 2025— como almacén vectorial gestionado que abarata los datasets grandes. Veremos los tres patrones de aislamiento (silo, bridge, pool) y cuándo elegir cada uno, por qué el filtro por tenantId es una frontera de seguridad que hay que imponer en cada query (idealmente server-side), y los límites reales que condicionan el diseño: 1 KB y 35 claves de metadata por vector, y búsqueda semántica (sin híbrida). Todo sobre API Gateway + Lambda + CloudFront, con un widget embebible en vivo. Con lecciones de un producto en producción, no una demo de juguete.

**Level:** Advanced · **Demo:** live embeddable widget against deepgent.net (recorded fallback)

---

## Talk 2 — Observability for LLM pipelines on AWS: from streams to sinks (30 min, advanced)

**Title:** Observabilidad para pipelines de LLM en AWS: de streams a sinks

**Abstract (≥600 chars):**
> Tu dashboard de APM te miente sobre tu pipeline de LLM: la respuesta hace streaming, así que no está terminada cuando el handler retorna, y los payloads que instintivamente loguearías —prompts y respuestas— son exactamente los que no debes capturar. En esta sesión construimos observabilidad para pipelines de LLM en AWS desde cero. Amazon Bedrock con streaming sobre AWS Lambda response streaming (disponible ya en todas las regiones): emitimos las métricas al completar el stream usando el callback flush() de TransformStream como punto de telemetría diferida. Modelamos la telemetría como un puerto de un solo método con sinks intercambiables —empezando por un ring buffer sin infraestructura— y esquemas de eventos donde es imposible filtrar un prompt por accidente. Alineamos la nomenclatura con las convenciones GenAI de OpenTelemetry (aún experimentales; gen_ai.provider.name = "aws.bedrock") para que crecer sea un adapter y no un rewrite. Con código open source y lecciones a escala de más de un millón de transcripciones al día.

**Level:** Advanced · **Demo:** live Lambda emitting telemetry on stream completion (recorded fallback). Backed by streaming-lambda-ai-sdk + the dev.to series.

---

## Talk 3 — GEO: que los agentes de IA te encuentren (10 min, lightning)

**Title:** GEO: que los agentes de IA te encuentren

**Abstract (≥600 chars):**
> Tu próximo visitante importante puede no ser una persona: puede ser ChatGPT decidiendo si citarte. GEO (Generative Engine Optimization) es la hermana rara del SEO: llms.txt, reglas de robots para crawlers de IA, datos estructurados JSON-LD, espejos en Markdown y registros como el oficial de MCP. En diez minutos recorro los cinco mecanismos que apliqué a kaiord.com en un solo día, con enlace a cada artefacto —y con el rechazo que un maintainer me dio esa misma mañana como lección honesta sobre qué pesa de verdad en la distribución: sustancia y tracción, no solo un PR limpio. Cinco mecanismos, cinco minutos de artefactos verificables, y un remate.

**Level:** All levels · **Format:** lightning (10 min)

---

## Backups (short)

- **LLM evals en producción: 22 benchmarks y un gate del 90% en CI** (30 min,
  intermediate) — cómo poner un gate CI a salidas no deterministas; tiers de
  aserciones; por qué 90% y no 100%. Demo: build rojo/verde en vivo.
- **Software de producción escrito 100% por agentes de IA: el sistema, no el
  prompt** (30 min, intermediate) — specs antes de código, CI de tolerancia
  cero, guardas mecánicas, worktrees. Kaiord como prueba (9 paquetes npm,
  release 10.0.0).
