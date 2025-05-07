<template>
  <div>
    <h1 class="text-center my-4">Transcription Practice</h1>
    <div class="card">
      <h2>Welcome to Transcription Practice</h2>
      <p>Improve your transcription skills by practicing with real-world content.</p>
      <p>This application allows you to:</p>
      <ul>
        <li>Search for YouTube videos</li>
        <li>Watch and transcribe the content</li>
        <li>Compare your transcription with the official one</li>
        <li>See detailed accuracy statistics</li>
      </ul>
      <div class="text-center">
        <NuxtLink to="/compare" class="btn btn-primary">Start Practicing</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Home page component
definePageMeta({
  title: 'Home'
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
</style> 