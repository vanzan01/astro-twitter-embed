/**
 * Fetch tweet data from Twitter's syndication API
 * Uses the same approach as astro-tweet - no API key required
 */

import type { TweetData, FetchTweetResult } from './types.js';

const SYNDICATION_URL = 'https://cdn.syndication.twimg.com';

// Cache for tweet data to avoid re-fetching during build
const tweetCache = new Map<string, TweetData | null>();

/**
 * Generate auth token for syndication API
 */
function getToken(id: string): string {
  return ((Number(id) / 1e15) * Math.PI)
    .toString(6 ** 2)
    .replace(/(0+|\.)/g, '');
}

/**
 * Extract tweet ID from a Twitter/X URL
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(/status\/(\d+)/);
  return match ? match[1] : null;
}

/**
 * Fetch tweet data from Twitter's syndication API
 */
export async function fetchTweet(tweetId: string): Promise<FetchTweetResult> {
  // Return cached data if available
  if (tweetCache.has(tweetId)) {
    const cached = tweetCache.get(tweetId);
    if (cached) {
      return { success: true, data: cached };
    }
    return { success: false, error: 'Tweet not found (cached)' };
  }

  try {
    const url = new URL(`${SYNDICATION_URL}/tweet-result`);
    url.searchParams.set('id', tweetId);
    url.searchParams.set('lang', 'en');
    url.searchParams.set(
      'features',
      [
        'tfw_timeline_list:',
        'tfw_follower_count_sunset:true',
        'tfw_tweet_edit_backend:on',
        'tfw_refsrc_session:on',
        'tfw_fosnr_soft_interventions_enabled:on',
        'tfw_show_birdwatch_pivots_enabled:on',
        'tfw_show_business_verified_badge:on',
        'tfw_duplicate_scribes_to_settings:on',
        'tfw_use_profile_image_shape_enabled:on',
        'tfw_show_blue_verified_badge:on',
        'tfw_legacy_timeline_sunset:true',
        'tfw_show_gov_verified_badge:on',
        'tfw_show_business_affiliate_badge:on',
        'tfw_tweet_edit_frontend:on',
      ].join(';')
    );
    url.searchParams.set('token', getToken(tweetId));

    const response = await fetch(url.toString());

    if (response.ok) {
      const data = (await response.json()) as TweetData;

      // Check for tombstone (deleted/unavailable tweet)
      if (data.__typename === 'TweetTombstone') {
        tweetCache.set(tweetId, null);
        return { success: false, error: 'Tweet unavailable' };
      }

      tweetCache.set(tweetId, data);
      return { success: true, data };
    }

    tweetCache.set(tweetId, null);
    return { success: false, error: `HTTP ${response.status}` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[astro-twitter-embed] Failed to fetch tweet ${tweetId}:`, message);
    tweetCache.set(tweetId, null);
    return { success: false, error: message };
  }
}

/**
 * Clear the tweet cache (useful for testing)
 */
export function clearTweetCache(): void {
  tweetCache.clear();
}
