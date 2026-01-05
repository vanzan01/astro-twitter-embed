# astro-twitter-embed

Static Twitter/X embeds for Astro using `{% twitter URL %}` syntax.

**No MDX required. No client-side JS. Pure markdown. Agent-ready.**

## The Problem

AI agents are becoming the new content creators. But current embed solutions are hostile to them:

```mdx
import { Tweet } from 'some-component'

<Tweet id="1234567890" />
```

This requires agents to understand JSX, manage imports, and handle framework-specific syntax. It's cognitive overhead that produces brittle, framework-locked content.

## The Solution

Semantic template syntax that declares intent, not implementation:

```md
{% twitter https://twitter.com/jack/status/20 %}
```

This is **pure markdown**. No imports. No JSX. No framework lock-in. An agent (or human) writes what they mean, and the build system handles the rest.

## Features

- **Pure markdown** - Works in plain `.md` files, no MDX required
- **Single-line setup** - Just add to your `integrations[]`
- **Static HTML output** - Zero client-side JavaScript
- **No API key required** - Uses Twitter's public syndication API
- **Agent-friendly** - Clean semantic syntax any LLM can understand
- **Ad-blocker safe** - No external scripts to block

## Installation

```bash
npm install astro-twitter-embed
```

## Setup

Add to your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import twitterEmbed from 'astro-twitter-embed';

export default defineConfig({
  integrations: [twitterEmbed()]
});
```

Done.

## Usage

In any markdown file:

```md
---
title: My Blog Post
---

Check out the first tweet ever:

{% twitter https://twitter.com/jack/status/20 %}
```

Both `twitter.com` and `x.com` URLs work. The tweet renders as a static HTML card at build time.

## Why This Matters

### For Humans

Your content stays portable. No framework-specific imports polluting your posts. Switch from Astro to Hugo to whatever comes next - your markdown still works.

### For Agents

LLMs can generate blog posts with embedded tweets without needing to understand React, MDX, or component imports. Just a URL in a template tag. The syntax is self-documenting.

### For Performance

Zero JavaScript shipped to browsers. The entire tweet card is static HTML with inline styles. Works with ad blockers. No external requests after page load.

## Options

```js
twitterEmbed({
  // Theme for tweet cards: 'light' or 'dark'
  theme: 'light',

  // Custom regex pattern (must capture the URL)
  pattern: /{% twitter (https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+) %}/g
})
```

## How It Works

1. The Astro integration injects a rehype plugin into your markdown pipeline
2. The rehype plugin finds `{% twitter URL %}` patterns in your HTML
3. For each tweet, it fetches data from Twitter's syndication API at build time
4. It replaces the pattern with a fully-rendered static HTML card
5. No JavaScript is shipped to the client

All processing happens at build time. Your users get pure HTML.

## Advanced Usage

### Using the Rehype Plugin Directly

```js
import { defineConfig } from 'astro/config';
import { rehypeTwitterEmbed } from 'astro-twitter-embed';

export default defineConfig({
  markdown: {
    rehypePlugins: [[rehypeTwitterEmbed, { theme: 'dark' }]]
  }
});
```

### Fetching Tweet Data Programmatically

```js
import { fetchTweet, renderTweet } from 'astro-twitter-embed';

const result = await fetchTweet('20');
if (result.success) {
  const html = renderTweet(result.data, 'https://twitter.com/jack/status/20');
}
```

## Browser Support

Static HTML with inline styles. Works everywhere. No polyfills needed.

## License

MIT
