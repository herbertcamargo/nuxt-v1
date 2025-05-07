interface ComparisonWord {
  text: string
  type: 'correct' | 'mistake' | 'missing' | 'wrong'
}

interface ComparisonResult {
  html: string
  stats: {
    accuracy: number
    correct: number
    incorrect: number
    missing: number
  }
}

interface ComparisonRequest {
  userText: string
  officialText: string
  language: string
}

/**
 * Normalizes text for comparison
 */
function normalizeText(text: string): string {
  // Remove brackets and content inside them
  let normalized = text.replace(/\[.*?\]/g, '')
  
  // Remove punctuation
  normalized = normalized.replace(/[^\w\s]/g, '')
  
  // Normalize whitespace and convert to lowercase
  normalized = normalized.replace(/\s+/g, ' ').trim().toLowerCase()
  
  return normalized
}

/**
 * Checks if two words are equivalent
 */
function areEquivalent(word1: string, word2: string): boolean {
  if (!word1 || !word2) return false
  
  // Check exact match after normalization
  if (word1 === word2) return true
  
  // Simple equivalence checks (could be expanded with more rules)
  const equivalents: Record<string, string[]> = {
    'dont': ['don\'t', 'do not'],
    'cant': ['can\'t', 'cannot'],
    'wont': ['won\'t', 'will not'],
    'im': ['i\'m', 'i am'],
    'youre': ['you\'re', 'you are'],
    'theyre': ['they\'re', 'they are'],
    'isnt': ['isn\'t', 'is not'],
    'arent': ['aren\'t', 'are not'],
    'wasnt': ['wasn\'t', 'was not'],
    'werent': ['weren\'t', 'were not'],
    'havent': ['haven\'t', 'have not'],
    'hasnt': ['hasn\'t', 'has not'],
    'hadnt': ['hadn\'t', 'had not'],
    'couldnt': ['couldn\'t', 'could not'],
    'wouldnt': ['wouldn\'t', 'would not'],
    'shouldnt': ['shouldn\'t', 'should not']
  }
  
  const normalizedWord1 = normalizeText(word1)
  const normalizedWord2 = normalizeText(word2)
  
  // Check normalized equivalence
  if (normalizedWord1 === normalizedWord2) return true
  
  // Check in equivalents dictionary
  if (equivalents[normalizedWord1] && equivalents[normalizedWord1].includes(normalizedWord2)) return true
  if (equivalents[normalizedWord2] && equivalents[normalizedWord2].includes(normalizedWord1)) return true
  
  return false
}

/**
 * Calculates the similarity between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  if (str1 === str2) return 1
  
  // Calculate Levenshtein distance
  const len1 = str1.length
  const len2 = str2.length
  
  // Create 2D array for dynamic programming
  const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0))
  
  // Initialize first row and column
  for (let i = 0; i <= len1; i++) dp[i][0] = i
  for (let j = 0; j <= len2; j++) dp[0][j] = j
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      )
    }
  }
  
  const distance = dp[len1][len2]
  const maxLen = Math.max(len1, len2)
  
  // Return similarity score (1 - normalized distance)
  return maxLen > 0 ? 1 - distance / maxLen : 1
}

/**
 * Checks if a word is likely a mistake or typo of another word
 */
function isMistake(word1: string, word2: string, threshold: number = 0.75): boolean {
  return calculateSimilarity(normalizeText(word1), normalizeText(word2)) >= threshold
}

/**
 * Compares user transcription with official one
 */
