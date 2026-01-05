/**
 * astro-twitter-embed
 *
 * Static Twitter/X embeds for Astro using {% twitter URL %} syntax.
 * No MDX required, no client-side JS, AI-agent-friendly.
 */

import type { AstroIntegration } from 'astro';
import { rehypeTwitterEmbed } from './rehype-plugin.js';
import type { TwitterEmbedOptions } from './types.js';

export type { TwitterEmbedOptions } from './types.js';
export { rehypeTwitterEmbed } from './rehype-plugin.js';
export { fetchTweet, extractTweetId, clearTweetCache } from './fetch-tweet.js';
export { renderTweet, renderFallback } from './render-tweet.js';

/**
 * Astro integration for static Twitter embeds
 *
 * @example
 * ```js
 * // astro.config.mjs
 * import twitterEmbed from 'astro-twitter-embed';
 *
 * export default defineConfig({
 *   integrations: [twitterEmbed()]
 * })
 * ```
 *
 * Then in any markdown file:
 * ```md
 * {% twitter https://x.com/user/status/123456789 %}
 * ```
 */
export default function twitterEmbed(
  options: TwitterEmbedOptions = {}
): AstroIntegration {
  return {
    name: 'astro-twitter-embed',
    hooks: {
      'astro:config:setup': ({ updateConfig, logger }) => {
        logger.info('Adding rehype plugin for Twitter embeds');

        updateConfig({
          markdown: {
            rehypePlugins: [[rehypeTwitterEmbed, options]],
          },
        });
      },
    },
  };
}
