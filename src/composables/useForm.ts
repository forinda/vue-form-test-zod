import {
  computed,
  reactive,
  ref,
  toRaw,
  watch,
  type ComputedRef,
  type Ref,
  type WatchStopHandle,
  type WritableComputedRef,
} from 'vue'

type MaybePromise<T> = T | Promise<T>
type PathSegment = string | number

const modeToTriggerMap = {
  onSubmit: 'submit',
  onBlur: 'blur',
  onChange: 'change',
} as const

type ValidationMode = keyof typeof modeToTriggerMap
export type ValidationTrigger = (typeof modeToTriggerMap)[ValidationMode]

export interface ValidationContext<TValues extends Record<string, any>> {
  name: string
  values: TValues
}

export type Validator<TFieldValue, TValues extends Record<string, any>> = (
  value: TFieldValue,
  context: ValidationContext<TValues>,
) => MaybePromise<true | string | null | undefined | false>

export interface FieldDefinition<
  TFieldValue = any,
  TValues extends Record<string, any> = Record<string, any>,
> {
  defaultValue?: TFieldValue
  validate?: Validator<TFieldValue, TValues> | Array<Validator<TFieldValue, TValues>>
  validateOn?: ValidationTrigger
}

export type FormSchema<TValues extends Record<string, any>> = Record<
  string,
  FieldDefinition<any, TValues>
>

export interface UseFormOptions<TValues extends Record<string, any>> {
  defaultValues?: Partial<TValues>
  schema?: FormSchema<TValues>
  mode?: ValidationMode
}

export interface RegisterFieldOptions<
  TFieldValue = any,
  TValues extends Record<string, any> = Record<string, any>,
> extends Omit<FieldDefinition<TFieldValue, TValues>, 'defaultValue'> {
  defaultValue?: TFieldValue
  parse?: (input: any, context: { name: string; values: TValues }) => TFieldValue
  valueProp?: 'value' | 'checked'
  trueValue?: any
  falseValue?: any
}

export interface SetValueOptions {
  shouldDirty?: boolean
  shouldTouch?: boolean
  shouldValidate?: boolean
}

export interface FieldState {
  touched: boolean
  dirty: boolean
  error: string | null
  isValidating: boolean
  validators: Array<Validator<any, any>>
  validateOn: ValidationTrigger
}

export interface FormState {
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
  isValidating: boolean
  submitCount: number
  dirtyFields: Record<string, boolean>
  touchedFields: Record<string, boolean>
  errors: Record<string, string>
}

export interface RegisteredFieldBinding {
  name: string
  value: WritableComputedRef<any>
  modelValue: WritableComputedRef<any>
  'onUpdate:modelValue': (value: any) => void
  onInput: (event: any) => void
  onChange: (event: any) => void
  onBlur: () => void
  [key: string]: any
}

type FormEventName = 'values:change' | 'reset'

interface FieldConfig {
  validators: Array<Validator<any, any>>
  validateOn: ValidationTrigger
  parse?: (input: any, context: { name: string; values: Record<string, any> }) => any
  valueProp: 'value' | 'checked'
  trueValue?: any
  falseValue?: any
  defaultError: string
}

export interface FormControl<TValues extends Record<string, any>> {
  values: TValues
  defaultValues: Ref<TValues>
  getValue: (name: string) => any
  setValue: (name: string, value: any, options?: SetValueOptions) => Promise<void>
  ensureFieldState: (name: string) => FieldState
  subscribe: (event: FormEventName, listener: (payload?: any) => void) => () => void
}

export interface UseFormReturn<TValues extends Record<string, any>> {
  values: TValues
  defaultValues: Ref<TValues>
  fieldStates: Record<string, FieldState>
  errors: Record<string, string | null>
  register: (name: string, options?: RegisterFieldOptions<any, TValues>) => RegisteredFieldBinding
  unregister: (name: string, opts?: { keepState?: boolean; keepValue?: boolean }) => void
  setValue: (name: string, value: any, options?: SetValueOptions) => Promise<void>
  getValue: (name: string) => any
  getValues: () => TValues
  reset: (values?: Partial<TValues>) => void
  clearErrors: (name?: string | string[]) => void
  setError: (name: string, error: string) => void
  validate: (name?: string | string[]) => Promise<boolean>
  handleSubmit: (
    onValid: SubmitHandler<TValues>,
    onInvalid?: InvalidSubmitHandler<TValues>,
  ) => (event?: Event) => Promise<void>
  watch: WatchValues<TValues>
  formState: ComputedRef<FormState>
  control: FormControl<TValues>
}

