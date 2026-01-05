import { defineConfig } from 'astro/config';
import twitterEmbed from 'astro-twitter-embed';

export default defineConfig({
  integrations: [twitterEmbed()]
});
