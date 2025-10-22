<template>
  <div class="flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="selectId"
      class="text-sm font-medium text-slate-700"
    >
      {{ label }}
      <span v-if="required" class="ml-0.5 text-rose-500">*</span>
    </label>

    <div class="relative">
      <!-- Select Button/Input -->
      <button
        ref="triggerRef"
        type="button"
        :id="selectId"
        :disabled="disabled"
        :aria-invalid="errorMessage ? 'true' : undefined"
        :aria-describedby="describedById"
        :aria-expanded="isOpen"
        :aria-haspopup="true"
        class="relative w-full cursor-pointer rounded-md border border-slate-300 bg-white py-2 pl-3 pr-10 text-left text-sm shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-60"
        :class="[
          errorMessage ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/40' : '',
        ]"
        @click="toggleDropdown"
        @keydown="handleTriggerKeydown"
      >
        <!-- Display Value -->
        <span
          v-if="displayValue"
          class="block truncate text-slate-900"
        >
          {{ displayValue }}
        </span>
        <span
          v-else
          class="block truncate text-slate-400"
        >
          {{ placeholder || 'Select an option...' }}
        </span>

        <!-- Dropdown Arrow -->
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg
            class="h-5 w-5 text-slate-400 transition-transform"
            :class="{ 'rotate-180': isOpen }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      </button>

      <!-- Dropdown -->
      <div
        v-if="isOpen"
        ref="dropdownRef"
        class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
      >
        <!-- Search Input -->
        <div v-if="searchable" class="p-2">
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Search options..."
            @keydown="handleSearchKeydown"
          />
        </div>

        <!-- Options List -->
        <div
          v-if="filteredOptions.length > 0"
          role="listbox"
          :aria-multiselectable="multiple"
        >
          <div
            v-for="(option, index) in filteredOptions"
            :key="getOptionKey(option)"
            :ref="(el) => setOptionRef(el, index)"
            role="option"
            :aria-selected="isOptionSelected(option)"
            class="relative cursor-pointer select-none py-2 pl-3 pr-9 transition hover:bg-slate-50"
            :class="[
              isOptionSelected(option) ? 'bg-indigo-50 text-indigo-900' : 'text-slate-900',
              highlightedIndex === index ? 'bg-slate-100' : '',
            ]"
            @click="selectOption(option)"
            @mouseenter="highlightedIndex = index"
          >
            <!-- Option Label -->
            <div class="flex items-center">
              <span
                class="block truncate"
                :class="[
                  isOptionSelected(option) ? 'font-medium' : 'font-normal',
                ]"
              >
                {{ getOptionLabel(option) }}
              </span>
            </div>

            <!-- Selected Indicator -->
            <span
              v-if="isOptionSelected(option)"
              class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </div>
        </div>

        <!-- No Options Message -->
        <div
          v-else
          class="relative cursor-default select-none py-2 px-3 text-slate-500"
        >
          {{ searchQuery ? 'No options found' : 'No options available' }}
        </div>
      </div>
    </div>

    <!-- Selected Items (Multi-select) -->
    <div
      v-if="multiple && selectedOptions.length > 0"
      class="flex flex-wrap gap-1"
    >
      <span
        v-for="option in selectedOptions"
        :key="getOptionKey(option)"
        class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700"
      >
        {{ getOptionLabel(option) }}
        <button
          type="button"
          class="inline-flex h-4 w-4 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
          @click="removeOption(option)"
        >
          <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </span>
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

interface SelectOption<T = any> {
  label: string
  value: T
  disabled?: boolean
  [key: string]: any
}

type FormValues<TForm extends UseFormReturn<any>> = TForm extends UseFormReturn<infer TValues>
  ? TValues extends Record<string, any>
    ? TValues
    : Record<string, any>
  : Record<string, any>

type FormSelectProps<
  TForm extends UseFormReturn<any> = UseFormReturn<any>,
> = {
  form: TForm
  name: FieldPath<FormValues<TForm>>
  label?: string
  description?: string
  error?: string | null
  options: readonly SelectOption[] | SelectOption[]
  placeholder?: string
  id?: string
  required?: boolean
  disabled?: boolean
  multiple?: boolean
  searchable?: boolean
  registerOptions?: RegisterFieldOptions<any, FormValues<TForm>>
}

