<template>
  <div>
    <header class="header">
      <div class="container">
        <div class="nav-bar">
          <div class="logo-section">
            <img src="/logo.png" alt="Logo" class="logo" style="height: 40px;" onerror="this.src='https://via.placeholder.com/40x40'">
            <h1 style="font-size: 1.5rem; margin: 0 0 0 1rem; font-weight: 600;">Transcription Practice</h1>
          </div>
          <div class="nav-links">
            <NuxtLink to="/">Home</NuxtLink>
            <NuxtLink to="/compare">Compare</NuxtLink>
          </div>
        </div>
      </div>
    </header>
    <main class="content">
      <div class="container">
        <NuxtPage />
      </div>
    </main>
  </div>
</template>

<style>
.header .logo-section {
  display: flex;
  align-items: center;
}
</style>
