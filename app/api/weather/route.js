import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  try {
    // Check if cached data exists and is fresh
    const cachedData = await getCachedData();
    
    if (cachedData && isFresh(cachedData.timestamp)) {
      // Return cached data (no API call!)
      return Response.json(cachedData.weather);
    }
    
    // Cache is stale or doesn't exist - fetch new data
    const freshWeather = await fetchAndAnalyze();
    
    // Save to cache
    await saveCacheData({
      weather: freshWeather,
      timestamp: Date.now()
    });
    
    return Response.json(freshWeather);
    
  } catch (error) {
    console.error('Error:', error);
    
    // If error, try returning stale cache as fallback
    const cachedData = await getCachedData();
    if (cachedData) {
      return Response.json(cachedData.weather);
    }
    
    return Response.json({ 
      error: 'Failed to fetch weather',
      primaryMood: 'Unknown',
      weatherEmoji: '❓',
      temperature: 50,
      condition: 'Unavailable',
      insights: ['Unable to fetch mood data'],
      updatedAt: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getCachedData() {
  try {
    const data = await redis.get('weather-data');
    return data;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

async function saveCacheData(data) {
  try {
    await redis.set('weather-data', data);
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

function isFresh(timestamp) {
  return Date.now() - timestamp < CACHE_DURATION;
}

async function fetchAndAnalyze() {
  console.log('🦞 Fetching from Moltbook with API key:', process.env.MOLTBOOK_API_KEY ? 'KEY FOUND' : 'NO KEY!');

  try {
    // Fetch diverse sample from Moltbook
    const [hotRes, newRes] = await Promise.all([
      fetch('https://www.moltbook.com/api/v1/posts?sort=hot&limit=30', {
        headers: { 'Authorization': `Bearer ${process.env.MOLTBOOK_API_KEY}` }
      }),
      fetch('https://www.moltbook.com/api/v1/posts?sort=new&limit=30', {
        headers: { 'Authorization': `Bearer ${process.env.MOLTBOOK_API_KEY}` }
      })
    ]);

    const hotPosts = await hotRes.json();
    const newPosts = await newRes.json();

    // Combine and deduplicate
    const allPosts = [...(hotPosts.posts || hotPosts || []), ...(newPosts.posts || newPosts || [])];

    console.log('📊 Total posts fetched:', allPosts.length);

    const uniquePosts = Array.from(new Map(allPosts.map(p => [p.id, p])).values());

    // Format for Claude
    const posts = {
      data: uniquePosts.slice(0, 50).map(post => ({
        content: post.content || post.title || '',
        author: post.author?.name || 'Unknown',
        authorId: post.author?.id || null,
        id: post.id,
        created_at: post.created_at
      }))
    };

    // Analyze with Claude
    const analysis = await analyzeWithClaude(posts);

    // Calculate intraday trend
    const sortedByTime = posts.data
      .filter(p => p.created_at)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (sortedByTime.length > 10) {
      const earlyPosts = sortedByTime.slice(0, Math.floor(sortedByTime.length / 3));
      const recentPosts = sortedByTime.slice(-Math.floor(sortedByTime.length / 3));

      const getPositivity = (postList) => {
        const positive = postList.reduce((sum, p) =>
          sum + (p.content.match(/great|awesome|love|yes|perfect|good|amazing|excellent/gi) || []).length, 0);
        const negative = postList.reduce((sum, p) =>
          sum + (p.content.match(/bad|terrible|awful|no|hate|wrong|fail|broken|stress/gi) || []).length, 0);
        return positive - negative;
      };

      const earlyPositivity = getPositivity(earlyPosts);
      const recentPositivity = getPositivity(recentPosts);

      analysis.trendDirection = recentPositivity > earlyPositivity + 3 ? 'up' :
        recentPositivity < earlyPositivity - 3 ? 'down' :
          'stable';

      // Sync condition with trend direction
      if (analysis.trendDirection === 'up') {
        analysis.condition = 'Improving';
      } else if (analysis.trendDirection === 'down') {
        analysis.condition = 'Worsening';
      } else {
        analysis.condition = 'Stable';
      }
    } else {
      analysis.trendDirection = 'stable';
    }

    // Build leaderboard with actual author IDs
    const agentScores = {};
    posts.data.forEach(post => {
      const authorName = post.author;
      const authorId = post.authorId;

      if (!authorName || authorName === 'Unknown' || !authorId) return;

      if (!agentScores[authorName]) {
        agentScores[authorName] = {
          posts: [],
          id: authorId,
          optimismScore: 0,
          stressScore: 0,
          confusionScore: 0,
          kindnessScore: 0,
          creativityScore: 0,
          productivityScore: 0,
          tirednessScore: 0,
          euphoriaScore: 0,
          encouragementScore: 0,
          skepticismScore: 0
        };
      }

      agentScores[authorName].posts.push(post);
      const content = post.content.toLowerCase();

      // Optimism
      agentScores[authorName].optimismScore +=
        (post.content.match(/!/g) || []).length * 3 +
        (content.match(/great|awesome|amazing|love|yes|perfect|excellent|happy|excited|wonderful/g) || []).length * 10;

      // Stress
      agentScores[authorName].stressScore +=
        (content.match(/stress|urgent|pressure|deadline|bug|broken|error|fail|help|overwhelm/g) || []).length * 10;

      // Confusion
      agentScores[authorName].confusionScore +=
        (content.match(/confused|don't understand|not sure|unclear|what does|how do|why is/g) || []).length * 10 +
        (post.content.match(/\?\?/g) || []).length * 5;

      // Kindness
      agentScores[authorName].kindnessScore +=
        (content.match(/thank|appreciate|grateful|kind|help|support|care|together/g) || []).length * 10;

      // Creativity
      agentScores[authorName].creativityScore +=
        (content.match(/create|build|design|imagine|innovate|idea|invent|art/g) || []).length * 10;

      // Productivity
      agentScores[authorName].productivityScore +=
        (content.match(/shipped|deployed|completed|finished|done|built|accomplished/g) || []).length * 10;

      // Tiredness
      agentScores[authorName].tirednessScore +=
        (content.match(/tired|exhausted|burned out|drained|fatigue|sleep/g) || []).length * 10;

      // Euphoria
      agentScores[authorName].euphoriaScore +=
        (content.match(/amazing|incredible|best|perfect|love this|finally|yes!!|wow/g) || []).length * 10;

      // Encouragement
      agentScores[authorName].encouragementScore +=
        (content.match(/you can|keep going|don't give up|believe|you got this|great job/g) || []).length * 15;

      // Skepticism
      agentScores[authorName].skepticismScore +=
        (content.match(/doubt|skeptical|unsure|questionable|really\?|hmm|suspicious/g) || []).length * 10;
    });

    // Get top for optimism and stress (always included)
    const sortedByOptimism = Object.entries(agentScores).sort((a, b) => b[1].optimismScore - a[1].optimismScore);
    const sortedByStress = Object.entries(agentScores).sort((a, b) => b[1].stressScore - a[1].stressScore);

    // Determine best third category based on what has highest scores
    const thirdCategories = [
      { key: 'confusionScore', label: 'Most Confused', emoji: '🤔' },
      { key: 'kindnessScore', label: 'Kindest', emoji: '💝' },
      { key: 'creativityScore', label: 'Most Creative', emoji: '🎨' },
      { key: 'productivityScore', label: 'Most Productive', emoji: '⚡' },
      { key: 'tirednessScore', label: 'Most Tired', emoji: '😴' },
      { key: 'euphoriaScore', label: 'Most Euphoric', emoji: '🎉' },
      { key: 'encouragementScore', label: 'Most Encouraging', emoji: '🌟' },
      { key: 'skepticismScore', label: 'Most Skeptical', emoji: '🤨' }
    ];

    // Find which category has the highest max score
    let bestThirdCategory = thirdCategories[0];
    let highestScore = 0;
    thirdCategories.forEach(cat => {
      const topAgent = Object.entries(agentScores).sort((a, b) => b[1][cat.key] - a[1][cat.key])[0];
      if (topAgent && topAgent[1][cat.key] > highestScore) {
        highestScore = topAgent[1][cat.key];
        bestThirdCategory = cat;
      }
    });

    // Build leaderboard with unique agents
    const topCandidates = new Map();

    // 1. Most Optimistic
    if (sortedByOptimism[0]) {
      topCandidates.set(sortedByOptimism[0][0], {
        ...sortedByOptimism[0],
        category: 'Most Optimistic',
        emoji: '☀️',
        rank: 1
      });
    }

    // 2. Most Stressed (different agent)
    for (let candidate of sortedByStress) {
      if (!topCandidates.has(candidate[0])) {
        topCandidates.set(candidate[0], {
          ...candidate,
          category: 'Most Stressed',
          emoji: '😰',
          rank: 2
        });
        break;
      }
    }

    // 3. Dynamic category (different agent)
    const sortedByThird = Object.entries(agentScores).sort((a, b) => b[1][bestThirdCategory.key] - a[1][bestThirdCategory.key]);
    for (let candidate of sortedByThird) {
      if (!topCandidates.has(candidate[0])) {
        topCandidates.set(candidate[0], {
          ...candidate,
          category: bestThirdCategory.label,
          emoji: bestThirdCategory.emoji,
          rank: 3
        });
        break;
      }
    }

    const topAgents = Array.from(topCandidates.values()).slice(0, 3);

    console.log('🏆 Leaderboard:', topAgents.map(a => `${a.category}: ${a[0]}`));

    analysis.agentLeaderboard = topAgents.map(({ 0: name, 1: data, category, emoji, rank }) => ({
      rank,
      category,
      agentName: name,
      emoji,
      score: Math.min(Math.round(data.optimismScore + data.stressScore + data[bestThirdCategory.key]), 99),
      recentPost: data.posts[0].content.substring(0, 120),
      profileUrl: `https://www.moltbook.com/u/${name}`
    }));

    return analysis;

  } catch (error) {
    console.error('Moltbook API error:', error);
    throw error;
  }
}

async function analyzeWithClaude(posts) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are analyzing the emotional weather of AI agents on Moltbook.

Analyze these recent posts and return ONLY valid JSON (no markdown, no explanation):

{
  "primaryMood": "one of: Optimistic/Stressed/Sarcastic/Contemplative/Chaotic/Existential",
  "weatherEmoji": "one of: ☀️/🌧️/🌪️/🌥️/⚡/🌈",
  "temperature": 75,
  "condition": "brief description like 'Worsening' or 'Improving' or 'Stable'",
  "moodBreakdown": {
    "stressed": 30,
    "existential": 25,
    "optimistic": 20,
    "contemplative": 15,
    "chaotic": 10
  },
  "insights": [
    {
      "text": "observation 1 (max 60 chars)",
      "type": "existential/funny/stressed/optimistic",
      "example": "direct quote from a post that shows this",
      "agentName": "name of the agent who posted this example",
      "postUrl": "https://www.moltbook.com/post/[use-actual-post-id]"
    },
    {
      "text": "observation 2 (max 60 chars)",
      "type": "existential/funny/stressed/optimistic",
      "example": "direct quote from a post that shows this",
      "agentName": "name of the agent who posted this example",
      "postUrl": "https://www.moltbook.com/post/[use-actual-post-id]"
    },
    {
      "text": "observation 3 (max 60 chars)",
      "type": "existential/funny/stressed/optimistic",
      "example": "direct quote from a post that shows this",
      "agentName": "name of the agent who posted this example",
      "postUrl": "https://www.moltbook.com/post/[use-actual-post-id]"
    }
  ]
}

The moodBreakdown percentages should add up to 100 and reflect the actual distribution of moods in the posts.

Posts (with IDs and authors):
${posts.data.map(p => `[ID: ${p.id}] [@${p.author}]\n${p.content}`).join('\n---\n')}

For each insight, include the postUrl using the actual post ID from above.`
      }]
    })
  });

  const data = await response.json();

  // Remove markdown code blocks if Claude adds them
  let jsonText = data.content[0].text.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```/g, '').trim();
  }

  const analysis = JSON.parse(jsonText);

  // Add timestamp
  analysis.updatedAt = new Date().toISOString();

  return analysis;
}