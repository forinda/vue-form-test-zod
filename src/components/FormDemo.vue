<template>
  <div class="max-w-4xl mx-auto p-8 space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Form Components Demo</h1>
      <p class="text-gray-600">Interactive showcase of all available form components</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Form Input -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Text Inputs</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            :form="form"
            name="firstName"
            label="First Name"
            placeholder="Enter your first name"
            description="Your given name"
            required
          />
          
          <FormInput
            :form="form"
            name="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <FormTextarea
          :form="form"
          name="bio"
          label="Biography"
          placeholder="Tell us about yourself..."
          description="A brief description of yourself"
                    :rows="4"
        />
      </section>

      <!-- Chip Input -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Chip Input</h2>
        
        <FormChipInput
          :form="form"
          name="skills"
          label="Skills"
          description="Type skills and press Enter to add them"
          placeholder="Type a skill and press Enter..."
          :suggestions="skillSuggestions"
          :max-chips="10"
        />

        <FormChipInput
          :form="form"
          name="tags"
          label="Tags"
          description="Comma-separated tags"
          placeholder="Add tags..."
          separator=","
          :allow-duplicates="false"
        />
      </section>

      <!-- Select Components -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Select Components</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            :form="form"
            name="country"
            label="Country"
            :options="countryOptions"
            placeholder="Select your country"
            searchable
            required
          />

          <FormSelect
            :form="form"
            name="languages"
            label="Programming Languages"
            :options="languageOptions"
            placeholder="Select languages"
            multiple
            searchable
          />
        </div>
      </section>

      <!-- Radio and Checkbox -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Choice Components</h2>
        
        <FormRadioGroup
          :form="form"
          name="experience"
          label="Experience Level"
          :options="experienceOptions"
          required
        />

        <div class="space-y-3">
          <FormCheckbox
            :form="form"
            name="newsletter"
            label="Subscribe to newsletter"
            description="Receive updates about new features and releases"
          />

          <FormCheckbox
            :form="form"
            name="terms"
            label="I agree to the terms and conditions"
            required
          />
        </div>
      </section>

      <!-- Switch Components -->
      <section class="space-y-4">
        <h2 class="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Switch Components</h2>
        
        <div class="space-y-4">
          <FormSwitch
            :form="form"
            name="notifications"
            label="Enable Notifications"
            description="Receive push notifications for important updates"
            switch-position="right"
          />

          <FormSwitch
            :form="form"
            name="darkMode"
            label="Dark Mode"
            description="Switch to dark theme"
            switch-position="left"
          />

          <FormSwitch
            :form="form"
            name="publicProfile"
            label="Public Profile"
            description="Make your profile visible to other users"
          />
        </div>
      </section>

      <!-- Form Actions -->
      <div class="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="resetForm"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Reset Form
        </button>

        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="logFormData"
            class="px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-100 border border-indigo-200 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Log Data
          </button>
          
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSubmitting ? 'Submitting...' : 'Submit Form' }}
          </button>
        </div>
      </div>
    </form>

    <!-- Form State Display -->
    <div class="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 class="text-lg font-medium text-gray-900 mb-4">Form State</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Values:</h4>
          <pre class="text-xs bg-white p-3 rounded border overflow-auto max-h-48">{{ JSON.stringify(form.values, null, 2) }}</pre>
        </div>
        <div>
          <h4 class="font-medium text-gray-700 mb-2">Errors:</h4>
          <pre class="text-xs bg-white p-3 rounded border overflow-auto max-h-48">{{ JSON.stringify(form.errors, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { z } from 'zod'
import { useForm } from '../composables/useForm'
import {
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
  FormRadioGroup,
  FormChipInput,
  FormSwitch,
} from './form'

// Form schema
const demoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Please enter a valid email'),
  bio: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Please add at least one skill'),
  tags: z.array(z.string()).optional(),
  country: z.string().min(1, 'Please select a country'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
  experience: z.string().min(1, 'Please select your experience level'),
  newsletter: z.boolean().optional(),
  terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  notifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
})

type DemoFormValues = z.infer<typeof demoSchema>

// Form setup
const form = useForm<DemoFormValues>({
  mode: 'onSubmit',
  schema: demoSchema,
  defaultValues: {
    firstName: '',
    email: '',
    bio: '',
    skills: [],
    tags: [],
    country: '',
    languages: [],
    experience: '',
    newsletter: false,
    terms: false,
    notifications: true,
    darkMode: false,
    publicProfile: false,
  },
})

// Options
const skillSuggestions = [
  'JavaScript', 'TypeScript', 'Vue.js', 'React', 'Angular', 'Node.js',
  'Python', 'Java', 'PHP', 'Go', 'Rust', 'CSS', 'HTML', 'Docker',
  'Kubernetes', 'AWS', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL'
]

const countryOptions = [
  { label: 'United States', value: 'us' },
  { label: 'Canada', value: 'ca' },
  { label: 'United Kingdom', value: 'uk' },
  { label: 'Germany', value: 'de' },
  { label: 'France', value: 'fr' },
  { label: 'Australia', value: 'au' },
  { label: 'Japan', value: 'jp' },
  { label: 'South Korea', value: 'kr' },
  { label: 'Brazil', value: 'br' },
  { label: 'India', value: 'in' },
]

const languageOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C#', value: 'csharp' },
  { label: 'PHP', value: 'php' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
]

const experienceOptions = [
  { label: 'Beginner (0-1 years)', value: 'beginner' },
  { label: 'Intermediate (2-4 years)', value: 'intermediate' },
  { label: 'Advanced (5-7 years)', value: 'advanced' },
  { label: 'Expert (8+ years)', value: 'expert' },
]

// Computed
const isSubmitting = computed(() => form.formState.value.isSubmitting)

// Methods
const handleSubmit = form.handleSubmit(async (values) => {
  console.log('Form submitted with values:', values)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  alert('Form submitted successfully! Check the console for details.')
})

const resetForm = () => {
  form.reset()
}

const logFormData = () => {
  console.log('Current form values:', form.values)
  console.log('Current form errors:', form.errors)
  console.log('Form state:', form.formState.value)
}
</script>
