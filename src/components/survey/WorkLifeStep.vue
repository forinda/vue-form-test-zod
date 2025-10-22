<template>
  <section class="space-y-6">
    <div class="grid gap-6 md:grid-cols-2">
      <FormRadioGroup
        :form="form"
        name="workLife.workSatisfaction"
        label="How satisfied are you with your current job?"
        :options="satisfactionOptions"
        required
      />
      <FormRadioGroup
        :form="form"
        name="workLife.workLifeBalance"
        label="How would you rate your work-life balance?"
        :options="satisfactionOptions"
        required
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <FormSelect
        :form="form"
        name="workLife.remoteWorkFrequency"
        label="How often do you work remotely?"
        :options="frequencyOptions"
        placeholder="Select frequency..."
        required
      />
      <FormInput
        :form="form"
        name="workLife.teamSize"
        type="number"
        label="Team Size"
        placeholder="5"
        description="How many people are on your immediate team?"
        required
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <FormSelect
        :form="form"
        name="workLife.meetingFrequency"
        label="How often do you attend meetings?"
        :options="frequencyOptions"
        placeholder="Select frequency..."
        required
      />
      <FormSelect
        :form="form"
        name="workLife.overtimeFrequency"
        label="How often do you work overtime?"
        :options="frequencyOptions"
        placeholder="Select frequency..."
        required
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import FormInput from '../form/FormInput.vue'
import FormSelect from '../form/FormSelect.vue'
import FormRadioGroup from '../form/FormRadioGroup.vue'
import { satisfactionOptions, frequencyOptions } from '../../lib/data/survey-options'
import type { UseFormReturn } from '../../composables/useForm'
import type { SurveyFormValues } from '../../lib/data/survey-schema'

defineProps<{
  form: UseFormReturn<SurveyFormValues>
}>()
</script>