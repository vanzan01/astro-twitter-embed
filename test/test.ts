/**
 * Simple test to verify the package works
 */

import { fetchTweet, extractTweetId, renderTweet, renderFallback } from '../dist/index.js';

async function test() {
  console.log('Testing astro-twitter-embed...\n');

  // Test 0: Jack's first tweet (the iconic example)
  console.log("0. Testing Jack's first tweet (status/20)...");
  const jackResult = await fetchTweet('20');
  if (jackResult.success && jackResult.data) {
    console.log(`   @${jackResult.data.user.screen_name}: "${jackResult.data.text}"`);
    console.log('   ✓ PASS\n');
  } else {
    console.log(`   Error: ${jackResult.error}`);
    console.log('   ✗ FAIL\n');
  }

  // Test 1: Extract tweet ID
  const testUrl = 'https://x.com/Dorizzdt/status/1914845490413494666';
  const tweetId = extractTweetId(testUrl);
  console.log(`1. Extract tweet ID from ${testUrl}`);
  console.log(`   Result: ${tweetId}`);
  console.log(`   ${tweetId === '1914845490413494666' ? '✓ PASS' : '✗ FAIL'}\n`);

  // Test 2: Fetch tweet data
  console.log('2. Fetching tweet data...');
  const result = await fetchTweet(tweetId!);
  console.log(`   Success: ${result.success}`);
  if (result.success && result.data) {
    console.log(`   Author: @${result.data.user.screen_name}`);
    console.log(`   Text: ${result.data.text.slice(0, 50)}...`);
    console.log('   ✓ PASS\n');

    // Test 3: Render tweet
    console.log('3. Rendering tweet HTML...');
    const html = renderTweet(result.data, testUrl);
    console.log(`   HTML length: ${html.length} characters`);
    console.log(`   Contains card: ${html.includes('astro-tweet-card')}`);
    console.log(`   ${html.includes('astro-tweet-card') ? '✓ PASS' : '✗ FAIL'}\n`);
  } else {
    console.log(`   Error: ${result.error}`);
    console.log('   ✗ FAIL\n');
  }

  // Test 4: Fallback render
  console.log('4. Testing fallback render...');
  const fallback = renderFallback(testUrl);
  console.log(`   Contains link: ${fallback.includes(testUrl)}`);
  console.log(`   ${fallback.includes(testUrl) ? '✓ PASS' : '✗ FAIL'}\n`);

  console.log('Tests complete!');
}

test().catch(console.error);
