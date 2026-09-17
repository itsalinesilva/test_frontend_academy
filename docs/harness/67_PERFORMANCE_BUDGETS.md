# 67 — PERFORMANCE BUDGETS

## Web shell
Fast initial navigation and route-level code splitting. Do not load Studio engines on Academy pages.

## Academy
Progressive media loading, cached text and lightweight first paint.

## Studio
Lazy-load heavy editors/engines. Web workers where appropriate. Monitor memory.

## Mobile
Battery/network-aware sync; resumable uploads; background work only where platform permits.

## Python
Queue heavy processing; enforce CPU/memory/time limits; instrument processing time.
