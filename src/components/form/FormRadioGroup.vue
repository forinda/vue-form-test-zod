<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  FieldPath,
  RegisterFieldOptions,
  RegisteredFieldBinding,
  UseFormReturn,
} from '../../composables/useForm'

interface RadioOption<T = any> {
  label: string
  value: T
  description?: string
  id?: string
}

type FormValues<TForm extends UseFormReturn<any>> = TForm extends UseFormReturn<infer TValues>
  ? TValues extends Record<string, any>
    ? TValues
    : Record<string, any>
  : Record<string, any>

type FormRadioGroupProps<
  TForm extends UseFormReturn<any> = UseFormReturn<any>,
> = {
  form: TForm
  name: FieldPath<FormValues<TForm>>
  label?: string
  description?: string
  error?: string | null
  options: RadioOption[]
  inline?: boolean
  disabled?: boolean
  registerOptions?: RegisterFieldOptions<any, FormValues<TForm>>
}

const props = withDefaults(defineProps<FormRadioGroupProps>(), {
  options: () => [],
  inline: false,
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

const errorMessage = computed(
  () => props.error ?? props.form.errors[binding.value.name] ?? null,
)

const groupName = computed(() => binding.value.name)

const optionId = (option: RadioOption, index: number) =>
  option.id ?? `${groupName.value.replace(/\W+/g, '-')}-option-${index}`

function handleChange(value: any) {
  binding.value.onChange(value)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span v-if="label" class="text-sm font-medium text-slate-700">
      {{ label }}
    </span>
    <p v-if="description" class="text-xs text-slate-500">
      {{ description }}
    </p>

    <div :class="[inline ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2']">
      <label
        v-for="(option, index) in options"
        :key="optionId(option, index)"
        :for="optionId(option, index)"
        class="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-indigo-200"
        :class="[
          binding.modelValue === option.value
            ? 'border-indigo-400 ring-2 ring-indigo-500/30'
            : '',
          disabled ? 'cursor-not-allowed opacity-60' : '',
        ]"
      >
        <input
          :id="optionId(option, index)"
          type="radio"
          :name="groupName"
          :value="option.value"
          :checked="binding.modelValue === option.value"
          :disabled="disabled"
          @change="handleChange(option.value)"
          @blur="binding.onBlur"
          class="mt-1 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span class="flex flex-col gap-0.5">
          <span class="font-medium text-slate-700">{{ option.label }}</span>
          <span v-if="option.description" class="text-xs text-slate-500">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>

    <p v-if="errorMessage" class="text-xs font-medium text-rose-600">
      {{ errorMessage }}
    </p>
  </div>
</template>
