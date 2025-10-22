<template>
  <div class="flex w-full flex-col gap-10 lg:flex-row">
    <section class="flex-1">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 lg:p-10"
      >
        <header class="space-y-2">
          <p class="text-xs uppercase tracking-[0.3em] text-indigo-500">Survey</p>
          <h1 class="text-3xl font-semibold text-slate-900 lg:text-4xl">
            Developer Survey 2025
          </h1>
          <p class="max-w-2xl text-sm text-slate-500">
            Help us understand the developer community better. This comprehensive survey covers your background, skills, and future goals.
          </p>
        </header>
          <!-- Progress Bar -->
          <SurveyProgress :current-step="currentStep" :total-steps="totalSteps" />
          <form class="space-y-8" @submit.prevent="submitForm">
            <!-- Dynamic Step Content -->
            <PersonalInfoStep v-if="currentStep === 1" :form="form" />
            <EducationWorkStep v-if="currentStep === 2" :form="form" />
            <SkillsInterestsStep v-if="currentStep === 3" :form="form" />
            <WorkLifeStep v-if="currentStep === 4" :form="form" />
            <FutureGoalsStep v-if="currentStep === 5" :form="form" />

            <!-- Navigation -->
            <footer class="flex flex-wrap items-center gap-3 pt-6 border-t border-slate-200">
              <button
                v-if="currentStep > 1"
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-white"
                @click="prevStep"
              >
                ← Previous
              </button>

              <button
                v-if="currentStep < totalSteps"
                type="button"
                class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
                @click="nextStep"
              >
                Next →
              </button>

              <button
                v-if="currentStep === totalSteps"
                type="submit"
                class="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-emerald-300"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Submitting...</span>
                <span v-else>Submit Survey</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting || !isDirty"
                @click="resetForm"
              >
                Reset
              </button>

              <span
                v-if="form.formState.value.submitCount"
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Submitted {{ form.formState.value.submitCount }} times
              </span>
            </footer>
          </form>
        </div>
      </section>

      <aside class="lg:w-96">
        <div class="space-y-6">
          <!-- Step Navigator -->
          <SurveyNavigation :current-step="currentStep" :go-to-step="goToStep" />

          <!-- Live Values -->
          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <header class="space-y-2">
              <h2 class="text-lg font-semibold text-slate-900">Live values</h2>
              <p class="text-sm text-slate-500">
                Form state updates reactively as you interact.
              </p>
            </header>
            <pre
              class="mt-4 max-h-80 overflow-y-auto rounded-2xl bg-slate-900/95 px-4 py-3 text-xs leading-relaxed text-slate-100 shadow-inner"
            >{{ JSON.stringify(form.values, null, 2) }}</pre>
          </section>

          <!-- Latest Submission -->
          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <header class="space-y-2">
              <h2 class="text-lg font-semibold text-slate-900">Latest submission</h2>
              <p class="text-sm text-slate-500">
                Results are cleared when you reset the form.
              </p>
            </header>
            <pre
              v-if="submitted"
              class="mt-4 max-h-80 overflow-y-auto rounded-2xl bg-emerald-950/95 px-4 py-3 text-xs leading-relaxed text-emerald-100 shadow-inner"
            >{{ JSON.stringify(submitted, null, 2) }}</pre>
            <p v-else class="mt-4 text-sm text-slate-500">
              No submission yet. Complete the survey and hit submit to preview the payload.
            </p>
          </section>
        </div>
      </aside>
  </div>
</template>

<script setup lang="ts">
import { useSurveyForm } from '../../composables/survey/useSurveyForm'
import SurveyProgress from './SurveyProgress.vue'
import SurveyNavigation from './SurveyNavigation.vue'
import PersonalInfoStep from './PersonalInfoStep.vue'
import EducationWorkStep from './EducationWorkStep.vue'
import SkillsInterestsStep from './SkillsInterestsStep.vue'
import WorkLifeStep from './WorkLifeStep.vue'
import FutureGoalsStep from './FutureGoalsStep.vue'

const {
  currentStep,
  submitted,
  form,
  totalSteps,
  nextStep,
  prevStep,
  goToStep,
  submitForm,
  resetForm,
  isSubmitting,
  isDirty,
} = useSurveyForm()
</script>