export type SubmitHandler<TValues extends Record<string, any>> = (
  values: TValues,
  context: { event?: Event },
) => MaybePromise<void>

export type InvalidSubmitHandler<TValues extends Record<string, any>> = (
  errors: Record<string, string>,
  context: { event?: Event; values: TValues },
) => MaybePromise<void>

type WatchAllCallback<TValues extends Record<string, any>> = (values: TValues) => void
type WatchFieldCallback<TValues extends Record<string, any>> = (
  value: any,
  values: TValues,
) => void
type WatchFieldsCallback<TValues extends Record<string, any>> = (
  values: any[],
  formValues: TValues,
) => void

export interface WatchValues<TValues extends Record<string, any>> {
  (callback: WatchAllCallback<TValues>): WatchStopHandle
  (name: string, callback: WatchFieldCallback<TValues>): WatchStopHandle
  (names: string[], callback: WatchFieldsCallback<TValues>): WatchStopHandle
}

export function useForm<TValues extends Record<string, any> = Record<string, any>>(
  options: UseFormOptions<TValues> = {},
): UseFormReturn<TValues> {
  const mode: ValidationMode = options.mode ?? 'onSubmit'
  const defaultTrigger: ValidationTrigger = modeToTriggerMap[mode]

  const schema = options.schema ?? {}
  const preparedInitialValues = prepareInitialValues(
    (options.defaultValues ?? {}) as TValues,
    schema,
  )

  const values = reactive(deepClone(preparedInitialValues)) as TValues
  const defaultValues = ref(deepClone(preparedInitialValues)) as Ref<TValues>

  const fieldStates = reactive<Record<string, FieldState>>({})
  const fieldConfigs = new Map<string, FieldConfig>()
  const fieldRegistry = new Map<string, RegisteredFieldBinding>()
  const fieldValidationCounters = new Map<string, number>()

  const errors = reactive<Record<string, string | null>>({})
  const isSubmitting = ref(false)
  const submitCount = ref(0)

  const listeners: Record<FormEventName, Set<(payload?: any) => void>> = {
    'values:change': new Set(),
    reset: new Set(),
  }

  Object.entries(schema).forEach(([name, definition]) => {
    const state = ensureFieldState(name)
    const config = ensureFieldConfig(name)
    const validators = normalizeValidators(definition.validate)
    if (validators.length) {
      config.validators = validators
      state.validators = validators
    }
    config.validateOn = definition.validateOn ?? config.validateOn
    state.validateOn = config.validateOn
  })

  const formState = computed<FormState>(() => {
    const dirtyFields: Record<string, boolean> = {}
    const touchedFields: Record<string, boolean> = {}
    const errorBag: Record<string, string> = {}

    for (const [name, state] of Object.entries(fieldStates)) {
      dirtyFields[name] = state.dirty
      touchedFields[name] = state.touched
      if (state.error) {
        errorBag[name] = state.error
      }
    }

    const isValidating = Object.values(fieldStates).some((state) => state.isValidating)

    return {
      isDirty: Object.values(dirtyFields).some(Boolean),
      isValid: Object.keys(errorBag).length === 0,
      isSubmitting: isSubmitting.value,
      isValidating,
      submitCount: submitCount.value,
      dirtyFields,
      touchedFields,
      errors: errorBag,
    }
  })

  async function setValue(name: string, value: any, options: SetValueOptions = {}): Promise<void> {
    const segments = parsePath(name)
    const config = ensureFieldConfig(name)
    const state = ensureFieldState(name)

    const shouldDirty =
      options.shouldDirty !== undefined
        ? options.shouldDirty
        : !isDeepEqual(value, getDeepValue(defaultValues.value, segments)) || state.dirty

    const shouldTouch = options.shouldTouch !== undefined ? options.shouldTouch : false
    const shouldValidate =
      options.shouldValidate !== undefined
        ? options.shouldValidate
        : config.validateOn === 'change' ||
          (config.validateOn === 'submit' && defaultTrigger === 'change')

    setDeepValue(values, segments, value)

    state.dirty = shouldDirty
    if (shouldTouch) {
      state.touched = true
    }

    emit('values:change', { name })

    if (shouldValidate) {
      await validateField(name)
    }
  }

  function getValue(name: string): any {
    return getDeepValue(values, name)
  }

  function getValues(): TValues {
    return deepClone(toRaw(values))
  }

  function register(
    name: string,
    options: RegisterFieldOptions<any, TValues> = {},
  ): RegisteredFieldBinding {
    const segments = parsePath(name)
    const schemaDefinition = schema[name]

    const defaultValue =
      options.defaultValue ?? schemaDefinition?.defaultValue ?? getDeepValue(defaultValues.value, segments)
    if (getDeepValue(values, segments) === undefined && defaultValue !== undefined) {
      setDeepValue(values, segments, deepClone(defaultValue))
    }

    const config = ensureFieldConfig(name)
    const state = ensureFieldState(name)

    const validators = [
      ...normalizeValidators(schemaDefinition?.validate),
      ...normalizeValidators(options.validate),
    ]

    if (validators.length) {
      config.validators = validators
      state.validators = validators
    }

    config.validateOn = options.validateOn ?? schemaDefinition?.validateOn ?? config.validateOn
    state.validateOn = config.validateOn
    config.parse = options.parse as FieldConfig['parse']
    config.valueProp = options.valueProp ?? config.valueProp
    if (options.trueValue !== undefined) {
      config.trueValue = options.trueValue
    }
    if (options.falseValue !== undefined) {
      config.falseValue = options.falseValue
    }

    let binding = fieldRegistry.get(name)
    if (!binding) {
      const model = computed({
        get: () => getDeepValue(values, segments),
        set: (newValue: any) => {
          void setValue(name, newValue, {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate:
              config.validateOn === 'change' ||
              (config.validateOn === 'submit' && defaultTrigger === 'change'),
          })
        },
      })

      const handleChange = (eventOrValue: any) => {
        const resolved = resolveInputValue(eventOrValue, {
          config,
          fieldName: name,
          values,
          currentValue: model.value,
        })
        model.value = resolved
      }

      const handleBlur = () => {
        state.touched = true
        if (config.validateOn === 'blur' || defaultTrigger === 'blur') {
          void validateField(name)
        }
      }

      binding = reactive({
        name,
        value: model,
        modelValue: model,
        'onUpdate:modelValue': (value: any) => {
          model.value = value
        },
        onInput: handleChange,
        onChange: handleChange,
        onBlur: handleBlur,
      }) as RegisteredFieldBinding

      if (config.valueProp === 'checked') {
        Object.defineProperty(binding, 'checked', {
          enumerable: true,
          configurable: true,
          get: () => Boolean(model.value),
          set: (next) => {
            model.value = next
          },
        })
      }

      fieldRegistry.set(name, binding)
    }

    return binding
  }

  function unregister(name: string, opts?: { keepState?: boolean; keepValue?: boolean }) {
    const options = opts ?? {}

    if (!options.keepValue) {
      unsetDeepValue(values, name)
    }

    if (!options.keepState) {
      fieldRegistry.delete(name)
      fieldConfigs.delete(name)
      fieldValidationCounters.delete(name)
      if (fieldStates[name]) {
        Reflect.deleteProperty(fieldStates, name)
      }
      if (errors[name]) {
        Reflect.deleteProperty(errors, name)
      }
    }
  }

  function clearErrors(name?: string | string[]) {
    if (!name) {
      Object.keys(errors).forEach((field) => {
        errors[field] = null
        if (fieldStates[field]) {
          fieldStates[field].error = null
        }
      })
      return
    }

    const fields = Array.isArray(name) ? name : [name]
    fields.forEach((field) => {
      if (errors[field]) {
        errors[field] = null
      }
      if (fieldStates[field]) {
        fieldStates[field].error = null
      }
    })
  }

  function setError(name: string, error: string) {
    const state = ensureFieldState(name)
    state.error = error
    errors[name] = error
  }

  async function validateField(name: string): Promise<boolean> {
    const state = ensureFieldState(name)
    const config = ensureFieldConfig(name)
    const validators = state.validators

    if (!validators.length) {
      state.error = null
      errors[name] = null
      return true
    }

    state.isValidating = true
    const counter = (fieldValidationCounters.get(name) ?? 0) + 1
    fieldValidationCounters.set(name, counter)

    try {
      const value = getDeepValue(values, name)
      const context: ValidationContext<TValues> = {
        name,
        values,
      }

      for (const validator of validators) {
        const result = await validator(value, context)
        const message = normalizeValidationResult(result, config.defaultError)
        if (fieldValidationCounters.get(name) !== counter) {
          return false
        }
        if (message) {
          state.error = message
          errors[name] = message
          return false
        }
      }

      state.error = null
      errors[name] = null
      return true
    } finally {
      if (fieldValidationCounters.get(name) === counter) {
        state.isValidating = false
      }
    }
  }

  async function validate(name?: string | string[]): Promise<boolean> {
    const fieldsToValidate = name
      ? Array.isArray(name)
        ? name
        : [name]
      : Array.from(new Set([...Object.keys(fieldStates), ...Object.keys(schema)]))

    const results = await Promise.all(fieldsToValidate.map((fieldName) => validateField(fieldName)))
    return results.every(Boolean)
  }

  function reset(valuesToSet?: Partial<TValues>) {
    const nextValues = prepareInitialValues(
      (valuesToSet ?? defaultValues.value) as TValues,
      schema,
    )
    replaceReactiveValues(values, nextValues)
    defaultValues.value = deepClone(nextValues)

    Object.values(fieldStates).forEach((state) => {
      state.dirty = false
      state.touched = false
      state.error = null
      state.isValidating = false
    })

    Object.keys(errors).forEach((field) => {
      errors[field] = null
    })

    emit('reset')
    emit('values:change')
  }

  function watchValuesImpl(
    arg0: string | string[] | WatchAllCallback<TValues>,
    arg1?: WatchFieldCallback<TValues> | WatchFieldsCallback<TValues>,
  ): WatchStopHandle {
    if (typeof arg0 === 'function') {
      return watch(
        () => values,
        () => {
          arg0(deepClone(toRaw(values)))
        },
        { deep: true },
      )
    }

    if (Array.isArray(arg0)) {
      return watch(
        () => arg0.map((field) => getDeepValue(values, field)),
        (newValues) => {
          if (typeof arg1 === 'function') {
            ;(arg1 as WatchFieldsCallback<TValues>)(deepClone(newValues), deepClone(toRaw(values)))
          }
        },
        { deep: true },
      )
    }

    return watch(
      () => getDeepValue(values, arg0),
      (newValue) => {
        if (typeof arg1 === 'function') {
          ;(arg1 as WatchFieldCallback<TValues>)(deepClone(newValue), deepClone(toRaw(values)))
        }
      },
      { deep: true },
    )
  }

  const watchValuesInterface = ((arg0: any, arg1: any) =>
    watchValuesImpl(arg0, arg1)) as WatchValues<TValues>

  function handleSubmit(
    onValid: SubmitHandler<TValues>,
    onInvalid?: InvalidSubmitHandler<TValues>,
  ) {
    return async (event?: Event) => {
      event?.preventDefault()
      submitCount.value += 1
      isSubmitting.value = true

      try {
        const isFormValid = await validate()
        if (isFormValid) {
          await onValid(deepClone(toRaw(values)), { event })
        } else if (onInvalid) {
          const errorBag = Object.entries(fieldStates).reduce<Record<string, string>>((acc, [name, state]) => {
            if (state.error) {
              acc[name] = state.error
            }
            return acc
          }, {})
          await onInvalid(errorBag, { event, values: deepClone(toRaw(values)) })
        }
      } finally {
        isSubmitting.value = false
      }
    }
  }

  function ensureFieldState(name: string): FieldState {
    if (!fieldStates[name]) {
      fieldStates[name] = reactive<FieldState>({
        touched: false,
        dirty: false,
        error: null,
        isValidating: false,
        validators: [],
        validateOn: defaultTrigger,
      })
    }
    return fieldStates[name]
  }

  function ensureFieldConfig(name: string): FieldConfig {
    if (!fieldConfigs.has(name)) {
      fieldConfigs.set(name, {
        validators: [],
        validateOn: defaultTrigger,
        valueProp: 'value',
        defaultError: 'Invalid value',
      })
    }
    return fieldConfigs.get(name)!
  }

  function emit(event: FormEventName, payload?: any) {
    listeners[event].forEach((listener) => listener(payload))
  }

  function subscribe(event: FormEventName, listener: (payload?: any) => void) {
    listeners[event].add(listener)
    return () => {
      listeners[event].delete(listener)
    }
  }

  const control: FormControl<TValues> = {
    values,
    defaultValues,
    getValue,
    setValue,
    ensureFieldState,
    subscribe,
  }

  return {
    values,
    defaultValues,
    fieldStates,
    errors,
    register,
    unregister,
    setValue,
    getValue,
    getValues,
    reset,
    clearErrors,
    setError,
    validate,
    handleSubmit,
    watch: watchValuesInterface,
    formState,
    control,
  }
}

