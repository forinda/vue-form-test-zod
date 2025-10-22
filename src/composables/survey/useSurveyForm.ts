import { computed, ref } from 'vue'
import { useForm } from '../useForm'
import { surveySchema, defaultSurveyValues, type SurveyFormValues } from '../../lib/data/survey-schema'
import { TOTAL_STEPS, getFieldsForStep } from '../../lib/data/survey-config'

export function useSurveyForm() {
  // Current step state
  const currentStep = ref(1)
  const submitted = ref<SurveyFormValues | null>(null)

  // Form setup
  const form = useForm<SurveyFormValues>({
    mode: 'onBlur',
    schema: surveySchema,
    defaultValues: defaultSurveyValues,
  })

  // Step validation functions
  const validateCurrentStep = async (): Promise<boolean> => {
    // Validate only the current step's fields
    const fieldsForCurrentStep = getFieldsForStep(currentStep.value)
    return await form.validate(fieldsForCurrentStep as any)
  }

  // Navigation functions
  const nextStep = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep.value < TOTAL_STEPS) {
      currentStep.value++
    }
  }

  const prevStep = () => {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  const goToStep = async (step: number) => {
    if (step <= currentStep.value || step === currentStep.value + 1) {
      if (step > currentStep.value) {
        const isValid = await validateCurrentStep()
        if (!isValid) return
      }
      currentStep.value = step
    }
  }

  // Form submission
  const submitForm = form.handleSubmit(async (values) => {
    submitted.value = values
  })

  const resetForm = () => {
    submitted.value = null
    currentStep.value = 1
    form.reset()
  }

  // Computed properties
  const isSubmitting = computed(() => form.formState.value.isSubmitting)
  const isDirty = computed(() => form.formState.value.isDirty)

  return {
    // State
    currentStep,
    submitted,
    form,
    
    // Constants
    totalSteps: TOTAL_STEPS,
    
    // Methods
    nextStep,
    prevStep,
    goToStep,
    submitForm,
    resetForm,
    validateCurrentStep,
    
    // Computed
    isSubmitting,
    isDirty,
  }
}