export default defineEventHandler(async (event) => {
  // Get query parameters
  const videoId = getQuery(event).videoId as string
  const language = (getQuery(event).language as string) || 'en'
  
  if (!videoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'VideoId parameter is required'
    })
  }
  
  try {
    // In a real implementation, we would call the YouTube Transcript API
    // For now, return a mock transcript
    
    // If it's a demo video, generate a predictable mock transcript
    if (videoId.startsWith('demo-')) {
      const query = videoId.split('-')[1] || 'transcription'
      
      return {
        videoId,
        language,
        transcript: generateMockTranscript(query),
        isDemo: true
      }
    }
    
    // Try to get a real transcript (in a production app)
    // For now, return a default message
    return {
      videoId,
      language,
      transcript: "This is a placeholder transcript. In a real application, we would fetch the actual transcript from YouTube.",
      isDemo: true
    }
  } catch (error: any) {
    console.error('Error fetching transcript:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transcript',
      cause: error
    })
  }
})

/**
 * Generates a mock transcript based on the query
 */
function generateMockTranscript(query: string): string {
  // Create a deterministic but varied transcript
  const sentences = [
    `Welcome to this video about ${query}.`,
    `Today we're going to explore ${query} in detail.`,
    `${query} is a fascinating topic that many people find interesting.`,
    `Let's start by understanding what ${query} actually means.`,
    `${query} has become increasingly important in recent years.`,
    `There are several key aspects of ${query} we need to consider.`,
    `First, let's talk about the history of ${query}.`,
    `Many experts believe that ${query} will continue to evolve.`,
    `When studying ${query}, it's important to look at real examples.`,
    `Let's examine how ${query} works in practice.`,
    `The future of ${query} looks very promising.`,
    `Thank you for watching this introduction to ${query}.`,
    `If you enjoyed learning about ${query}, please subscribe for more videos.`,
    `That's all for this overview of ${query}.`
  ]
  
  // Shuffle array deterministically based on query
  const seed = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const shuffled = [...sentences].sort((a, b) => {
    const valA = (a.length * seed) % 100
    const valB = (b.length * seed) % 100
    return valA - valB
  })
  
  // Take a subset of sentences and join them
  const count = 5 + (seed % 5) // 5-9 sentences
  return shuffled.slice(0, count).join(' ')
} 