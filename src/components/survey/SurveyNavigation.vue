<template>
  <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
    <header class="space-y-2">
      <h2 class="text-lg font-semibold text-slate-900">Progress</h2>
      <p class="text-sm text-slate-500">
        Click on completed steps to navigate back.
      </p>
    </header>
    <div class="mt-4 space-y-2">
      <button
        v-for="(step, index) in stepInfo"
        :key="index"
        type="button"
        class="w-full text-left p-3 rounded-lg border transition"
        :class="[
          index + 1 === currentStep
            ? 'border-indigo-200 bg-indigo-50 text-indigo-900'
            : index + 1 < currentStep
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
            : 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed opacity-60'
        ]"
        :disabled="index + 1 > currentStep"
        @click="goToStep(index + 1)"
      >
        <div class="flex items-center gap-3">
          <span
            class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium"
            :class="[
              index + 1 === currentStep
                ? 'bg-indigo-600 text-white'
                : index + 1 < currentStep
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-300 text-slate-600'
            ]"
          >
            <span v-if="index + 1 < currentStep">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </span>
          <div>
            <div class="text-sm font-medium">{{ step.title }}</div>
            <div class="text-xs opacity-75">{{ step.description }}</div>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { stepInfo } from '../../lib/data/survey-config'

defineProps<{
  currentStep: number
  goToStep: (step: number) => Promise<void>
}>()
</script>