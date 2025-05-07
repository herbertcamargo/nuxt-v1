<template>
  <div>
    <h1 class="text-center my-4">Transcription Comparison</h1>
    
    <!-- YouTube Search Section -->
    <div class="card">
      <h2>Search for YouTube Videos</h2>
      <div class="form-group">
        <label for="language">Language</label>
        <select id="language" v-model="selectedLanguage" class="form-control">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="pt">Portuguese</option>
        </select>
      </div>
      <div class="form-group">
        <label for="search">Search for videos</label>
        <div class="search-container">
          <input 
            id="search" 
            v-model="searchQuery" 
            @keyup.enter="searchVideos"
            class="form-control" 
            placeholder="Enter search terms..." 
          />
          <button @click="searchVideos" class="btn btn-primary">Search</button>
        </div>
      </div>
    </div>
    
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="text-center my-4">
      <p>Loading...</p>
    </div>
    
    <!-- Video Results -->
    <div v-if="videos.length > 0" class="card">
      <h2>Results</h2>
      <div class="youtube-grid">
        <div 
          v-for="video in videos" 
          :key="video.id" 
          class="video-card"
          @click="selectVideo(video)"
        >
          <img :src="video.thumbnail_url" :alt="video.title" class="video-thumbnail">
          <div class="video-info">
            <h3 class="video-title">{{ video.title }}</h3>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Selected Video Player -->
    <div v-if="selectedVideo" class="card">
      <h2>Selected Video</h2>
      <div class="youtube-player-wrapper">
        <h3>{{ selectedVideo.title }}</h3>
        <div class="youtube-player-container">
          <iframe 
            class="youtube-iframe"
            :src="`https://www.youtube.com/embed/${selectedVideo.id}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    </div>
    
    <!-- Transcription Comparison Section -->
    <div class="card">
      <h2>Transcription Comparison</h2>
      <div class="form-group">
        <label for="user-transcription">Your Transcription</label>
        <textarea 
          id="user-transcription" 
          v-model="userTranscription" 
          class="form-control"
          placeholder="Type your transcription here..."
        ></textarea>
      </div>
      <div class="form-group">
        <label for="official-transcription">Official Transcription</label>
        <textarea 
          id="official-transcription" 
          v-model="officialTranscription" 
          class="form-control"
          placeholder="Paste the official transcription here..."
        ></textarea>
      </div>
      <button @click="compareTranscriptions" class="btn btn-primary">Compare</button>
    </div>
    
    <!-- Comparison Results -->
    <div v-if="comparisonResult" class="comparison">
      <h2>Comparison Results</h2>
      <div v-html="comparisonResult.html" class="comparison-text"></div>
      <div class="accuracy-info">
        {{ accuracyInfo }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// State
const selectedLanguage = ref('en')
const searchQuery = ref('')
const videos = ref([])
const selectedVideo = ref(null)
const userTranscription = ref('')
const officialTranscription = ref('')
const comparisonResult = ref(null)
const isLoading = ref(false)

// Computed properties
const accuracyInfo = computed(() => {
  if (!comparisonResult.value) return ''
  
  const stats = comparisonResult.value.stats
  return `Accuracy: ${stats.accuracy}% — ${stats.correct} correct, ${stats.incorrect} incorrect, ${stats.missing} missing`
})

// Methods
const searchVideos = async () => {
  if (!searchQuery.value) {
    alert('Please enter a search term')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(searchQuery.value)}&language=${selectedLanguage.value}`)
    
    if (!response.ok) {
      throw new Error('Search failed')
    }
    
    const data = await response.json()
    videos.value = data
  } catch (error) {
    console.error('Error searching videos:', error)
    // Fall back to client-side mock data
    videos.value = generateMockVideos(searchQuery.value)
  } finally {
    isLoading.value = false
  }
}

const selectVideo = async (video) => {
  selectedVideo.value = video
  
  // Try to fetch transcript if available
  try {
    const response = await fetch(`/api/youtube/transcript?videoId=${video.id}&language=${selectedLanguage.value}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data && data.transcript) {
        officialTranscription.value = data.transcript
      }
    }
  } catch (error) {
    console.error('Error fetching transcript:', error)
  }
}

const compareTranscriptions = async () => {
  if (!userTranscription.value || !officialTranscription.value) {
    alert('Please fill in both transcription fields')
    return
  }
  
  isLoading.value = true
  
  try {
    const response = await fetch('/api/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userText: userTranscription.value,
        officialText: officialTranscription.value,
        language: selectedLanguage.value
      })
    })
    
    if (!response.ok) {
      throw new Error('Comparison failed')
    }
    
    comparisonResult.value = await response.json()
  } catch (error) {
    console.error('Error comparing transcriptions:', error)
    // Fall back to client-side comparison
    comparisonResult.value = clientSideComparison(userTranscription.value, officialTranscription.value)
  } finally {
    isLoading.value = false
  }
}

// Client-side fallback functions
const generateMockVideos = (query) => {
  // Create simple mock videos for client-side fallback
  const mockVideos = []
  
  for (let i = 1; i <= 5; i++) {
    mockVideos.push({
      id: `mock-${i}`,
      title: `Mock result ${i} for "${query}"`,
      thumbnail_url: `https://via.placeholder.com/320x180/3498db/ffffff?text=Mock+${i}`,
      description: `This is a client-side mock result for "${query}"`,
      isDemo: true
    })
  }
  
  return mockVideos
}

const clientSideComparison = (text1, text2) => {
  // Simple client-side comparison logic
  let html = ''
  const words1 = text1.split(/\s+/)
  const words2 = text2.split(/\s+/)
  
  let correct = 0
  let incorrect = 0
  let missing = 0
  
  // Very simple comparison - just check if words match
  const longerLength = Math.max(words1.length, words2.length)
  
  for (let i = 0; i < longerLength; i++) {
    if (i < words1.length && i < words2.length) {
      if (words1[i].toLowerCase() === words2[i].toLowerCase()) {
        html += `<span class="word-correct">${words1[i]}</span> `
        correct++
      } else {
        html += `<span class="word-wrong">${words1[i]}</span> `
        incorrect++
      }
    } else if (i < words1.length) {
      html += `<span class="word-wrong">${words1[i]}</span> `
      incorrect++
    } else if (i < words2.length) {
      html += `<span class="word-missing">${words2[i]}</span> `
      missing++
    }
  }
  
  const accuracy = correct > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0
  
  return {
    html: `<div><strong>CLIENT-SIDE COMPARISON:</strong><br>${html}</div>`,
    stats: {
      accuracy,
      correct,
      incorrect,
      missing
    }
  }
}

// Page metadata
definePageMeta({
  title: 'Compare Transcriptions'
})
</script>

<style scoped>
.text-center {
  text-align: center;
}

.my-4 {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.search-container {
  display: flex;
  gap: 10px;
}

.comparison-text {
  line-height: 2;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style> 