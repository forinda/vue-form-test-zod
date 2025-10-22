<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="ml-0.5 text-rose-500">*</span>
    </label>

    <div class="relative">
      <!-- Main Input Container -->
      <div
        class="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/40"
        :class="[
          errorMessage ? 'border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/40' : '',
          disabled ? 'cursor-not-allowed opacity-60 bg-slate-50' : '',
        ]"
        @click="focusInput"
      >
        <!-- Chips/Tags -->
        <div
          v-for="(chip, index) in chips"
          :key="index"
          class="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-200"
        >
          <span class="max-w-32 truncate">{{ chip }}</span>
          <button
            v-if="!disabled"
            type="button"
            class="inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-500 hover:bg-indigo-300 hover:text-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            @click.stop="removeChip(index)"
            :aria-label="`Remove ${chip}`"
          >
            <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <!-- Input Field -->
        <input
          ref="inputRef"
          v-model="inputValue"
          type="text"
          :id="inputId"
          :disabled="disabled"
          :placeholder="chips.length === 0 ? (placeholder || 'Type and press Enter to add...') : ''"
          :aria-invalid="errorMessage ? 'true' : undefined"
          :aria-describedby="describedById"
          class="flex-1 min-w-32 border-0 bg-transparent p-0 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-0"
          :class="{ 'cursor-not-allowed': disabled }"
          @keydown="handleKeyDown"
          @blur="handleBlur"
        />
      </div>

      <!-- Suggestions Dropdown -->
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        ref="dropdownRef"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <div
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion"
          class="relative cursor-pointer select-none py-2 px-3 transition hover:bg-slate-50"
          :class="[
            highlightedIndex === index ? 'bg-indigo-50 text-indigo-900' : 'text-slate-900',
          ]"
          @click="addChipFromSuggestion(suggestion)"
          @mouseenter="highlightedIndex = index"
        >
          {{ suggestion }}
        </div>
      </div>
    </div>

    <p v-if="description" :id="describedById" class="text-xs text-slate-500">
      {{ description }}
    </p>
    <p v-if="errorMessage" class="text-xs font-medium text-rose-600">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
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

type FormChipInputProps<
  TForm extends UseFormReturn<any> = UseFormReturn<any>,
> = {
  form: TForm
  name: FieldPath<FormValues<TForm>>
  label?: string
  description?: string
  error?: string | null
  placeholder?: string
  id?: string
  required?: boolean
  disabled?: boolean
  suggestions?: string[]
  allowDuplicates?: boolean
  maxChips?: number
  separator?: string | RegExp
  registerOptions?: RegisterFieldOptions<any, FormValues<TForm>>
}

const props = withDefaults(defineProps<FormChipInputProps>(), {
  suggestions: () => [],
  allowDuplicates: false,
  separator: ',',
})

const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()
const dropdownRef = ref<HTMLElement>()
const highlightedIndex = ref(-1)
const showSuggestions = ref(false)

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

const inputId = computed(() => props.id ?? `field-${binding.value.name.replace(/\W+/g, '-')}`)
const describedById = computed(() =>
  props.description ? `${inputId.value}-description` : undefined,
)

const errorMessage = computed(
  () => props.error ?? props.form.errors[binding.value.name] ?? null,
)

const chips = computed({
  get: () => {
    const value = binding.value.modelValue
    return Array.isArray(value) ? value : []
  },
  set: (newChips: string[]) => {
    binding.value.modelValue = newChips
  }
})

const filteredSuggestions = computed(() => {
  if (!inputValue.value.trim() || !props.suggestions.length) {
    return []
  }
  
  const query = inputValue.value.toLowerCase().trim()
  const existing = chips.value.map(chip => chip.toLowerCase())
  
  return props.suggestions
    .filter(suggestion => {
      const suggestionLower = suggestion.toLowerCase()
      return suggestionLower.includes(query) && 
        (props.allowDuplicates || !existing.includes(suggestionLower))
    })
    .slice(0, 10) // Limit suggestions
})

function focusInput() {
  if (!props.disabled && inputRef.value) {
    inputRef.value.focus()
  }
}

function addChip(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return false

  if (!props.allowDuplicates && chips.value.some(chip => chip.toLowerCase() === trimmedValue.toLowerCase())) {
    return false
  }

  if (props.maxChips && chips.value.length >= props.maxChips) {
    return false
  }

  chips.value = [...chips.value, trimmedValue]
  inputValue.value = ''
  showSuggestions.value = false
  highlightedIndex.value = -1
  return true
}

function removeChip(index: number) {
  if (props.disabled) return
  
  const newChips = [...chips.value]
  newChips.splice(index, 1)
  chips.value = newChips
  
  nextTick(() => {
    focusInput()
  })
}

function addChipFromSuggestion(suggestion: string) {
  if (addChip(suggestion)) {
    showSuggestions.value = false
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
        const suggestion = filteredSuggestions.value[highlightedIndex.value]
        if (suggestion) {
          addChipFromSuggestion(suggestion)
        }
      } else if (inputValue.value.trim()) {
        addChip(inputValue.value)
      }
      break

    case 'Backspace':
      if (!inputValue.value && chips.value.length > 0) {
        removeChip(chips.value.length - 1)
      }
      break

    case 'ArrowDown':
      if (showSuggestions.value && filteredSuggestions.value.length > 0) {
        event.preventDefault()
        highlightedIndex.value = Math.min(
          highlightedIndex.value + 1, 
          filteredSuggestions.value.length - 1
        )
      }
      break

    case 'ArrowUp':
      if (showSuggestions.value && filteredSuggestions.value.length > 0) {
        event.preventDefault()
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      }
      break

    case 'Escape':
      showSuggestions.value = false
      highlightedIndex.value = -1
      break

    case 'Tab':
      if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
        event.preventDefault()
        const suggestion = filteredSuggestions.value[highlightedIndex.value]
        if (suggestion) {
          addChipFromSuggestion(suggestion)
        }
      }
      break

    default:
      // Handle custom separators
      if (props.separator && typeof props.separator === 'string' && event.key === props.separator) {
        event.preventDefault()
        if (inputValue.value.trim()) {
          addChip(inputValue.value)
        }
      }
      break
  }
}

function handleBlur() {
  // Delay hiding suggestions to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }, 150)
}

function handleClickOutside(event: Event) {
  if (!dropdownRef.value) return
  
  const target = event.target as Node
  if (!dropdownRef.value.contains(target)) {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }
}

// Watch input value to show/hide suggestions
watch(inputValue, (newValue) => {
  if (newValue.trim() && props.suggestions.length > 0) {
    showSuggestions.value = true
    highlightedIndex.value = -1
  } else {
    showSuggestions.value = false
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>