function normalizeValidators(
  validators?: Validator<any, any> | Array<Validator<any, any>>,
): Array<Validator<any, any>> {
  if (!validators) {
    return []
  }
  return Array.isArray(validators) ? validators : [validators]
}

function parsePath(path: string): PathSegment[] {
  const sanitized = path.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '')
  if (!sanitized) {
    return []
  }
  return sanitized.split('.').map((segment) => {
    if (/^\d+$/.test(segment)) {
      return Number(segment)
    }
    return segment
  })
}

function getDeepValue(target: any, path: string | PathSegment[]): any {
  if (target == null) {
    return undefined
  }
  const segments = Array.isArray(path) ? path : parsePath(path)
  return segments.reduce((acc, key) => {
    if (acc == null) {
      return undefined
    }
    return acc[key]
  }, target)
}

function setDeepValue(target: any, path: string | PathSegment[], value: any): void {
  const segments = Array.isArray(path) ? path : parsePath(path)
  if (!segments.length) {
    return
  }
  let cursor = target
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!
    if ((cursor as any)[segment] == null) {
      const nextSegment = segments[i + 1]
      ;(cursor as any)[segment] = typeof nextSegment === 'number' ? [] : {}
    }
    cursor = (cursor as any)[segment]
  }
  const lastSegment = segments[segments.length - 1]!
  ;(cursor as any)[lastSegment] = value
}

