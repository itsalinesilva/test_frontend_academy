# DESIGN.md — Visual & Interaction System v1

## 1. Identidade

A Academia Virtual do Músico deve parecer uma instituição musical contemporânea: séria, sofisticada, acessível e tecnicamente moderna.

A identidade combina:
- tradição musical;
- disciplina;
- cultura;
- tecnologia;
- produção;
- comunidade.

Evitar aparência infantil de aplicativo de exercícios e evitar estética de rede social genérica.

## 2. Paleta

Base:
- branco;
- preto;
- cinzas neutros.

Acento:
- vermelho profundo/institucional.

O vermelho é acento de identidade e ação, não preenchimento permanente.

Referência conceitual:
- tradição de casas de ópera;
- preto como sofisticação contemporânea;
- vermelho como presença, palco e tradição.

Não usar vermelho saturado em todos os elementos.

Estados:
- sucesso: verde discreto;
- alerta: âmbar discreto;
- erro: vermelho de erro distinto do vermelho de marca quando necessário.

## 3. Princípios

### Silêncio visual
Espaço em branco é intencional.

### Função antes de decoração
Todo elemento deve possuir função informacional, operacional ou de orientação.

### Uma ação principal
Uma tela deve ter uma ação dominante quando existir uma ação principal.

### Profundidade progressiva
Mostrar primeiro o essencial e revelar complexidade conforme o usuário aprofunda.

### Conteúdo é interface
Não transformar automaticamente conteúdo em cards.

### Consistência
O mesmo padrão deve possuir o mesmo comportamento.

### Mobile first
Toda experiência deve funcionar em mobile antes de receber complexidade desktop.

## 4. Proibições

Não utilizar:
- estética neon;
- excesso de gradientes;
- fundos animados;
- visual gamer;
- excesso de badges decorativos;
- emojis como elementos estruturais da UI;
- ornamentos musicais aleatórios;
- dashboards feitos de dezenas de cards;
- gamificação infantil.

## 5. Tipografia

Base recomendada:
- sans-serif contemporânea para UI;
- serif editorial opcional para títulos culturais/editoriais.

A tipografia deve carregar hierarquia antes da cor.

## 6. Navegação

Web:
- sidebar ou navegação equivalente;
- hierarquia clara;
- acesso direto aos seis ambientes.

Mobile:
- navegação inferior ou padrão equivalente;
- cinco áreas primárias no máximo por superfície;
- Studio/Skill Builder pode receber posição de destaque quando o contexto justificar.

## 7. Referências arquiteturais

As referências são funcionais, não cópias visuais.

Academia → Coursera
Skill Builder → Duolingo + ferramentas especializadas
Rooms → Skool
Profile → LinkedIn
Score Studio → MuseScore/Dorico
Partitura/prática → Tomplay
Produção → DAW profissional
Ear Training → ferramentas especializadas

A referência define o padrão de categoria.
A Academia define a adaptação musical.

## 8. Perfil

Uma identidade única.

Seções:
- identidade;
- formação;
- competências;
- prática;
- repertório;
- instrumentos;
- Worlds;
- credenciais;
- produções;
- performances;
- Rooms;
- Community;
- portfolio.

A ordem e visibilidade das seções podem ser configuráveis.

## 9. Admin

Admin pode ser mais técnico.

Pode mostrar:
- métricas;
- tabelas;
- logs;
- IDs;
- estados;
- jobs;
- erros;
- permissões;
- health;
- auditoria.

A superfície Admin não precisa seguir a mesma densidade visual do produto público.

## REFERENCE ARCHITECTURE POLICY

Coursera:
Use as reference for:
- academic information architecture;
- course discovery;
- curriculum;
- lesson progression;
- learning history;
- course presentation;
- academic completion.

Do not copy:
- branding;
- visual identity;
- proprietary components;
- exact layouts.

Duolingo:
Use as reference for:
- micro-learning;
- exercise loops;
- immediate feedback;
- progression;
- streaks;
- mastery;
- motivation;
- practice UX.

Do not copy:
- visual identity;
- mascots;
- exact interaction design.

Astra Trainer:
Use as reference for:
- training;
- skill progression;
- practice feedback;
- exercise-oriented interaction.

LinkedIn:
Use as reference for:
- professional identity;
- profile architecture;
- experience;
- evidence;
- portfolio;
- public/private information;
- professional presentation.

Do not implement:
- direct messaging;
- generic professional network mechanics.

Skool:
Use as reference for:
- teacher-owned rooms;
- classroom community;
- course/community relationship;
- teacher/student structure;
- classroom content organization.

Do not copy:
- branding;
- proprietary UI;
- implementation.

Professional DAWs:
Use as reference for:
- timeline;
- mixer;
- tracks;
- recording;
- editing;
- routing;
- production workflow.

Professional notation software:
Use as reference for:
- notation editing;
- playback;
- score manipulation;
- MusicXML/MIDI;
- composition workflow.

The platform's identity remains its own.
References inform architecture, not imitation.
