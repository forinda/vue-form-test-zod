<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  RegisterFieldOptions,
  RegisteredFieldBinding,
  UseFormReturn,
} from '../../composables/useForm'

const props = defineProps<{
  form: UseFormReturn<any>
  name: string
  label?: string
  description?: string
  error?: string | null
  id?: string
  disabled?: boolean
  registerOptions?: RegisterFieldOptions<any, any>
}>()

const effectiveRegisterOptions = computed<RegisterFieldOptions<any, any>>(() => ({
  valueProp: 'checked',
  ...(props.registerOptions ?? {}),
}))

const binding = ref<RegisteredFieldBinding>(
  props.form.register(props.name, effectiveRegisterOptions.value),
)

watch(
  () => props.name,
  (newName, oldName) => {
    if (newName === oldName) {
      return
    }
    binding.value = props.form.register(newName, effectiveRegisterOptions.value)
  },
)

watch(
  effectiveRegisterOptions,
  (options) => {
    binding.value = props.form.register(props.name, options)
  },
  { deep: true },
)

const checkboxId = computed(() => props.id ?? `field-${binding.value.name.replace(/\W+/g, '-')}`)

const errorMessage = computed(
  () => props.error ?? props.form.errors[binding.value.name] ?? null,
)
</script>

<template>
  <div class="flex gap-3 rounded-md border border-transparent px-2 py-2 transition hover:border-slate-200">
    <div class="pt-1">
      <input
        v-bind="binding"
        :id="checkboxId"
        type="checkbox"
        :disabled="disabled"
        :aria-invalid="errorMessage ? 'true' : undefined"
        class="h-5 w-5 rounded border-slate-300 text-indigo-600 transition focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
    <div class="flex flex-1 flex-col gap-1">
      <label v-if="label" :for="checkboxId" class="text-sm font-medium text-slate-700">
        {{ label }}
      </label>
      <p v-if="description" class="text-xs text-slate-500">
        {{ description }}
      </p>
      <p v-if="errorMessage" class="text-xs font-medium text-rose-600">
        {{ errorMessage }}
      </p>
    </div>
  </div>
</template>