function unsetDeepValue(target: any, path: string | PathSegment[]): void {
  const segments = Array.isArray(path) ? path : parsePath(path)
  if (!segments.length) {
    return
  }
  let cursor = target
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!
    if ((cursor as any)[segment] == null) {
      return
    }
    cursor = (cursor as any)[segment]
  }
  if (Array.isArray(cursor)) {
    const index = segments[segments.length - 1] as number | undefined
    if (typeof index === 'number') {
      cursor.splice(index, 1)
    }
  } else {
    const lastSegment = segments[segments.length - 1]
    if (lastSegment !== undefined) {
      Reflect.deleteProperty(cursor, lastSegment)
    }
  }
}

function deepClone<T>(value: T): T {
  const structured = (globalThis as any).structuredClone
  if (typeof structured === 'function') {
    return structured(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}

function isDeepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true
  }

  if (typeof a !== typeof b) {
    return false
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false
    }
    return a.every((item, index) => isDeepEqual(item, b[index]))
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) {
      return false
    }
    return keysA.every((key) => isDeepEqual(a[key], b[key]))
  }

  return false
}

function replaceReactiveValues(target: any, source: any) {
  if (Array.isArray(target) && Array.isArray(source)) {
    target.splice(0, target.length, ...source)
    return
  }

  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      Reflect.deleteProperty(target, key)
    }
  })

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (!Array.isArray(target[key])) {
        target[key] = []
      }
      replaceReactiveValues(target[key], value)
    } else if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) {
        target[key] = {}
      }
      replaceReactiveValues(target[key], value)
    } else {
      target[key] = value
    }
  })
}

