# ARCHITECTURE.md — Hybrid Architecture

## 1. Macroarquitetura

```text
Web React
    │
    ▼
Node.js Application/API
    │
    ├── Identity/Auth
    ├── Profile
    ├── Academy
    ├── Community
    ├── Worlds
    ├── Rooms
    ├── Evidence
    ├── Progression
    ├── Entitlements
    ├── Admin
    └── Tool Adapters
             │
             ├── Python Music Engines
             ├── Open-source Score Engines
             ├── Audio/DSP Engines
             ├── MIDI Engines
             └── Specialized ML/MIR Engines
```

## 2. O que fica no Node.js

Adequado ao AI Studio:
- HTTP/API;
- autenticação e sessão;
- autorização;
- RBAC/ABAC;
- usuários;
- perfis;
- cursos;
- trilhas;
- aulas;
- atividades;
- inscrições;
- progresso;
- posts;
- fóruns;
- comentários;
- conexões;
- Rooms;
- eventos;
- rankings;
- badges;
- passaportes;
- credenciais;
- Evidence;
- catálogo;
- entitlements;
- administração;
- notificações;
- orchestration;
- filas;
- upload orchestration;
- integração com storage;
- chamadas para engines externas;
- regras de negócio que não dependam de processamento musical especializado.

## 3. O que deve preferir motores especializados

Quando qualidade/complexidade exigir:
- DSP;
- análise de áudio;
- pitch tracking;
- onset detection;
- beat/rhythm analysis;
- timbre;
- espectro;
- áudio avançado;
- processamento MIDI especializado;
- análise de partitura;
- Music Information Retrieval;
- modelos científicos;
- processamento pesado;
- pipelines de áudio;
- algoritmos pedagógicos quantitativos especializados.

A linguagem não é escolhida por preferência estética. É escolhida pelo melhor motor disponível.

## 4. Contrato Engine Adapter

O Node não deve conhecer detalhes internos de Python.

```text
Domain Use Case
      ↓
Tool Service Interface
      ↓
Engine Adapter
      ↓
HTTP/Queue
      ↓
Python Engine
      ↓
Normalized Result
      ↓
Evidence / Progression / Profile
```

O frontend também não deve chamar diretamente engines privadas.

## 5. Exemplo

Skill de afinação:

```text
Academy Lesson
→ Practice Activity
→ Skill Builder
→ Audio Capture
→ Node Tool API
→ Pitch Engine
→ normalized pitch result
→ accuracy score
→ PracticeSession
→ Evidence
→ Skill Progression
→ Profile
```

## 6. Processamento assíncrono

Jobs pesados devem ser assíncronos quando apropriado:

upload → queue → worker → engine → result → event → UI.

Não bloquear a requisição HTTP esperando processamento longo.

## 7. Dados

PostgreSQL:
- identidade;
- relações;
- progresso;
- catálogo;
- comunidade;
- Rooms;
- credenciais;
- metadados.

Object Storage:
- áudio;
- vídeo;
- imagens;
- partituras;
- projetos;
- arquivos exportados.

Redis:
- cache;
- rate limiting;
- filas quando adotado;
- sessões temporárias;
- jobs.

## 8. Mobile

Mobile deve consumir o mesmo core/API.

Não duplicar regras de negócio.

Offline:
- cache;
- exercícios disponíveis;
- gravações locais;
- fila de sincronização;
- reconciliação.

## 9. IA

IA é uma camada de capacidade, não a fonte de verdade do domínio.

IA pode:
- explicar;
- recomendar;
- gerar variações;
- auxiliar composição;
- resumir;
- sugerir prática;
- interpretar resultados.

IA não deve inventar:
- progresso;
- credenciais;
- resultados de avaliação;
- permissões;
- histórico acadêmico.

Dados determinísticos devem vir do domínio/engine.
