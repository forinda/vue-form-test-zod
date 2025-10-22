<template>
  <section class="space-y-6">
    <FormSelect
      :form="form"
      name="skillsInterests.skills"
      label="Primary Skills"
      :options="skillsOptions"
      multiple
      searchable
      placeholder="Select your primary skills..."
      description="Choose all that apply to your current expertise"
      required
    />

    <FormSelect
      :form="form"
      name="skillsInterests.programmingLanguages"
      label="Programming Languages"
      :options="skillsOptions"
      multiple
      searchable
      placeholder="Select programming languages..."
      description="Languages you actively use or have experience with"
      required
    />

    <FormTextarea
      :form="form"
      name="skillsInterests.learningGoals"
      label="Learning Goals"
      placeholder="Describe what you want to learn or improve on..."
      description="What skills or technologies are you currently focusing on?"
      :rows="4"
      required
    />

    <FormSelect
      :form="form"
      name="skillsInterests.hobbies"
      label="Hobbies & Interests"
      :options="hobbyOptions"
      multiple
      placeholder="Select your hobbies..."
      description="Help us understand what you enjoy outside of work"
      required
    />

    <FormInput
      :form="form"
      name="skillsInterests.favoriteTools"
      label="Favorite Development Tools"
      placeholder="VS Code, Git, Docker, etc."
      description="List your go-to tools and software"
      required
    />
  </section>
</template>

<script setup lang="ts">
import FormInput from '../form/FormInput.vue'
import FormSelect from '../form/FormSelect.vue'
import FormTextarea from '../form/FormTextarea.vue'
import { skillsOptions, hobbyOptions } from '../../lib/data/survey-options'
import type { UseFormReturn } from '../../composables/useForm'
import type { SurveyFormValues } from '../../lib/data/survey-schema'

defineProps<{
  form: UseFormReturn<SurveyFormValues>
}>()
</script>