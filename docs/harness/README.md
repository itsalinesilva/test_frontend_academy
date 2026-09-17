# Academia Virtual do Músico — Architecture & Product Blueprint v3

Este pacote é a fonte operacional do projeto para produto, UX, domínio, engenharia, IA de desenvolvimento, qualidade e implantação.

## Ordem de leitura obrigatória
00_MASTER_ONBOARDING → 01_PRODUCT_SYSTEM → 02_IDENTITY_PROFILE_SOCIAL → 03_MAPS_PATHS_PASSPORTS → 04_DOMAIN_MODEL → 05_API_SECURITY_INFRA → 06_TOOL_CATALOG → 07_TEACHER_ROOM → 08_PROFILE_EVIDENCE_PORTFOLIO → 09_SOURCE_IP_PROVENANCE → 10_IMPLEMENTATION_ORDER → 11_VERTICAL_SLICES → 12_ADR_DECISIONS → 13_DEFINITION_OF_DONE → 14_COMMERCIAL_STRATEGY.

Depois: 15_SCREEN_CATALOG, 16_SCREEN_CONTRACTS, 17_DESIGN_SYSTEM, 18_FRONTEND_ARCHITECTURE, 19_NODE_BACKEND, 20_PYTHON_ENGINE_ARCHITECTURE, 21_KNOWLEDGE_FRAMEWORK, 22_ACADEMY_ENGINE, 23_PRACTICE_SKILL_BUILDER, 24_SCORE_STUDIO, 25_PRODUCTION_STUDIO, 26_VOICE_EAR_TUNER, 27_INSTRUMENT_SIMULATORS, 28_ROOMS_SCHOOL_ENGINE, 29_COMMUNITY_ENGINE, 30_PROFILE_EVIDENCE_ENGINE, 31_ADMIN_CONSOLE, 32_AUTH_CHILD_GUARDIAN, 33_OFFLINE_SYNC_MOBILE, 34_API_CONTRACTS, 35_TEST_STRATEGY, 36_SECURITY_PRIVACY, 37_OBSERVABILITY, 38_DEPLOYMENT_CLOUDFLARE, 39_AI_STUDIO_PROMPTS, 40_AGENTS_HARNESS, 41_REPOSITORY_STRUCTURE, 42_DATA_SEED_CONTENT, 43_RELEASE_GATES, 44_BUILD_VS_INTEGRATE, 45_OPEN_SOURCE_LICENSE_REGISTER, 46_PRODUCT_ANALYTICS, 47_ACCESSIBILITY, 48_ERROR_EMPTY_LOADING_STATES, 49_DECISION_LOG.

## Regra de autoridade
Os documentos de arquitetura são contratos. Código que contradiz um contrato deve ser considerado defeito ou mudança arquitetural pendente de ADR. O blueprint não autoriza copiar UI/branding de referências; ele define padrões funcionais que serão adaptados ao produto.

## Referências arquiteturais
Coursera: arquitetura de aprendizagem estruturada. Duolingo: prática, feedback e progressão. Skool: Room/School e comunidade de curso. LinkedIn: arquitetura de identidade profissional e portfólio. Ferramentas musicais especializadas: profundidade funcional por categoria.

## Estado inicial
Produto inicialmente gratuito. Entitlement model deve existir desde o início para suportar planos futuros, sem pagamento/paywall na primeira versão. Aluno possui ferramentas básicas; Músico possui acesso futuro às ferramentas completas de produção; Professor possui acesso futuro à criação/gestão de Rooms. Durante a construção inicial, todos os módulos podem permanecer acessíveis para validação interna.

## Administradores fundadores
`alinealv.silv@gmail.com` e `office.alinesilva@gmail.com`. A autorização é server-side por allowlist/role seed; nunca depender apenas de e-mail visível no frontend.