function prepareInitialValues<TValues extends Record<string, any>>(
  baseValues: TValues,
  schema: FormSchema<TValues>,
): TValues {
  const result = deepClone(baseValues)
  Object.entries(schema).forEach(([name, definition]) => {
    if (definition?.defaultValue !== undefined && getDeepValue(result, name) === undefined) {
      setDeepValue(result, name, deepClone(definition.defaultValue))
    }
  })
  return result
}

function normalizeValidationResult(result: any, fallbackMessage: string): string | null {
  if (result === undefined || result === null || result === true) {
    return null
  }
  if (result === false) {
    return fallbackMessage
  }
  if (Array.isArray(result)) {
    const messages = result.filter(Boolean).map(String)
    return messages.length ? messages.join('\n') : null
  }
  return String(result)
}

function resolveInputValue(
  eventOrValue: any,
  options: {
    config: FieldConfig
    fieldName: string
    values: Record<string, any>
    currentValue: any
  },
) {
  const { config, fieldName, values, currentValue } = options

  if (config.parse) {
    return config.parse(eventOrValue, { name: fieldName, values })
  }

  if (
    eventOrValue &&
    typeof eventOrValue === 'object' &&
    'target' in eventOrValue &&
    eventOrValue.target
  ) {
    const target = eventOrValue.target as HTMLInputElement
    if (config.valueProp === 'checked' || target.type === 'checkbox') {
      const checked = Boolean(target.checked)
      if (config.trueValue !== undefined || config.falseValue !== undefined) {
        return checked ? config.trueValue : config.falseValue
      }
      return checked
    }
    if (target.type === 'number') {
      return target.value === '' ? null : Number(target.value)
    }
    return target.value
  }

  return eventOrValue ?? currentValue
}
