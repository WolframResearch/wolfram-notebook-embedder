---
id: NotebookLoadingPhases
title: Notebook Loading Phases
---

## Rendering phases

Notebooks depend on various things that are loaded asynchronously, e.g. the actual notebook content, CSS, JavaScript, fonts and (potentially) results from kernel evaluations. While things are loading, static pieces of HTML are rendered if available (see [server-side rendering](./ServerSideRendering.md)). Rendering generally goes through the following phases:

1. Nothing is displayed initially.
2. Once critical CSS and fonts are loaded: Static HTML is displayed, if available; the event `first-paint-done` with `{showingStaticHTML: true}` is fired.
3. Once the main JavaScript code and notebook content data is loaded: Static HTML is reused as a whole (albeit in a slightly different container structure); the event `initial-render-progress` with `{cellsRendered: 0, cellsTotal: -1}` is fired.
4. Once other dependencies, such as the notebook stylesheet, are loaded and notebook-level options are resolved (possibly relying on kernel evaluations): Static HTML for individual cells is rendered; the event `initial-render-progress` with `{cellsRendered: 0, cellsTotal: N}` is fired with the actual number `N` of initially visible cells. If no static HTML was available initially, the event `first-paint-done` is fired at this point. The notebook also starts fetching static HTML for cells that were not present in the initial static HTML.
5. Each cell might require additional dependencies (e.g. fonts), resolution of `Dynamic` option values, resolution of `Dynamic` content, etc. Once a cell becomes ready, it is "live-rendered", while other non-ready cells are still rendered using static HTML; the event `initial-render-progress` with `{cellsRendered: M, cellsTotal: N}` is fired accordingly.
6. Once all cells have been live-rendered: The event `initial-render-done` is fired.

If no static HTML is available for the notebook as a whole or for individual cells, a loading background is displayed in their place until they are live-rendered.

## Progress indicator

By default, notebooks show a (blue) progress indicator at the top during the initial render phase. It can be turned off by setting the option `showRenderProgress: false`. The progress indicator distinguishes between two groups of phases:

1. (Phases 1–3 above.) An indeterminate progress indicator is shown.
2. (Phases 4–6 above.) A determinate progress indicator is shown, based on the number of rendered vs. total cells, as long as there are at least three cells in the notebook. If there are fewer than three cells, another indeterminate progress indicator is shown (since a determinate progress indicator would jump too much and not give a real impression of progress).

Once the initial render phase is over, the progress indicator is hidden.
