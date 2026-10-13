// LeetCode Integration Service (Coming Soon)

export function parseLeetCodeUsername(input) {
  if (!input) return '';
  let str = input.trim();

  // Strip query parameters and hash
  str = str.replace(/[?#].*$/, '').replace(/\/+$/, '');

  // Match LeetCode URL formats (e.g. https://leetcode.com/u/neal_wu or https://leetcode.com/neal_wu)
  const urlMatch = str.match(/(?:https?:\/\/)?(?:www\.)?leetcode\.(?:com|cn)\/(?:u\/)?([a-zA-Z0-9_\-]+)/i);
  if (urlMatch && urlMatch[1] && urlMatch[1] !== 'problems' && urlMatch[1] !== 'contest') {
    return urlMatch[1];
  }

  // Match @username
  if (str.startsWith('@')) {
    return str.slice(1).trim();
  }

  // If plain username
  return str.replace(/[^a-zA-Z0-9_\-]/g, '');
}

export async function fetchLeetCodeStats(input) {
  const username = parseLeetCodeUsername(input);
  if (!username) {
    throw new Error('Please enter a valid LeetCode username.');
  }

  // Feature marked as Coming Soon
  throw new Error('LeetCode direct sync is coming soon! Stay tuned for updates.');
}
