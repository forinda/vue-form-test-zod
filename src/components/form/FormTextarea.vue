<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  RegisterFieldOptions,
  RegisteredFieldBinding,
  UseFormReturn,
} from '../../composables/useForm'

const props = withDefaults(
  defineProps<{
    form: UseFormReturn<any>
    name: string
    label?: string
    description?: string
    error?: string | null
    placeholder?: string
    id?: string
    rows?: number
    required?: boolean
    disabled?: boolean
    registerOptions?: RegisterFieldOptions<any, any>
  }>(),
  {
    rows: 4,
  },
)

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

const textareaId = computed(() => props.id ?? `field-${binding.value.name.replace(/\W+/g, '-')}`)
const describedById = computed(() =>
  props.description ? `${textareaId.value}-description` : undefined,
)

const errorMessage = computed(
  () => props.error ?? props.form.errors[binding.value.name] ?? null,
)
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="textareaId"
      class="text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="ml-0.5 text-rose-500">*</span>
    </label>

    <textarea
      v-bind="binding"
      :id="textareaId"
      :placeholder="placeholder"
      :rows="rows"
      :disabled="disabled"
      :aria-invalid="errorMessage ? 'true' : undefined"
      :aria-describedby="describedById"
      :class="[
        'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60',
        errorMessage ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/40' : '',
      ]"
    />

    <p v-if="description" :id="describedById" class="text-xs text-slate-500">
      {{ description }}
    </p>
    <p v-if="errorMessage" class="text-xs font-medium text-rose-600">
      {{ errorMessage }}
    </p>
  </div>
</template>
