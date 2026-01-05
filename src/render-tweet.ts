/**
 * Render tweet data as static HTML card
 * Styled to match astro-tweet's appearance
 */

import type { TweetData, TwitterEmbedOptions } from './types.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateFormatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${time} · ${dateFormatted}`;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

function processText(tweet: TweetData, linkColor: string): string {
  let text = escapeHtml(tweet.text);
  if (tweet.entities?.urls) {
    for (const urlEntity of tweet.entities.urls) {
      text = text.replace(
        urlEntity.url,
        `<a href="${urlEntity.expanded_url}" target="_blank" rel="noopener noreferrer" style="color:${linkColor};text-decoration:none">${urlEntity.display_url}</a>`
      );
    }
  }
  text = text.replace(/\n/g, '<br>');
  return text;
}

const ICONS = {
  verified: `<svg viewBox="0 0 22 22" aria-label="Verified account" style="width:18px;height:18px;fill:rgb(29,155,240);margin-left:2px;vertical-align:text-bottom"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/></svg>`,
  xLogo: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:23.75px;height:23.75px;fill:currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  like: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:1.25em;height:1.25em;fill:currentColor"><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"/></svg>`,
  reply: `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:1.25em;height:1.25em;fill:currentColor"><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01z"/></svg>`,
};

interface Colors {
  bg: string;
  bgHover: string;
  border: string;
  text: string;
  textSecondary: string;
  link: string;
  red: string;
  blue: string;
}

function getColors(theme: 'light' | 'dark'): Colors {
  if (theme === 'dark') {
    return {
      bg: 'rgb(21,32,43)',
      bgHover: 'rgb(30,39,50)',
      border: 'rgb(66,83,100)',
      text: 'rgb(247,249,249)',
      textSecondary: 'rgb(139,152,165)',
      link: 'rgb(107,201,251)',
      red: 'rgb(249,24,128)',
      blue: 'rgb(29,155,240)',
    };
  }
  return {
    bg: '#fff',
    bgHover: 'rgb(247,249,249)',
    border: 'rgb(207,217,222)',
    text: 'rgb(15,20,25)',
    textSecondary: 'rgb(83,100,113)',
    link: 'rgb(29,155,240)',
    red: 'rgb(249,24,128)',
    blue: 'rgb(29,155,240)',
  };
}

export function renderTweet(
  tweet: TweetData,
  tweetUrl: string,
  options: TwitterEmbedOptions = {}
): string {
  const theme = options.theme === 'dark' ? 'dark' : 'light';
  const c = getColors(theme);
  const formattedDate = formatDate(tweet.created_at);
  const processedText = processText(tweet, c.link);
  const likes = formatNumber(tweet.favorite_count);
  const verifiedBadge = tweet.user.is_blue_verified ? ICONS.verified : '';

  let photosHtml = '';
  if (tweet.photos && tweet.photos.length > 0) {
    const gridStyle = tweet.photos.length === 1
      ? ''
      : 'display:grid;grid-template-columns:1fr 1fr;gap:2px;';
    photosHtml = `<div style="${gridStyle}margin-top:12px;border-radius:12px;overflow:hidden;border:1px solid ${c.border}">`;
    for (const photo of tweet.photos) {
      photosHtml += `<img src="${photo.url}" alt="" loading="lazy" style="width:100%;height:auto;display:block;object-fit:cover"/>`;
    }
    photosHtml += '</div>';
  }

  return `<div style="width:100%;min-width:250px;max-width:550px;margin:1.5rem auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${c.text};background:${c.bg};border:1px solid ${c.border};border-radius:12px;overflow:hidden">
<article style="padding:12px 16px">
<header style="display:flex;padding-bottom:12px;line-height:20px;font-size:15px">
<a href="https://twitter.com/${tweet.user.screen_name}" target="_blank" rel="noopener noreferrer" style="position:relative;height:48px;width:48px;flex-shrink:0">
<div style="height:100%;width:100%;position:absolute;overflow:hidden;border-radius:9999px">
<img src="${tweet.user.profile_image_url_https.replace('_normal', '_bigger')}" alt="${escapeHtml(tweet.user.name)}" width="48" height="48" style="width:100%;height:100%"/>
</div>
</a>
<div style="display:flex;flex-direction:column;justify-content:center;margin:0 8px;max-width:calc(100% - 84px)">
<a href="https://twitter.com/${tweet.user.screen_name}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:flex;align-items:center">
<span style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(tweet.user.name)}</span>${verifiedBadge}
</a>
<a href="https://twitter.com/${tweet.user.screen_name}" target="_blank" rel="noopener noreferrer" style="color:${c.textSecondary};text-decoration:none">
<span>@${tweet.user.screen_name}</span>
</a>
</div>
<a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" style="margin-left:auto;color:${c.text}" aria-label="View on X">
${ICONS.xLogo}
</a>
</header>
<div style="font-size:1.25rem;font-weight:400;line-height:1.5rem;overflow-wrap:break-word;white-space:pre-wrap">${processedText}</div>
${photosHtml}
<div style="display:flex;align-items:center;color:${c.textSecondary};margin-top:4px">
<a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;font-size:15px;line-height:20px">
<time datetime="${tweet.created_at}">${formattedDate}</time>
</a>
</div>
<div style="display:flex;align-items:center;color:${c.textSecondary};padding-top:4px;margin-top:4px;border-top:1px solid ${c.border};font-size:14px;font-weight:700">
<a href="https://twitter.com/intent/like?tweet_id=${tweet.id_str}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:flex;align-items:center;margin-right:20px">
<div style="color:${c.red};display:flex;align-items:center;justify-content:center;width:calc(1.25em + 12px);height:calc(1.25em + 12px);margin-left:-4px;border-radius:9999px">${ICONS.like}</div>
<span style="margin-left:4px">${likes}</span>
</a>
<a href="https://twitter.com/intent/tweet?in_reply_to=${tweet.id_str}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:flex;align-items:center">
<div style="color:${c.blue};display:flex;align-items:center;justify-content:center;width:calc(1.25em + 12px);height:calc(1.25em + 12px);margin-left:-4px;border-radius:9999px">${ICONS.reply}</div>
<span style="margin-left:4px">Reply</span>
</a>
</div>
<div style="padding:4px 0">
<a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:${c.link};display:flex;align-items:center;justify-content:center;min-height:32px;padding:0 16px;border:1px solid ${c.border};border-radius:9999px;font-weight:700;font-size:15px;line-height:20px">
Read more on X
</a>
</div>
</article>
</div>`;
}

export function renderFallback(tweetUrl: string): string {
  return `<div style="width:100%;min-width:250px;max-width:550px;margin:1.5rem auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:rgb(15,20,25);background:#fff;border:1px solid rgb(207,217,222);border-radius:12px;overflow:hidden">
<article style="padding:12px 16px;text-align:center">
<p style="margin:0 0 12px;color:rgb(83,100,113)">This tweet is unavailable</p>
<a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" style="color:rgb(29,155,240);text-decoration:none;font-weight:500">View on X →</a>
</article>
</div>`;
}
