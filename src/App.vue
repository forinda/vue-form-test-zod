<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const isActive = (routeName: string) => {
  return route.name === routeName
}

const pageTitle = computed(() => {
  return route.meta.title as string || 'Vue Form Test'
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Title -->
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">Vue Form Test</h1>
          </div>

          <!-- Navigation -->
          <nav class="flex space-x-8">
            <RouterLink
              to="/survey"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
              :class="[
                isActive('survey')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Survey Form
            </RouterLink>

            <RouterLink
              to="/demo"
              class="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
              :class="[
                isActive('demo')
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              ]"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
              </svg>
              Components Demo
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Page Content -->
    <main class="flex-1">
      <!-- Page Title Bar -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h2 class="text-2xl font-bold text-gray-900">{{ pageTitle }}</h2>
        </div>
      </div>

      <!-- Router View -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RouterView />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center text-sm text-gray-500">
          <p>&copy; 2025 Vue Form Test. Built with Vue 3, TypeScript & Tailwind CSS.</p>
          <div class="flex space-x-4">
            <RouterLink
              to="/survey"
              class="hover:text-gray-700 transition-colors duration-200"
            >
              Survey
            </RouterLink>
            <RouterLink
              to="/demo"
              class="hover:text-gray-700 transition-colors duration-200"
            >
              Demo
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
