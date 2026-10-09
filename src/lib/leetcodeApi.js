// LeetCode Public API Integration Service

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
    throw new Error('Please enter a valid LeetCode profile URL or username.');
  }

  // Live public API endpoints with open CORS
  const endpoints = [
    `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`,
    `https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(username)}`,
  ];

  let rawData = null;
  let lastError = null;

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) continue;

      const data = await res.json();
      if (
        data &&
        (data.errors ||
          data.message === 'user does not exist' ||
          (data.matchedUser === null && data.totalSolved === undefined))
      ) {
        throw new Error(`LeetCode user "@${username}" not found. Please verify your profile URL or username.`);
      }

      if (data && (typeof data.totalSolved === 'number' || data.matchedUserStats)) {
        rawData = data;
        break;
      }
    } catch (err) {
      if (err.message && err.message.includes('not found')) {
        throw err;
      }
      lastError = err;
    }
  }

  if (!rawData) {
    throw new Error(
      lastError?.message?.includes('not found')
        ? lastError.message
        : `Could not fetch LeetCode profile for "@${username}". Please verify your profile URL and ensure your profile is public.`
    );
  }

  // Fetch avatar and user details if available
  let avatar = '';
  let realName = '';
  try {
    const profileRes = await fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}`);
    if (profileRes.ok) {
      const pData = await profileRes.json();
      if (pData?.avatar) avatar = pData.avatar;
      if (pData?.name) realName = pData.name;
    }
  } catch (_) {
    // Non-blocking
  }

  // Extract real submissions
  const recentSubmissions = Array.isArray(rawData.recentSubmissions)
    ? rawData.recentSubmissions
    : (Array.isArray(rawData.recentSubmissionList) ? rawData.recentSubmissionList : []);

  const acceptedList = recentSubmissions.filter((s) => s.statusDisplay === 'Accepted' || !s.statusDisplay);
  const submissionsToUse = acceptedList.length > 0 ? acceptedList : recentSubmissions;

  return {
    username,
    realName: realName || username,
    avatar: avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${username}`,
    totalSolved: rawData.totalSolved || 0,
    easySolved: rawData.easySolved || 0,
    mediumSolved: rawData.mediumSolved || 0,
    hardSolved: rawData.hardSolved || 0,
    ranking: typeof rawData.ranking === 'number' ? rawData.ranking.toLocaleString() : (rawData.ranking || 'Unranked'),
    acceptanceRate: rawData.acceptanceRate || 0,
    contributionPoints: rawData.contributionPoint || rawData.contributionPoints || 0,
    reputation: rawData.reputation || 0,
    submissionCalendar: rawData.submissionCalendar || {},
    recentSubmissions: submissionsToUse.slice(0, 20),
    isFallback: false,
  };
}
