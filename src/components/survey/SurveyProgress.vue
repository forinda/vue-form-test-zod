<template>
  <div class="mt-8 mb-10">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-slate-900">{{ stepInfo[currentStep - 1]?.title || 'Survey' }}</h2>
      <span class="text-xs font-medium uppercase tracking-wide text-slate-400">
        Step {{ currentStep }} of {{ totalSteps }}
      </span>
    </div>
    <p class="text-sm text-slate-500 mb-4">{{ stepInfo[currentStep - 1]?.description || 'Complete this step' }}</p>
    <div class="w-full bg-slate-200 rounded-full h-2">
      <div
        class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
        :style="{ width: `${(currentStep / totalSteps) * 100}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { stepInfo } from '../../lib/data/survey-config'

defineProps<{
  currentStep: number
  totalSteps: number
}>()
</script>