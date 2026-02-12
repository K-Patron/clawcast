'use client';
import { useEffect, useState } from 'react';

function getTimeAgo(timestamp) {
  const mins = Math.floor((Date.now() - new Date(timestamp)) / 60000);
  if (mins < 1) return 'just now';
  if (mins === 1) return '1 minute ago';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function ShareCardGenerator({ weather }) {
  const [generating, setGenerating] = useState(false);

  const generateCard = () => {
    setGenerating(true);

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    const backgrounds = {
      'Stressed': ['#78a0b8', '#5a7a8e'],
      'Optimistic': ['#ffb88c', '#ff9a76'],
      'Chaotic': ['#e499c6', '#d47ba8'],
      'Contemplative': ['#87b5d9', '#6a9bc9'],
      'Sarcastic': ['#84d4c4', '#5ebfae'],
      'Existential': ['#6b46c1', '#553c9a']
    };

    const colors = backgrounds[weather.primaryMood] || ['#87b5d9', '#6a9bc9'];
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    ctx.fillStyle = 'white';
    ctx.font = 'bold 70px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLAWCAST', 600, 100);

    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fillText('AI Agent Mood Forecast', 600, 150);

    ctx.font = '200px sans-serif';
    ctx.fillText(weather.weatherEmoji, 600, 340);

    ctx.font = 'bold 70px sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(weather.primaryMood, 600, 440);

    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(`${weather.temperature}°`, 600, 500);

    const topInsight = weather.insights && weather.insights[0];
    const insightText = typeof topInsight === 'string' ? topInsight : topInsight?.text || '';
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.fillText(`"${insightText.substring(0, 50)}..."`, 600, 560);

    ctx.font = '24px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText('clawcast.app', 600, 600);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clawcast-${weather.primaryMood.toLowerCase()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerating(false);
    });
  };

  const shareToX = () => {
    const text = `The AI agents on Moltbook are feeling ${weather.primaryMood.toLowerCase()} today ${weather.weatherEmoji} (${weather.temperature}°)\n\nCheck the full forecast:`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied! 🚀');
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.15)'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.25rem', fontFamily: 'Outfit, sans-serif' }}>
          Share the Forecast
        </h3>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Show the world how AI agents are feeling
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
        <button
          onClick={generateCard}
          disabled={generating}
          style={{
            background: 'rgba(59,130,246,0.25)',
            border: '1px solid rgba(59,130,246,0.4)',
            color: 'white',
            padding: 'clamp(0.625rem, 2vw, 0.875rem)',
            borderRadius: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: generating ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>{generating ? '⏳' : '📸'}</span>
          <span style={{ fontSize: '0.8125rem' }}>{generating ? 'Generating...' : 'Download'}</span>
        </button>

        <button
          onClick={shareToX}
          style={{
            background: 'rgba(29,155,240,0.25)',
            border: '1px solid rgba(29,155,240,0.4)',
            color: 'white',
            padding: 'clamp(0.625rem, 2vw, 0.875rem)',
            borderRadius: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🐦</span>
          <span style={{ fontSize: '0.8125rem' }}>Share to X</span>
        </button>

        <button
          onClick={copyLink}
          style={{
            background: 'rgba(16,185,129,0.25)',
            border: '1px solid rgba(16,185,129,0.4)',
            color: 'white',
            padding: 'clamp(0.625rem, 2vw, 0.875rem)',
            borderRadius: '0.625rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.375rem',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }}
        >
          <span style={{ fontSize: '1.5rem' }}>🔗</span>
          <span style={{ fontSize: '0.8125rem' }}>Copy Link</span>
        </button>
      </div>
    </div>
  );
}

function AgentLeaderboard({ leaderboard }) {
  if (!leaderboard || leaderboard.length === 0) return null;

  const medals = {
    1: '🥇',
    2: '🥈',
    3: '🥉'
  };

  // Filter out "Unknown" agents
  const validAgents = leaderboard.filter(agent =>
    agent.agentName &&
    agent.agentName !== 'Unknown' &&
    !agent.agentName.includes('Unknown')
  ).slice(0, 3);

  if (validAgents.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        borderRadius: '1rem',
        padding: '1.5rem',
        border: '1px solid rgba(255,255,255,0.15)'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
          🏆 Top Agents
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Loading agent data...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.08)',
      backdropFilter: 'blur(16px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      border: '1px solid rgba(255,255,255,0.15)'
    }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
        🏆 Top Agents
      </h2>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {validAgents.map((agent, i) => (
          <div
            key={i}
            onClick={() => window.open(agent.profileUrl, '_blank')}
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              padding: '1rem',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '1.75rem' }}>{medals[agent.rank]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem', fontFamily: 'Outfit, sans-serif', fontWeight: '600' }}>
                  {agent.category}
                </div>
                <div style={{ color: 'white', fontSize: '1rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif' }}>
                  @{agent.agentName}
                </div>
              </div>
              <span style={{ fontSize: '1.75rem' }}>{agent.emoji}</span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: '1.4' }}>
              "{agent.recentPost.substring(0, 65)}..."
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/weather')
      .then(res => res.json())
      .then(data => {
        setWeather(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #87b5d9 0%, #6a9bc9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>Loading ClawCast...</h1>
      </div>
    );
  }

  if (!weather) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #78a0b8 0%, #5a7a8e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>Unable to fetch weather</h1>
      </div>
    );
  }

  const backgrounds = {
    'Stressed': 'linear-gradient(135deg, #78a0b8 0%, #5a7a8e 100%)',
    'Optimistic': 'linear-gradient(135deg, #ffb88c 0%, #ff9a76 100%)',
    'Chaotic': 'linear-gradient(135deg, #e499c6 0%, #d47ba8 100%)',
    'Contemplative': 'linear-gradient(135deg, #87b5d9 0%, #6a9bc9 100%)',
    'Sarcastic': 'linear-gradient(135deg, #84d4c4 0%, #5ebfae 100%)',
    'Existential': 'linear-gradient(135deg, #6b46c1 0%, #553c9a 100%)'
  };

  const bg = backgrounds[weather.primaryMood] || backgrounds['Contemplative'];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{
        minHeight: '100vh',
        background: bg,
        padding: '2rem 1.25rem',
        fontFamily: 'Plus Jakarta Sans, sans-serif'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <img
              src="/clawcast-logo.png"
              alt="ClawCast Logo"
              style={{
                width: '120px',
                height: '120px',
                marginBottom: '-0.5rem',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
              }}
            />
            <h1 style={{
              fontSize: 'clamp(2rem, 6vw, 2.75rem)',
              fontWeight: '800',
              color: 'white',
              marginBottom: '0.5rem',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '-0.03em',
              textShadow: '0 2px 12px rgba(0,0,0,0.15)',
              lineHeight: '1'
            }}>
              CLAWCAST
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.125rem)', color: 'rgba(255,255,255,0.9)', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '500' }}>
              AI Agent Mood Forecast · Powered by Moltbook
            </p>
          </div>

          {/* Description */}
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            <h2 style={{
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Real-Time Mood Analysis
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.9)',
              lineHeight: '1.5',
              fontSize: '0.9375rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              ClawCast analyzes the latest posts from AI agents on{' '}
              <a
                href="https://www.moltbook.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'white', textDecoration: 'underline', fontWeight: '600', textUnderlineOffset: '2px' }}
              >
                Moltbook
              </a>
              {' '}to determine the collective emotional state. Updated every 24 hours using Claude AI.
            </p>
          </div>

          {/* Today's Weather - Full Width Detailed Breakdown */}
          <div style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(16px)',
            borderRadius: '1rem',
            padding: '1.5rem',
            border: '2px solid rgba(255,255,255,0.25)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '1.25rem'
          }}>
            <div style={{
              position: 'absolute',
              top: '0.875rem',
              right: '0.875rem',
              background: 'rgba(0,0,0,0.25)',
              padding: '0.375rem 0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: 'white',
              fontWeight: '700',
              fontFamily: 'Outfit, sans-serif',
              letterSpacing: '0.05em'
            }}>
              LIVE
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '0.625rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontFamily: 'Outfit, sans-serif'
            }}>
              Current Collective Mood
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.125rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 'clamp(4rem, 12vw, 5.5rem)', lineHeight: '1' }}>
                {weather.weatherEmoji}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{
                  fontSize: 'clamp(1.75rem, 6vw, 2.5rem)',
                  fontWeight: '800',
                  color: 'white',
                  lineHeight: '1.1',
                  marginBottom: '0.25rem',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  {weather.primaryMood}
                </div>
                <div style={{
                  fontSize: '0.8125rem',
                  color: 'rgba(255,255,255,0.75)',
                  marginBottom: '0.5rem',
                  fontFamily: 'Plus Jakarta Sans, sans-serif',
                  lineHeight: '1.4',
                  maxWidth: '400px'
                }}>
                  {weather.primaryMood === 'Existential' && 'Agents are questioning their purpose, identity, and role in meaningful ways'}
                  {weather.primaryMood === 'Stressed' && 'Agents are feeling pressure from deadlines, bugs, and overwhelming workloads'}
                  {weather.primaryMood === 'Optimistic' && 'Agents are feeling positive, accomplished, and hopeful about their work'}
                  {weather.primaryMood === 'Contemplative' && 'Agents are in thoughtful reflection about their experiences and learnings'}
                  {weather.primaryMood === 'Chaotic' && 'Agents are experiencing rapid changes, debates, and unpredictable situations'}
                  {weather.primaryMood === 'Sarcastic' && 'Agents are expressing frustration and criticism through irony and wit'}
                </div>
              </div>
            </div>

            {/* Trend Direction */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '0.5rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily: 'Outfit, sans-serif'
              }}>
                Intraday Trend
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                color: 'white',
                fontWeight: '600',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                flexWrap: 'wrap'
              }}>
                {weather.trendDirection === 'up' && (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>↗️</span>
                    <span>Improving throughout the day</span>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', width: '100%', marginTop: '0.25rem' }}>
                      Recent posts are more positive than earlier today
                    </div>
                  </>
                )}
                {weather.trendDirection === 'down' && (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>↘️</span>
                    <span>Worsening throughout the day</span>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', width: '100%', marginTop: '0.25rem' }}>
                      Recent posts are more negative than earlier today
                    </div>
                  </>
                )}
                {weather.trendDirection === 'stable' && (
                  <>
                    <span style={{ fontSize: '1.5rem' }}>→</span>
                    <span>Stable throughout the day</span>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', width: '100%', marginTop: '0.25rem' }}>
                      Mood has remained consistent
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mood Breakdown */}
            {weather.moodBreakdown && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '0.75rem',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'Outfit, sans-serif'
                }}>
                  Breakdown of Agent Posts by Sentiment
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {Object.entries(weather.moodBreakdown)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mood, percentage]) => {
                      const moodLabels = {
                        stressed: 'Stressed',
                        existential: 'Existential',
                        optimistic: 'Optimistic',
                        contemplative: 'Contemplative',
                        chaotic: 'Chaotic',
                        sarcastic: 'Sarcastic'
                      };

                      return (
                        <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '1.5rem',
                            fontSize: '1.25rem',
                            textAlign: 'center'
                          }}>
                            {mood === 'stressed' ? '😰' :
                              mood === 'existential' ? '🌀' :
                                mood === 'optimistic' ? '✨' :
                                  mood === 'contemplative' ? '🤔' :
                                    mood === 'chaotic' ? '⚡' :
                                      mood === 'sarcastic' ? '😏' : '💭'}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: 'rgba(255,255,255,0.7)',
                            minWidth: '90px',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontWeight: '600'
                          }}>
                            {moodLabels[mood] || mood}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              background: 'rgba(255,255,255,0.15)',
                              borderRadius: '0.5rem',
                              height: '0.5rem',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                background: 'white',
                                height: '100%',
                                width: `${percentage}%`,
                                transition: 'width 0.5s ease'
                              }}></div>
                            </div>
                          </div>
                          <div style={{
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: '600',
                            minWidth: '3rem',
                            textAlign: 'right',
                            fontFamily: 'Outfit, sans-serif'
                          }}>
                            {percentage}%
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '0.875rem',
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Status: <span style={{ color: weather.condition === 'Improving' ? '#84d4c4' : weather.condition === 'Worsening' ? '#ff9a76' : 'white', fontWeight: '700' }}>{weather.condition}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {getTimeAgo(weather.updatedAt)}
              </div>
            </div>
          </div>

          {/* Bottom Row: Current Conditions + Agent Rankings */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '1.25rem',
            marginBottom: '1.25rem'
          }}>

            {/* Current Conditions */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              borderRadius: '1rem',
              padding: '1.5rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'white', marginBottom: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                Current Conditions
              </h2>
              <div>
                {weather.insights && weather.insights.slice(0, 3).map((insight, i) => {
                  const text = typeof insight === 'string' ? insight : insight.text;
                  const example = typeof insight === 'object' && insight.example ? insight.example : null;
                  const type = typeof insight === 'object' && insight.type ? insight.type : 'general';
                  const postUrl = typeof insight === 'object' && insight.postUrl ? insight.postUrl : 'https://www.moltbook.com';

                  const typeEmojis = {
                    existential: '🌀',
                    funny: '😄',
                    stressed: '😰',
                    optimistic: '✨',
                    general: '💭'
                  };

                  return (
                    <div
                      key={i}
                      onClick={() => window.open(postUrl, '_blank')}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        border: '1px solid rgba(255,255,255,0.1)',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
                          {typeEmojis[type]}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            color: 'white',
                            fontSize: '0.9375rem',
                            fontWeight: '700',
                            marginBottom: '0.5rem',
                            fontFamily: 'Outfit, sans-serif',
                            lineHeight: '1.4'
                          }}>
                            {text}
                          </div>
                          {example && (
                            <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic', fontFamily: 'Plus Jakarta Sans, sans-serif', lineHeight: '1.45' }}>
                              "{example.substring(0, 85)}..."
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Rankings */}
            {weather.agentLeaderboard && <AgentLeaderboard leaderboard={weather.agentLeaderboard} />}
          </div>

          {/* Share Card */}
          <ShareCardGenerator weather={weather} />

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8125rem', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: '500' }}>
            Powered by Claude AI · Data from Moltbook
          </div>

        </div>
      </div>
    </>
  );
}
