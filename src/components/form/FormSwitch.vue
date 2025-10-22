<template>
  <div class="flex flex-col gap-1.5">
    <!-- Switch Container -->
    <div v-if="switchPosition === 'right'" class="flex items-center justify-between gap-3">
      <!-- Label and Description (Left side) -->
      <div class="flex-1">
        <label
          v-if="label"
          :for="switchId"
          class="text-sm font-medium text-slate-700 cursor-pointer"
        >
          {{ label }}
          <span v-if="required" class="ml-0.5 text-rose-500">*</span>
        </label>
        <p v-if="description" :id="describedById" class="text-xs text-slate-500 mt-0.5">
          {{ description }}
        </p>
      </div>

      <!-- Switch (Right side) -->
      <button
        type="button"
        role="switch"
        :id="switchId"
        :disabled="disabled"
        :aria-checked="isChecked"
        :aria-describedby="describedById"
        :aria-invalid="errorMessage ? 'true' : undefined"
        class="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          isChecked 
            ? 'bg-indigo-600' 
            : 'bg-slate-200',
          errorMessage ? 'focus:ring-rose-500' : 'focus:ring-indigo-600',
        ]"
        @click="toggle"
      >
        <span class="sr-only">{{ label || 'Toggle switch' }}</span>
        <!-- Switch Thumb -->
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-disabled:bg-slate-100"
          :class="[
            isChecked ? 'translate-x-5' : 'translate-x-0'
          ]"
        >
          <!-- Check Icon (when enabled) -->
          <svg
            v-if="isChecked"
            class="absolute inset-0 h-full w-full text-indigo-600 opacity-100 transition-opacity duration-200 ease-in-out"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 4-4" />
          </svg>
          
          <!-- X Icon (when disabled) -->
          <svg
            v-else
            class="absolute inset-0 h-full w-full text-slate-400 opacity-100 transition-opacity duration-200 ease-in-out"
            fill="currentColor"
            viewBox="0 0 12 12"
          >
            <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </span>
      </button>
    </div>

    <!-- Alternative Layout: Switch on Left -->
    <div v-else class="flex items-center gap-3">
      <!-- Switch (Left side) -->
      <button
        type="button"
        role="switch"
        :id="switchId"
        :disabled="disabled"
        :aria-checked="isChecked"
        :aria-describedby="describedById"
        :aria-invalid="errorMessage ? 'true' : undefined"
        class="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        :class="[
          isChecked 
            ? 'bg-indigo-600' 
            : 'bg-slate-200',
          errorMessage ? 'focus:ring-rose-500' : 'focus:ring-indigo-600',
        ]"
        @click="toggle"
      >
        <span class="sr-only">{{ label || 'Toggle switch' }}</span>
        <span
          aria-hidden="true"
          class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          :class="[
            isChecked ? 'translate-x-5' : 'translate-x-0'
          ]"
        />
      </button>

      <!-- Label and Description (Right side) -->
      <div class="flex-1">
        <label
          v-if="label"
          :for="switchId"
          class="text-sm font-medium text-slate-700 cursor-pointer"
        >
          {{ label }}
          <span v-if="required" class="ml-0.5 text-rose-500">*</span>
        </label>
        <p v-if="description" :id="describedById" class="text-xs text-slate-500 mt-0.5">
          {{ description }}
        </p>
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="errorMessage" class="text-xs font-medium text-rose-600">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  FieldPath,
  RegisterFieldOptions,
  RegisteredFieldBinding,
  UseFormReturn,
} from '../../composables/useForm'

type FormValues<TForm extends UseFormReturn<any>> = TForm extends UseFormReturn<infer TValues>
  ? TValues extends Record<string, any>
    ? TValues
    : Record<string, any>
  : Record<string, any>

type FormSwitchProps<
  TForm extends UseFormReturn<any> = UseFormReturn<any>,
> = {
  form: TForm
  name: FieldPath<FormValues<TForm>>
  label?: string
  description?: string
  error?: string | null
  id?: string
  required?: boolean
  disabled?: boolean
  switchPosition?: 'left' | 'right'
  registerOptions?: RegisterFieldOptions<any, FormValues<TForm>>
}

const props = withDefaults(defineProps<FormSwitchProps>(), {
  switchPosition: 'right',
})

const binding = ref<RegisteredFieldBinding>(
  props.form.register(props.name, props.registerOptions),
)

watch(
  () => props.name,
  (newName, oldName) => {
    if (newName === oldName) {
      return
    }
    binding.value = props.form.register(newName, props.registerOptions)
  },
)

watch(
  () => props.registerOptions,
  (options) => {
    binding.value = props.form.register(props.name, options)
  },
  { deep: true },
)

const switchId = computed(() => props.id ?? `field-${binding.value.name.replace(/\W+/g, '-')}`)
const describedById = computed(() =>
  props.description ? `${switchId.value}-description` : undefined,
)

const errorMessage = computed(
  () => props.error ?? props.form.errors[binding.value.name] ?? null,
)

const isChecked = computed(() => Boolean(binding.value.modelValue))

function toggle() {
  if (props.disabled) return
  binding.value.modelValue = !binding.value.modelValue
}
</script>