import { computed, onBeforeUnmount, ref, watch, type ComputedRef } from 'vue'
import type { SetValueOptions, UseFormReturn } from './useForm'

interface FieldArrayEntry<TItem> {
  id: string
  value: TItem
  index: number
}

type FieldArrayField<TItem> = FieldArrayEntry<TItem> & Record<string, any>

type JoinPath<Prefix extends string, Key extends string> = Prefix extends ''
  ? Key
  : `${Prefix}.${Key}`

type ArrayFieldPathInternal<T, Prefix extends string = ''> = {
  [K in keyof T & string]:
    T[K] extends ReadonlyArray<any> | Array<any>
      ? JoinPath<Prefix, K>
      : T[K] extends Record<string, any>
        ? ArrayFieldPathInternal<T[K], JoinPath<Prefix, K>>
        : never
}[keyof T & string]

type ArrayFieldPath<T> = Extract<ArrayFieldPathInternal<T>, string> extends infer P
  ? [P] extends [never]
    ? string
    : Extract<P, string>
  : string

export interface UseFieldArrayOptions<TValues extends Record<string, any>> {
  form: UseFormReturn<TValues>
  name: ArrayFieldPath<TValues>
  keyName?: string
}

type FieldArrayUpdateOptions = Partial<SetValueOptions>

export interface UseFieldArrayReturn<TItem> {
  fields: ComputedRef<FieldArrayField<TItem>[]>
  total: ComputedRef<number>
  append: (value: TItem, options?: FieldArrayUpdateOptions) => Promise<void>
  prepend: (value: TItem, options?: FieldArrayUpdateOptions) => Promise<void>
  insert: (index: number, value: TItem, options?: FieldArrayUpdateOptions) => Promise<void>
  remove: (index: number | number[]) => Promise<void>
  swap: (a: number, b: number) => Promise<void>
  move: (from: number, to: number) => Promise<void>
  replace: (values: TItem[], options?: FieldArrayUpdateOptions) => Promise<void>
  update: (index: number, value: Partial<TItem>, options?: FieldArrayUpdateOptions) => Promise<void>
  clear: () => Promise<void>
}

export function useFieldArray<
  TValues extends Record<string, any>,
  TItem = any,
>(options: UseFieldArrayOptions<TValues>): UseFieldArrayReturn<TItem> {
  const { form, name, keyName = 'id' } = options
  const control = form.control

  control.ensureFieldState(name)

  const entries = ref<FieldArrayEntry<TItem>[]>([])
  const idPrefix = `${name}-`
  let idCounter = 0

  const createId = () => `${idPrefix}${idCounter++}`

  function getCurrentArray(): TItem[] {
    const current = control.getValue(name)
    if (Array.isArray(current)) {
      return current as TItem[]
    }
    return []
  }

  function buildEntries(array: TItem[]): FieldArrayEntry<TItem>[] {
    return array.map((value, index) => {
      const existing = entries.value[index]
      const id = existing?.id ?? createId()
      return {
        id,
        value,
        index,
      }
    })
  }

  function syncFromValues() {
    const array = getCurrentArray()
    entries.value = buildEntries(array)
  }

  async function commitArray(nextArray: TItem[], options?: FieldArrayUpdateOptions) {
    const payload = nextArray.slice()
    await control.setValue(name, payload, {
      shouldDirty: options?.shouldDirty ?? true,
      shouldTouch: options?.shouldTouch ?? true,
      shouldValidate: options?.shouldValidate ?? false,
    })
    entries.value = buildEntries(payload)
  }

  async function append(value: TItem, options?: FieldArrayUpdateOptions) {
    const current = getCurrentArray()
    const next = [...current, cloneValue(value)]
    await commitArray(next, options)
  }

  async function prepend(value: TItem, options?: FieldArrayUpdateOptions) {
    await insert(0, value, options)
  }

  async function insert(index: number, value: TItem, options?: FieldArrayUpdateOptions) {
    const current = getCurrentArray()
    const next = [...current]
    next.splice(index, 0, cloneValue(value))
    await commitArray(next, options)
  }

  async function remove(index: number | number[]) {
    const current = getCurrentArray()
    const indexes = Array.isArray(index) ? [...index] : [index]
    const sorted = Array.from(new Set(indexes)).sort((a, b) => b - a)
    const next = [...current]
    sorted.forEach((idx) => {
      if (idx >= 0 && idx < next.length) {
        next.splice(idx, 1)
      }
    })
    await commitArray(next, { shouldValidate: true })
  }

  async function swap(a: number, b: number) {
    if (a === b) {
      return
    }
    const current = getCurrentArray()
    if (!isValidIndex(current, a) || !isValidIndex(current, b)) {
      return
    }
    const next = [...current]
    const temp = next[a]!
    next[a] = next[b]!
    next[b] = temp
    await commitArray(next)
  }

  async function move(from: number, to: number) {
    const current = getCurrentArray()
    if (!isValidIndex(current, from) || !isValidIndex(current, to)) {
      return
    }
    const next = [...current]
    const [item] = next.splice(from, 1)
    if (item === undefined) {
      return
    }
    next.splice(to, 0, item)
    await commitArray(next)
  }

  async function replace(values: TItem[], options?: FieldArrayUpdateOptions) {
    const next = values.map((item) => cloneValue(item))
    await commitArray(next, options)
  }

  async function update(index: number, value: Partial<TItem>, options?: FieldArrayUpdateOptions) {
    const current = getCurrentArray()
    if (!isValidIndex(current, index)) {
      return
    }
    const next = [...current]
    const currentItem = next[index]!
    if (isPlainObject(currentItem) && isPlainObject(value)) {
      next[index] = {
        ...(currentItem as any),
        ...value,
      }
    } else {
      next[index] = cloneValue(value as unknown as TItem)
    }
    await commitArray(next, options)
  }

  async function clear() {
    await commitArray([])
  }

  const stopWatch = watch(
    () => control.getValue(name),
    () => {
      syncFromValues()
    },
    { deep: true },
  )

  const unsubscribeReset = control.subscribe('reset', () => {
    idCounter = 0
    syncFromValues()
  })

  syncFromValues()

  onBeforeUnmount(() => {
    stopWatch()
    unsubscribeReset()
  })

  const fields = computed<FieldArrayField<TItem>[]>(() => {
    return entries.value.map((entry) => {
      return {
        ...entry,
        [keyName]: entry.id,
      } as FieldArrayField<TItem>
    })
  })

  const total = computed(() => fields.value.length)

  return {
    fields,
    total,
    append,
    prepend,
    insert,
    remove,
    swap,
    move,
    replace,
    update,
    clear,
  }
}

function cloneValue<T>(value: T): T {
  const structured = (globalThis as any).structuredClone
  if (typeof structured === 'function') {
    return structured(value)
  }
  return JSON.parse(JSON.stringify(value)) as T
}

function isValidIndex(array: any[], index: number) {
  return index >= 0 && index < array.length
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === '[object Object]'
}