const props = withDefaults(defineProps<FormSelectProps>(), {
  options: () => [],
  multiple: false,
  searchable: true,
})

const isOpen = ref(false)
const searchQuery = ref('')
const highlightedIndex = ref(-1)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()
const searchInputRef = ref<HTMLInputElement>()
const optionRefs = ref<(HTMLElement | null)[]>([])

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

const selectId = computed(() => props.id ?? `field-${binding.value.name.replace(/\W+/g, '-')}`)
const describedById = computed(() =>
  props.description ? `${selectId.value}-description` : undefined,
)

const errorMessage = computed(
  () => props.error ?? props.form.errors[binding.value.name] ?? null,
)

const currentValue = computed(() => binding.value.modelValue)

const selectedOptions = computed(() => {
  if (!currentValue.value) return []
  
  if (props.multiple) {
    const values = Array.isArray(currentValue.value) ? currentValue.value : []
    return props.options.filter(option => values.includes(option.value))
  } else {
    return props.options.filter(option => option.value === currentValue.value)
  }
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    option.label.toLowerCase().includes(query)
  )
})

const displayValue = computed(() => {
  if (!currentValue.value) return ''
  
  if (props.multiple) {
    const count = selectedOptions.value.length
    if (count === 0) return ''
    if (count === 1) return selectedOptions.value[0]?.label || ''
    return `${count} options selected`
  } else {
    const option = selectedOptions.value[0]
    return option ? option.label : ''
  }
})

function setOptionRef(el: any, index: number) {
  if (el) {
    optionRefs.value[index] = el as HTMLElement
  }
}

function getOptionKey(option: SelectOption) {
  return typeof option.value === 'object' ? JSON.stringify(option.value) : String(option.value)
}

function getOptionLabel(option: SelectOption) {
  return option.label
}

function isOptionSelected(option: SelectOption) {
  if (props.multiple) {
    const values = Array.isArray(currentValue.value) ? currentValue.value : []
    return values.includes(option.value)
  } else {
    return currentValue.value === option.value
  }
}

function selectOption(option: SelectOption) {
  if (option.disabled) return

  if (props.multiple) {
    const values = Array.isArray(currentValue.value) ? [...currentValue.value] : []
    const index = values.indexOf(option.value)
    
    if (index > -1) {
      values.splice(index, 1)
    } else {
      values.push(option.value)
    }
    
    binding.value.modelValue = values
  } else {
    binding.value.modelValue = option.value
    closeDropdown()
  }
}

function removeOption(option: SelectOption) {
  if (!props.multiple) return
  
  const values = Array.isArray(currentValue.value) ? [...currentValue.value] : []
  const index = values.indexOf(option.value)
  
  if (index > -1) {
    values.splice(index, 1)
    binding.value.modelValue = values
  }
}

function toggleDropdown() {
  if (props.disabled) return
  
  if (isOpen.value) {
    closeDropdown()
  } else {
    openDropdown()
  }
}

async function openDropdown() {
  isOpen.value = true
  highlightedIndex.value = -1
  searchQuery.value = ''
  
  await nextTick()
  
  if (props.searchable && searchInputRef.value) {
    searchInputRef.value.focus()
  }
}

function closeDropdown() {
  isOpen.value = false
  highlightedIndex.value = -1
  searchQuery.value = ''
  
  if (triggerRef.value) {
    triggerRef.value.focus()
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  if (props.disabled) return

  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
    case 'ArrowUp':
      event.preventDefault()
      openDropdown()
      break
    case 'Escape':
      closeDropdown()
      break
  }
}

function handleSearchKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, filteredOptions.value.length - 1)
      scrollToOption(highlightedIndex.value)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
      if (highlightedIndex.value >= 0) {
        scrollToOption(highlightedIndex.value)
      }
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
        const option = filteredOptions.value[highlightedIndex.value]
        if (option) {
          selectOption(option)
        }
      }
      break
    case 'Escape':
      closeDropdown()
      break
  }
}

function scrollToOption(index: number) {
  const option = optionRefs.value[index]
  if (option && dropdownRef.value) {
    option.scrollIntoView({ block: 'nearest' })
  }
}

function handleClickOutside(event: Event) {
  if (!triggerRef.value || !dropdownRef.value) return
  
  const target = event.target as Node
  if (
    !triggerRef.value.contains(target) &&
    !dropdownRef.value.contains(target)
  ) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>