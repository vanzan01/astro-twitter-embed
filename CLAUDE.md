# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm run build    # Compile TypeScript to dist/
npm run dev      # Watch mode for development
```

## Demo Project

The `demo/` folder contains an Astro site for testing:

```bash
cd demo
npm run dev      # Start dev server
npm run build    # Build static site
```

## Architecture

This is an Astro integration that transforms `{% twitter URL %}` syntax in markdown files into static tweet cards at build time. No client-side JavaScript required.

### Data Flow

1. **Integration entry** ([src/index.ts](src/index.ts)) - Exports the Astro integration that registers the rehype plugin
2. **Rehype plugin** ([src/rehype-plugin.ts](src/rehype-plugin.ts)) - Traverses HTML AST to find `{% twitter URL %}` patterns, handles both raw text and auto-linked URLs
3. **Tweet fetcher** ([src/fetch-tweet.ts](src/fetch-tweet.ts)) - Calls Twitter's syndication API (`cdn.syndication.twimg.com`) with token generation, caches results in-memory
4. **HTML renderer** ([src/render-tweet.ts](src/render-tweet.ts)) - Generates static HTML card with inline styles, supports light/dark themes

### Key Implementation Details

- Pattern matching handles two cases: raw URL in text node, or URL split across nodes when markdown auto-links it
- Tweets are fetched in parallel via `Promise.all` for performance
- Token generation uses `(id / 1e15) * Math.PI` formula required by syndication API
- HTML uses inline styles only (no external CSS) for self-contained embeds
- Plugin skips patterns inside `<code>` or `<pre>` blocks
