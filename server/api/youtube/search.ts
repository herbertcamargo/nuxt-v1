import { H3Event } from 'h3'
import crypto from 'crypto'

interface VideoResult {
  id: string
  title: string
  thumbnail_url: string
  description: string
  duration?: string
  views?: number
  formatted_views?: string
  time_ago?: string
  channel?: {
    title: string
  }
  isDemo?: boolean
  offline_mode?: boolean
}

/**
 * Generates fallback videos when the YouTube API fails
 * @param query The search query
 * @returns List of mock videos
 */
function getFallbackVideos(query: string): VideoResult[] {
  // Create predictable but query-specific mock videos
  const videos: VideoResult[] = []
  
  // Clean up the query
  query = query.trim() || 'demo'
  
  // Create a seed based on the query for consistent results
  const queryHash = crypto.createHash('md5').update(query).digest('hex')
  const seed = parseInt(queryHash.substring(0, 8), 16)
  
  // Use the seed for deterministic results
  const random = (max: number) => Math.floor((seed % 10000) / 10000 * max)
  
  // List of demo video titles and templates
  const templates = [
    "Introduction to {topic}",
    "How to learn {topic} fast",
    "{topic} for beginners",
    "Advanced {topic} techniques",
    "The future of {topic}",
    "{topic} explained simply",
    "Why {topic} matters",
    "{topic} tutorial part 1",
    "Top 10 {topic} tips",
    "Learn {topic} in 5 minutes"
  ]
  
  // Categories for video thumbnails with different colors
  const categories = [
    { color: "3498db", text_color: "ffffff", icon: "📚" },  // Education (blue)
    { color: "e74c3c", text_color: "ffffff", icon: "🎬" },  // Entertainment (red)
    { color: "2ecc71", text_color: "ffffff", icon: "💡" },  // Science (green)
    { color: "f39c12", text_color: "ffffff", icon: "🔧" },  // Tech (orange)
    { color: "9b59b6", text_color: "ffffff", icon: "🎮" },  // Gaming (purple)
    { color: "1abc9c", text_color: "ffffff", icon: "🏋️" },  // Fitness (teal)
    { color: "34495e", text_color: "ffffff", icon: "🎵" },  // Music (dark blue)
  ]
  
  // Duration formats for videos
  const durations = ["5:21", "10:15", "3:42", "7:18", "15:30", "2:55", "4:03", "8:27", "12:09", "6:45"]
  
  // List of channels to simulate real content
  const channels = [
    "LearnHub",
    "Master Class",
    "Quick Tutorials",
    "Expert Academy",
    "Simplified Learning",
    "TechCrafter",
    "Knowledge Base",
    "Smart Learning",
    "Ultimate Guides",
    "Learn Daily"
  ]
  
  // Generate 5 fallback videos
  for (let i = 1; i <= 5; i++) {
    // Make the title
    const titleTemplate = templates[random(templates.length)]
    const title = titleTemplate.replace("{topic}", query)
    
    // Create a video ID
    const video_id = `demo-${queryHash.substring(0, 6)}-${i}`
    
    // Pick a category
    const category = categories[random(categories.length)]
    
    // Generate view count (between 100 and 10M)
    const viewsInt = Math.floor(100 * Math.pow(10, random(5)))
    
    // Format views with commas
    const formattedViews = viewsInt.toLocaleString()
    
    // Pick a duration
    const duration = durations[random(durations.length)]
    
    // Pick a channel
    const channelName = channels[random(channels.length)]
    
    // Create a realistic placeholder that simulates a video thumbnail
    const thumbnailUrl = (
      `https://placehold.co/320x180/${category.color}/${category.text_color}?` +
      `text=${category.icon}+${query.replace(/\s+/g, '+')}+${i}`
    )
    
    // Calculate a reasonable upload date (between 1 week and 3 years ago)
    const daysAgo = 7 + random(1095)
    
    // Create a human-readable time ago text
    let timeAgo = `${Math.floor(daysAgo / 30)} months ago`
    if (daysAgo < 30) {
      timeAgo = `${daysAgo} days ago`
    } else if (daysAgo > 365) {
      const years = Math.floor(daysAgo / 365)
      timeAgo = `${years} year${years > 1 ? 's' : ''} ago`
    }
    
    // Create a fallback video object with realistic metadata
    const video: VideoResult = {
      id: video_id,
      title: title,
      thumbnail_url: thumbnailUrl,
      description: `This is a demo video about ${query}. No connection to the YouTube API is required.`,
      duration: duration,
      views: viewsInt,
      formatted_views: formattedViews,
      time_ago: timeAgo,
      channel: {
        title: `${channelName}${random(10) > 7 ? random(999) : ''}`
      },
      isDemo: true,
      offline_mode: true
    }
    
    videos.push(video)
  }
  
  return videos
}

/**
 * Handles the YouTube search request
 */
export default defineEventHandler(async (event: H3Event) => {
  // Get query parameters
  const query = getQuery(event).query as string
  const language = (getQuery(event).language as string) || 'en'
  
  if (!query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query parameter is required'
    })
  }
  
  try {
    // In a real implementation, we would call the YouTube API here
    // For now, use the mock implementation
    const videos = getFallbackVideos(query)
    
    return videos
  } catch (error: any) {
    console.error('Error searching YouTube:', error)
    
    // If all else fails, return mock videos
    return getFallbackVideos(query)
  }
}) 