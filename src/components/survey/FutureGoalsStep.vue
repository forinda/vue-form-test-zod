<template>
  <section class="space-y-6">
    <FormTextarea
      :form="form"
      name="futureGoals.careerGoals"
      label="Career Goals"
      placeholder="Describe your career aspirations..."
      description="Where do you see your career heading in the next few years?"
      :rows="4"
      required
    />

    <FormSelect
      :form="form"
      name="futureGoals.skillsToLearn"
      label="Skills You Want to Learn"
      :options="skillsOptions"
      multiple
      searchable
      placeholder="Select skills to learn..."
      description="What new skills or technologies interest you?"
      required
    />

    <FormInput
      :form="form"
      name="futureGoals.dreamJob"
      label="Dream Job"
      placeholder="Describe your ideal role..."
      description="What would be your perfect job or position?"
      required
    />

    <FormTextarea
      :form="form"
      name="futureGoals.fiveYearPlan"
      label="5-Year Plan"
      placeholder="Where do you see yourself in 5 years?"
      description="Your long-term professional and personal goals"
      :rows="4"
      required
    />

    <div class="space-y-4">
      <FormCheckbox
        :form="form"
        name="futureGoals.mentorship"
        label="Interested in Mentorship"
        description="Would you be interested in mentoring other developers?"
      />

      <FormCheckbox
        :form="form"
        name="futureGoals.openToOpportunities"
        label="Open to New Opportunities"
        description="Can we contact you about relevant job opportunities?"
      />
    </div>

    <FormTextarea
      :form="form"
      name="futureGoals.additionalComments"
      label="Additional Comments"
      placeholder="Any other thoughts or feedback..."
      description="Anything else you'd like to share with us?"
      :rows="3"
    />
  </section>
</template>

<script setup lang="ts">
import FormInput from '../form/FormInput.vue'
import FormSelect from '../form/FormSelect.vue'
import FormTextarea from '../form/FormTextarea.vue'
import FormCheckbox from '../form/FormCheckbox.vue'
import { skillsOptions } from '../../lib/data/survey-options'
import type { UseFormReturn } from '../../composables/useForm'
import type { SurveyFormValues } from '../../lib/data/survey-schema'

defineProps<{
  form: UseFormReturn<SurveyFormValues>
}>()
</script>