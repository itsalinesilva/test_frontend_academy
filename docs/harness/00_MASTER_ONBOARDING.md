# 00 — MASTER ONBOARDING / CONSTITUTION

## 1. O produto
Uma plataforma musical acadêmica e criativa integrada. Academia, Mundos, Community, Studio, Rooms e Profile são partes de um único sistema de identidade, conhecimento, prática, criação e evidência.

## 2. A promessa funcional
O usuário entra para estudar ou fazer música e encontra, no mesmo ambiente: conhecimento completo, trilhas, exercícios, simuladores, partitura, afinação, metrônomo, treino auditivo, voz, gravação, produção, portfólio, comunidade e ensino.

## 3. O que não pode acontecer
- Não construir um “portal de cards”.
- Não construir uma DAW falsa.
- Não construir simuladores meramente decorativos.
- Não separar progresso, prática, produção e identidade em bancos sem relação.
- Não criar um Kids superficial.
- Não copiar visualmente as referências.
- Não colocar no frontend regras de autorização.
- Não tratar uma biblioteca externa como se fosse propriedade da plataforma.

## 4. Cadastro
Modalidades primárias: Aluno, Músico, Professor e Criança.

Aluno é a entrada acadêmica gratuita. Músico e Professor são títulos/capacidades que podem ser adquiridos/obtidos conforme a estratégia comercial. Criança é uma modalidade de experiência com guardian, proteção e pedagogia adaptada.

O título não limita a navegação. É uma camada de identidade/capacidade. Um aluno pode praticar, produzir, participar de Community e tornar-se Professor. Um Professor continua sendo aluno e músico. Uma criança pode construir histórico sem perder continuidade ao migrar de modo.

## 5. Admin
Dois administradores fundadores são semeados no backend. Toda tela administrativa exige role/capability server-side, auditoria e proteção contra alteração client-side.

## 6. Tecnologia
Web: React/TypeScript no AI Studio, backend Node.js/TypeScript, API REST inicialmente; banco PostgreSQL; storage de objetos para mídia; filas/Redis quando necessários. Engines especializadas: serviços Python independentes por adapter, principalmente para DSP, análise de áudio, music21/MIDI, score parsing e processamento científico. Cloudflare na borda. Mobile nativo consome a mesma API e implementa cache/offline conforme contrato.

## 7. Knowledge framework
O conteúdo acadêmico nasce de referências licenciadas/adquiridas e de fontes de domínio público/API. O sistema deve armazenar provenance, bibliografia, edição, página/seção quando permitido, licença e relação entre fonte e expressão autoral. A expressão pedagógica da plataforma é autoral; não reproduzir livros protegidos integralmente.

## 8. Harness do agente
Antes de qualquer implementação: ler docs relevantes; verificar árvore do repositório; procurar implementação existente; identificar contratos; alterar o mínimo necessário; executar testes; atualizar documentação; registrar decisão quando mudar contrato.
