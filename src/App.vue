<script setup lang="ts">
import { ref } from 'vue'
import SurveyForm from './components/survey/SurveyForm.vue'
import FormDemo from './components/FormDemo.vue'

const currentView = ref<'survey' | 'demo'>('survey')
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with view toggle -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-semibold text-gray-900">Vue Form Components</h1>
          
          <div class="flex items-center gap-4">
            <button
              @click="currentView = 'survey'"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="currentView === 'survey' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-100'"
            >
              Survey Form
            </button>
            
            <button
              @click="currentView = 'demo'"
              class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              :class="currentView === 'demo' 
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                : 'text-gray-600 hover:text-gray-900 border border-transparent hover:bg-gray-100'"
            >
              Components Demo
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="py-8">
      <SurveyForm v-if="currentView === 'survey'" />
      <FormDemo v-else />
    </main>
  </div>
</template>