function compareTranscriptions(userInput: string, officialTranscript: string): ComparisonResult {
  // Extract words from input
  const userWords = userInput.match(/\b\w+[\w']*\b/g) || []
  const actualWords = officialTranscript.match(/\b\w+[\w']*\b/g) || []
  
  // Normalize words
  const normalizedUserWords = userWords.map(word => ({
    text: word,
    normalized: normalizeText(word)
  }))
  
  const normalizedActualWords = actualWords.map(word => ({
    text: word,
    normalized: normalizeText(word)
  }))
  
  // Simple word-by-word comparison
  const results: ComparisonWord[] = []
  let userIdx = 0
  let actualIdx = 0
  
  // Comparison stats
  let correct = 0
  let mistake = 0
  let missing = 0
  let wrong = 0
  
  while (userIdx < normalizedUserWords.length && actualIdx < normalizedActualWords.length) {
    const userWord = normalizedUserWords[userIdx]
    const actualWord = normalizedActualWords[actualIdx]
    
    if (areEquivalent(userWord.normalized, actualWord.normalized)) {
      results.push({ text: userWord.text, type: 'correct' })
      correct++
      userIdx++
      actualIdx++
    } else if (isMistake(userWord.normalized, actualWord.normalized)) {
      results.push({ text: userWord.text, type: 'mistake' })
      mistake++
      userIdx++
      actualIdx++
    } else {
      // Check if we can find a match further ahead in either sequence
      let foundMatch = false
      
      // Look ahead in the actual text (for omissions in user input)
      for (let i = 1; i <= 3 && actualIdx + i < normalizedActualWords.length; i++) {
        if (areEquivalent(userWord.normalized, normalizedActualWords[actualIdx + i].normalized)) {
          // User omitted some words
          for (let j = 0; j < i; j++) {
            results.push({ text: normalizedActualWords[actualIdx + j].text, type: 'missing' })
            missing++
          }
          results.push({ text: userWord.text, type: 'correct' })
          correct++
          userIdx++
          actualIdx += i + 1
          foundMatch = true
          break
        }
      }
      
      // If no match found looking ahead in actual, look ahead in user input
      if (!foundMatch) {
        for (let i = 1; i <= 3 && userIdx + i < normalizedUserWords.length; i++) {
          if (areEquivalent(normalizedUserWords[userIdx + i].normalized, actualWord.normalized)) {
            // User added extra words
            for (let j = 0; j < i; j++) {
              results.push({ text: normalizedUserWords[userIdx + j].text, type: 'wrong' })
              wrong++
            }
            results.push({ text: normalizedUserWords[userIdx + i].text, type: 'correct' })
            correct++
            userIdx += i + 1
            actualIdx++
            foundMatch = true
            break
          }
        }
      }
      
      // If still no match, mark current words as wrong/missing and advance
      if (!foundMatch) {
        results.push({ text: userWord.text, type: 'wrong' })
        wrong++
        userIdx++
        
        results.push({ text: actualWord.text, type: 'missing' })
        missing++
        actualIdx++
      }
    }
  }
  
  // Process remaining words
  while (userIdx < normalizedUserWords.length) {
    results.push({ text: normalizedUserWords[userIdx].text, type: 'wrong' })
    wrong++
    userIdx++
  }
  
  while (actualIdx < normalizedActualWords.length) {
    results.push({ text: normalizedActualWords[actualIdx].text, type: 'missing' })
    missing++
    actualIdx++
  }
  
  // Generate HTML output
  let html = ''
  for (const word of results) {
    let className = ''
    switch (word.type) {
      case 'correct': 
        className = 'word-correct'
        break
      case 'mistake': 
        className = 'word-mistake'
        break
      case 'missing': 
        className = 'word-missing'
        break
      case 'wrong': 
        className = 'word-wrong'
        break
    }
    html += `<span class="${className}">${word.text}</span> `
  }
  
  // Calculate accuracy
  const totalAttempted = correct + mistake + wrong
  const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100 * 10) / 10 : 0.0
  
  return {
    html: html.trim(),
    stats: {
      accuracy,
      correct,
      incorrect: mistake + wrong,
      missing
    }
  }
}

/**
 * API endpoint to compare transcriptions
 */
export default defineEventHandler(async (event) => {
  // Get request body
  const body = await readBody(event) as ComparisonRequest
  
  if (!body || !body.userText || !body.officialText) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Both user text and official text are required'
    })
  }
  
  try {
    // Compare the transcriptions
    const result = compareTranscriptions(body.userText, body.officialText)
    return result
  } catch (error: any) {
    console.error('Error comparing transcriptions:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to compare transcriptions',
      cause: error
    })
  }
}) 