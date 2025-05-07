# Transcription Practice

A web application for practicing and improving transcription skills, adapted from Anvil to Nuxt.

## Features

- Search for YouTube videos to practice transcription on
- Transcribe videos and compare with official transcripts
- Get detailed accuracy statistics and visual feedback on your transcription
- Support for multiple languages
- Robust comparison algorithm that identifies correct, wrong, missing, and mistyped words

## Tech Stack

- Nuxt 3
- Vue 3 with Composition API
- TypeScript
- Server API routes for backend functionality

## Development Setup

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

4. Navigate to `http://localhost:3000` in your browser

## Usage

1. Navigate to the Compare page
2. Search for a video to transcribe
3. Type your transcription in the "Your Transcription" box
4. Paste the official transcription in the "Official Transcription" box
5. Click "Compare" to see your accuracy results

## API Endpoints

- `/api/youtube/search` - Search for YouTube videos
- `/api/youtube/transcript` - Fetch a video transcript
- `/api/compare` - Compare two transcriptions

## License

MIT

## Acknowledgements

This project was adapted from an Anvil application to a Nuxt.js application.
