<template>
  <div class="text-center py-16">
    <div class="max-w-md mx-auto">
      <div class="text-6xl text-gray-400 mb-4">404</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p class="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <RouterLink
          to="/survey"
          class="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
        >
          Go to Survey
        </RouterLink>
        
        <RouterLink
          to="/demo"
          class="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
        >
          View Demo
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>