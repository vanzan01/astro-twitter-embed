---
layout: ../layouts/Demo.astro
title: astro-twitter-embed Demo
---

# The First Tweet Ever

This tweet was **statically generated at build time**. No client-side JavaScript. No Twitter widgets.js. Works with ad blockers.

{% twitter https://twitter.com/jack/status/20 %}

## How it works

Just add to your `astro.config.mjs`:

```js
import twitterEmbed from 'astro-twitter-embed';

export default defineConfig({
  integrations: [twitterEmbed()]
})
```

Then in any markdown file:

```md
{% twitter https://twitter.com/jack/status/20 %}
```

That's it. No MDX. No component imports. Just clean markdown.
