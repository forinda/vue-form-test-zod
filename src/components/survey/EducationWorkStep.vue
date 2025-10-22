<template>
  <section class="space-y-6">
    <div class="grid gap-6 md:grid-cols-2">
      <FormSelect
        :form="form"
        name="educationWork.education"
        label="Highest Education Level"
        :options="educationOptions"
        placeholder="Select education level..."
        required
      />
      <FormInput
        :form="form"
        name="educationWork.jobTitle"
        label="Current Job Title"
        placeholder="Senior Software Engineer"
        required
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <FormInput
        :form="form"
        name="educationWork.company"
        label="Company"
        placeholder="Tech Corp Inc."
        required
      />
      <FormSelect
        :form="form"
        name="educationWork.experience"
        label="Years of Experience"
        :options="experienceOptions"
        placeholder="Select experience level..."
        required
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <FormSelect
        :form="form"
        name="educationWork.industry"
        label="Industry"
        :options="industryOptions"
        placeholder="Select your industry..."
        required
      />
      <FormInput
        :form="form"
        name="educationWork.salary"
        type="number"
        label="Annual Salary (USD)"
        placeholder="75000"
        description="Optional - helps us understand market trends"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import FormInput from '../form/FormInput.vue'
import FormSelect from '../form/FormSelect.vue'
import { educationOptions, experienceOptions, industryOptions } from '../../lib/data/survey-options'
import type { UseFormReturn } from '../../composables/useForm'
import type { SurveyFormValues } from '../../lib/data/survey-schema'

defineProps<{
  form: UseFormReturn<SurveyFormValues>
}>()
</script>