# 25 — KNOWLEDGE AND CONTENT ENGINE

## Mission
Transform the platform's reference books/materials into original, structured, traceable educational content.

## Initial source set
- Bohumil Med
- Donald J. Grout / Claude V. Palisca
- Suzuki
- Hans Sitt
- Maia Bang
- Edinburgh music theory material
- three Berklee books: one harmony and two theory volumes

Exact edition, rights and permitted use must be recorded per source.

## Ingestion pipeline
```text
Source -> SourceVersion -> Page/Chapter/Section
-> Extracted text -> Concepts -> Concept graph
-> Competencies -> Curriculum -> Lessons
-> Exercises -> Assessments -> Review -> Publication
```

## Page-level traceability
When possible preserve source, edition, page, chapter, section and extraction identifier, then connect it to concepts, lessons, exercises and assessments.

The system must answer:
- Which source supports this lesson?
- Where did this concept originate?
- Which exercises measure this competency?

## Copyright
Do not publish copyrighted books as substitutes for the originals.
Allowed transformation patterns:
- summarize;
- synthesize;
- explain in original language;
- create original examples;
- create original diagrams;
- create original exercises;
- cite source/provenance.

Do not reproduce unlicensed copyrighted figures or long passages.

## Knowledge model
Concept = what learner understands.
Competency = what learner can do.
Objective = observable outcome.
Dependency = prerequisite.
Lesson = instruction.
Exercise = practice.
Assessment = measurement.
Evidence = proof.

## Course generation
Input: learner level, prerequisites, competencies, sources, duration, modality, assessment strategy.
Output: course, modules, lessons, resources, exercises, assessments, references and mastery requirements.

Generated objects are versioned.

## Assessment generation
Support multiple choice, multiple select, ordering, matching, text, notation, ear training, rhythm, pitch/performance and score analysis.

Performance assessments must use Music Engine analysis rather than fake correctness.

## AI governance
AI may propose summaries, classifications, concepts, lesson drafts, exercise variants and mappings.
AI may not invent sources/pages/quotations or publish unvalidated source claims.

## Kids Mode
Same knowledge graph and curriculum content. Change language, presentation, interaction, pacing and examples. Do not create a disconnected second knowledge database.

## Lifecycle
```text
DRAFT -> SOURCE_VALIDATED -> GENERATED -> REVIEW_REQUIRED
-> VALIDATED -> PUBLISHED -> DEPRECATED
```
Published content is versioned and never silently overwritten.
