/**
 * Configuration options for the astro-twitter-embed integration
 */
export interface TwitterEmbedOptions {
  /**
   * Theme for the tweet card
   * @default 'auto'
   */
  theme?: 'light' | 'dark' | 'auto';

  /**
   * Whether to include default CSS styles
   * Set to false to provide your own styling
   * @default true
   */
  includeStyles?: boolean;

  /**
   * Custom regex pattern to match tweet embeds
   * Must have a capture group for the URL
   * @default /{% twitter (https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+) %}/g
   */
  pattern?: RegExp;
}

/**
 * Twitter user data from the syndication API
 */
export interface TweetUser {
  name: string;
  screen_name: string;
  profile_image_url_https: string;
  is_blue_verified?: boolean;
}

/**
 * URL entity within a tweet
 */
export interface TweetUrlEntity {
  url: string;
  expanded_url: string;
  display_url: string;
}

/**
 * Photo/media within a tweet
 */
export interface TweetPhoto {
  url: string;
  width: number;
  height: number;
}

/**
 * Tweet data from the Twitter syndication API
 */
export interface TweetData {
  id_str: string;
  text: string;
  user: TweetUser;
  created_at: string;
  favorite_count: number;
  conversation_count?: number;
  entities?: {
    urls?: TweetUrlEntity[];
  };
  photos?: TweetPhoto[];
  __typename?: string;
}

/**
 * Result of fetching a tweet
 */
export interface FetchTweetResult {
  success: boolean;
  data?: TweetData;
  error?: string;
}
