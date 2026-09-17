# TOOLING.md — Skill Builder / Studio Engine Strategy

## Principle

A ferramenta deve ser real para sua categoria.

Não construir uma versão superficial de uma ferramenta profissional apenas para dizer que ela existe.

## Layer A — Node/Web

Responsável por:
- tool catalog;
- tool routing;
- session lifecycle;
- user state;
- presets;
- exercise definitions;
- permissions;
- evidence;
- progress;
- UI state;
- collaboration;
- persistence.

## Layer B — Specialized engines

Responsável por processamento musical especializado.

### Exemplos de classes

Audio:
- recording analysis;
- waveform;
- pitch;
- onset;
- tempo;
- rhythm;
- spectrum;
- loudness;
- timbre.

MIDI:
- parsing;
- timing;
- note events;
- velocity;
- quantization;
- analysis.

Score:
- notation parsing;
- music representation;
- rendering;
- playback mapping;
- analysis.

Pedagogy:
- intonation;
- rhythm accuracy;
- sight-reading evaluation;
- ear-training evaluation;
- instrument-specific analysis.

## Tool abstraction

Cada ferramenta deve declarar:

ToolDefinition
- id;
- category;
- capabilities;
- required inputs;
- output schema;
- engine;
- version;
- entitlement;
- evidence types;
- supported platforms.

## Pedagogical preset

Exemplo:

```text
Instrument: Violin
Level: 1
Skill: Intonation
Method: [available licensed/public-domain methodology]
Work/Repertoire: [licensed/public-domain source]
Exercise: ...
Difficulty: ...
Target metrics: pitch/timing/etc.
```

O preset é contexto pedagógico, não cópia automática de material protegido.

## Skill Builder modes

1. Guided from Academy
2. Independent practice
3. Experiment
4. Create
5. Analyze
6. Challenge
7. Assessment

## Evidence

Uma sessão pode produzir:
- score;
- recording;
- attempt;
- artifact;
- project;
- achievement.

Depois:

PracticeSession → Evidence → SkillProgress → Profile.

## Studio split

### Oficina / Skill Builder
Aprender fazendo, testar, praticar, experimentar e desenvolver habilidades.

### Production Studio
Ambiente completo de produção musical:
- áudio;
- MIDI;
- piano roll;
- timeline;
- tracks;
- arrangement;
- editing;
- mixer;
- automation;
- effects;
- instruments;
- samples;
- rendering/export;
- projects;
- collaboration;
- AI-assisted creation quando implementado.

A versão de produção completa pode permanecer arquiteturalmente preparada para entitlement pago, mas o lançamento inicial é gratuito.
