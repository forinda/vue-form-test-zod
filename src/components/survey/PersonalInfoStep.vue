<template>
  <section class="space-y-6">
    <div class="grid gap-6 md:grid-cols-2">
      <FormInput
        :form="form"
        name="personalInfo.firstName"
        label="First Name"
        placeholder="John"
        required
      />
      <FormInput
        :form="form"
        name="personalInfo.lastName"
        label="Last Name"
        placeholder="Doe"
        required
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <FormInput
        :form="form"
        name="personalInfo.email"
        type="email"
        label="Email"
        placeholder="john.doe@example.com"
        required
      />
      <FormInput
        :form="form"
        name="personalInfo.age"
        type="number"
        label="Age"
        placeholder="25"
        required
      />
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <FormSelect
        :form="form"
        name="personalInfo.gender"
        label="Gender"
        :options="genderOptions"
        placeholder="Select your gender..."
        required
      />
      <FormSelect
        :form="form"
        name="personalInfo.country"
        label="Country"
        :options="countryOptions"
        placeholder="Select your country..."
        searchable
        required
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import FormInput from '../form/FormInput.vue'
import FormSelect from '../form/FormSelect.vue'
import { genderOptions, countryOptions } from '../../lib/data/survey-options'
import type { UseFormReturn } from '../../composables/useForm'
import type { SurveyFormValues } from '../../lib/data/survey-schema'

defineProps<{
  form: UseFormReturn<SurveyFormValues>
}>()
</script>