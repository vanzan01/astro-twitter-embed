/**
 * Rehype plugin for processing {% twitter URL %} patterns
 * Runs on HTML (after markdown conversion), supports async fetching
 */

import { visitParents } from 'unist-util-visit-parents';
import { fromHtml } from 'hast-util-from-html';
import type { Root, Element, Text } from 'hast';
import type { TwitterEmbedOptions } from './types.js';
import { fetchTweet, extractTweetId } from './fetch-tweet.js';
import { renderTweet, renderFallback } from './render-tweet.js';

// Default pattern: {% twitter URL %}
const DEFAULT_PATTERN = /{% twitter (https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status\/\d+) %}/g;

interface ElementToProcess {
  parent: Element;
  startIndex: number;
  endIndex: number;
  url: string;
  tweetId: string;
}

function isTextNode(node: any): node is Text {
  return node && node.type === 'text';
}

function isElement(node: any): node is Element {
  return node && node.type === 'element';
}

function isInsideCodeBlock(ancestors: (Element | Root)[]): boolean {
  for (const ancestor of ancestors) {
    if ('tagName' in ancestor) {
      const tagName = (ancestor as Element).tagName.toLowerCase();
      if (tagName === 'code' || tagName === 'pre') {
        return true;
      }
    }
  }
  return false;
}

/**
 * Rehype plugin that transforms {% twitter URL %} into static tweet cards
 */
export function rehypeTwitterEmbed(options: TwitterEmbedOptions = {}) {
  const pattern = options.pattern ?? DEFAULT_PATTERN;

  return async function transformer(tree: Root): Promise<Root> {
    const elementsToProcess: ElementToProcess[] = [];

    // Visit all elements (paragraphs, etc.) that might contain twitter patterns
    visitParents(tree, 'element', (node: Element, ancestors: (Element | Root)[]) => {
      // Skip elements inside code blocks
      if (isInsideCodeBlock(ancestors)) return;
      if (node.tagName === 'code' || node.tagName === 'pre') return;

      const children = node.children;
      if (!children || children.length === 0) return;

      // Look for pattern: text("{% twitter ") + a(href) + text(" %}")
      // OR: text containing the full pattern (for raw URLs)
      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        // Case 1: Full pattern in single text node (raw URL not linkified)
        if (isTextNode(child)) {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(child.value)) !== null) {
            const url = match[1];
            const tweetId = extractTweetId(url);
            if (tweetId) {
              elementsToProcess.push({
                parent: node,
                startIndex: i,
                endIndex: i,
                url,
                tweetId,
              });
            }
          }
        }

        // Case 2: Pattern split across nodes by markdown link
        // text("{% twitter ") + a(href="URL") + text(" %}")
        if (
          isTextNode(child) &&
          child.value.includes('{% twitter') &&
          i + 2 < children.length
        ) {
          const next = children[i + 1];
          const afterNext = children[i + 2];

          if (
            isElement(next) &&
            next.tagName === 'a' &&
            next.properties?.href &&
            isTextNode(afterNext) &&
            afterNext.value.includes('%}')
          ) {
            const url = String(next.properties.href);
            const tweetId = extractTweetId(url);

            if (tweetId) {
              elementsToProcess.push({
                parent: node,
                startIndex: i,
                endIndex: i + 2,
                url,
                tweetId,
              });
            }
          }
        }
      }
    });

    // No tweets to process
    if (elementsToProcess.length === 0) {
      return tree;
    }

    // Fetch all tweet data in parallel
    const tweetResults = await Promise.all(
      elementsToProcess.map(async (item) => {
        const result = await fetchTweet(item.tweetId);
        return { ...item, result };
      })
    );

    // Replace nodes with tweet HTML
    // Process in reverse order to maintain correct indices
    for (const { parent, startIndex, endIndex, url, result } of tweetResults.reverse()) {
      const html =
        result.success && result.data
          ? renderTweet(result.data, url, options)
          : renderFallback(url);

      // Parse the HTML into HAST nodes
      const tweetNode = fromHtml(html, { fragment: true });

      // Handle text before and after the pattern
      const beforeChild = parent.children[startIndex];
      const afterChild = parent.children[endIndex];

      const replacements: (Text | Element)[] = [];

      // Text before "{% twitter"
      if (isTextNode(beforeChild)) {
        const beforeMatch = beforeChild.value.indexOf('{% twitter');
        if (beforeMatch > 0) {
          replacements.push({ type: 'text', value: beforeChild.value.slice(0, beforeMatch) });
        }
      }

      // Add the tweet card
      if (tweetNode.children) {
        replacements.push(...(tweetNode.children as (Text | Element)[]));
      }

      // Text after "%}"
      if (isTextNode(afterChild)) {
        const afterMatch = afterChild.value.indexOf('%}');
        if (afterMatch !== -1 && afterMatch + 2 < afterChild.value.length) {
          replacements.push({ type: 'text', value: afterChild.value.slice(afterMatch + 2) });
        }
      } else if (startIndex === endIndex && isTextNode(beforeChild)) {
        // Single text node case - extract text after the pattern
        pattern.lastIndex = 0;
        const match = pattern.exec(beforeChild.value);
        if (match) {
          const afterText = beforeChild.value.slice(match.index + match[0].length);
          if (afterText) {
            replacements.push({ type: 'text', value: afterText });
          }
        }
      }

      // Replace the nodes
      const removeCount = endIndex - startIndex + 1;
      parent.children.splice(startIndex, removeCount, ...replacements);
    }

    return tree;
  };
}
