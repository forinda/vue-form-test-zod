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
} from "vue";
import type { ZodType } from "zod";
import z from "zod";

type MaybePromise<T> = T | Promise<T>;
type PathSegment = string | number;
type Keys<T> = Extract<keyof T, string>;
type ZodIssue = z.core.$ZodIssue;
type Decrement = [0, 0, 1, 2, 3, 4, 5, 6];

type DotPrefix<T extends string> = T extends "" ? "" : `.${T}`;

type FieldPathWithDepth<T, Depth extends number> = [Depth] extends [0]
  ? never
  : T extends ReadonlyArray<infer U>
  ? FieldPathWithDepth<U, Decrement[Depth]> extends infer P
    ? P extends string
      ? `${number}` | `${number}${DotPrefix<P>}`
      : `${number}`
    : `${number}`
  : T extends Record<string, any>
  ? {
      [K in Keys<T>]:
        | `${K}`
        | (FieldPathWithDepth<T[K], Decrement[Depth]> extends infer P
            ? P extends string
              ? `${K}${DotPrefix<P>}`
              : never
            : never);
    }[Keys<T>]
  : never;

export type FieldPath<TValues> = FieldPathWithDepth<TValues, 5>;

type FieldArrayPathInternal<T, Prefix extends string, Depth extends number> = [
  Depth
] extends [0]
  ? never
  : T extends ReadonlyArray<infer U>
  ? Prefix extends ""
    ? FieldArrayPathInternal<U, `${number}`, Decrement[Depth]>
    :
        | Prefix
        | FieldArrayPathInternal<U, `${Prefix}.${number}`, Decrement[Depth]>
  : T extends Record<string, any>
  ? {
      [K in Keys<T>]: FieldArrayPathInternal<
        T[K],
        Prefix extends "" ? `${K}` : `${Prefix}.${K}`,
        Decrement[Depth]
      >;
    }[Keys<T>]
  : never;

export type FieldArrayPath<TValues> = Extract<
  FieldArrayPathInternal<TValues, "", 5>,
  string
>;

type SplitPath<Path extends string> = Path extends `${infer Head}.${infer Rest}`
  ? [Head, ...SplitPath<Rest>]
  : Path extends ""
  ? []
  : [Path];

type PathValue<T, Parts extends readonly string[]> = Parts extends [
  infer Head extends string,
  ...infer Rest extends string[]
]
  ? Head extends `${number}`
    ? T extends ReadonlyArray<infer U>
      ? PathValue<U, Rest>
      : never
    : Head extends keyof T
    ? PathValue<T[Head], Rest>
    : never
  : T;

export type FieldPathValue<
  TValues,
  Path extends FieldPath<TValues>
> = PathValue<TValues, SplitPath<Path>>;

export type FieldArrayElement<
  TValues extends Record<string, any>,
  Path extends FieldArrayPath<TValues>
> = FieldPathValue<TValues, Extract<`${Path}.${number}`, FieldPath<TValues>>>;

const modeToTriggerMap = {
  onSubmit: "submit",
  onBlur: "blur",
  onChange: "change",
} as const;

type ValidationMode = keyof typeof modeToTriggerMap;
export type ValidationTrigger = (typeof modeToTriggerMap)[ValidationMode];

export interface ValidationContext<TValues extends Record<string, any>> {
  name: string;
  values: TValues;
}

export type Validator<TFieldValue, TValues extends Record<string, any>> = (
  value: TFieldValue,
  context: ValidationContext<TValues>
) => MaybePromise<true | string | null | undefined | false>;

export interface UseFormOptions<TValues extends Record<string, any>> {
  defaultValues?: Partial<TValues>;
  schema?: ZodType<TValues, any, any>;
  mode?: ValidationMode;
}

export interface RegisterFieldOptions<
  TFieldValue = any,
  TValues extends Record<string, any> = Record<string, any>
> {
  defaultValue?: TFieldValue;
  validate?:
    | Validator<TFieldValue, TValues>
    | Array<Validator<TFieldValue, TValues>>;
  validateOn?: ValidationTrigger;
  parse?: (
    input: any,
    context: { name: string; values: TValues }
  ) => TFieldValue;
  valueProp?: "value" | "checked";
  trueValue?: any;
  falseValue?: any;
  defaultError?: string;
}

export interface SetValueOptions {
  shouldDirty?: boolean;
  shouldTouch?: boolean;
  shouldValidate?: boolean;
}

export interface FieldState {
  touched: boolean;
  dirty: boolean;
  error: string | null;
  isValidating: boolean;
  validators: Array<Validator<any, any>>;
  validateOn: ValidationTrigger;
}

export interface FormState {
  isDirty: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  submitCount: number;
  dirtyFields: Record<string, boolean>;
  touchedFields: Record<string, boolean>;
  errors: Record<string, string>;
}

export interface RegisteredFieldBinding {
  name: string;
  value: WritableComputedRef<any>;
  modelValue: WritableComputedRef<any>;
  "onUpdate:modelValue": (value: any) => void;
  onInput: (event: any) => void;
  onChange: (event: any) => void;
  onBlur: () => void;
  [key: string]: any;
}

type FormEventName = "values:change" | "reset";

interface FieldConfig {
  validators: Array<Validator<any, any>>;
  validateOn: ValidationTrigger;
  parse?: (
    input: any,
    context: { name: string; values: Record<string, any> }
  ) => any;
  valueProp: "value" | "checked";
  trueValue?: any;
  falseValue?: any;
  defaultError: string;
}

export interface FormControl<TValues extends Record<string, any>> {
  values: TValues;
  defaultValues: Ref<TValues>;
  getValue: <Name extends FieldPath<TValues>>(
    name: Name
  ) => FieldPathValue<TValues, Name>;
  setValue: <Name extends FieldPath<TValues>>(
    name: Name,
    value: FieldPathValue<TValues, Name>,
    options?: SetValueOptions
  ) => Promise<void>;
  ensureFieldState: (name: FieldPath<TValues>) => FieldState;
  subscribe: (
    event: FormEventName,
    listener: (payload?: any) => void
  ) => () => void;
}

export interface UseFormReturn<TValues extends Record<string, any>> {
  values: TValues;
  defaultValues: Ref<TValues>;
  fieldStates: Record<string, FieldState>;
  errors: Record<string, string | null>;
  register: <Name extends FieldPath<TValues>>(
    name: Name,
    options?: RegisterFieldOptions<FieldPathValue<TValues, Name>, TValues>
  ) => RegisteredFieldBinding;
  unregister: (
    name: FieldPath<TValues>,
    opts?: { keepState?: boolean; keepValue?: boolean }
  ) => void;
  setValue: <Name extends FieldPath<TValues>>(
    name: Name,
    value: FieldPathValue<TValues, Name>,
    options?: SetValueOptions
  ) => Promise<void>;
  getValue: <Name extends FieldPath<TValues>>(
    name: Name
  ) => FieldPathValue<TValues, Name>;
  getValues: () => TValues;
  reset: (values?: Partial<TValues>) => void;
  clearErrors: (name?: FieldPath<TValues> | FieldPath<TValues>[]) => void;
  setError: (name: FieldPath<TValues>, error: string) => void;
  validate: (
    name?: FieldPath<TValues> | FieldPath<TValues>[]
  ) => Promise<boolean>;
  handleSubmit: (
    onValid: SubmitHandler<TValues>,
    onInvalid?: InvalidSubmitHandler<TValues>
  ) => (event?: Event) => Promise<void>;
  watch: WatchValues<TValues>;
  formState: ComputedRef<FormState>;
  control: FormControl<TValues>;
}

export type SubmitHandler<TValues extends Record<string, any>> = (
  values: TValues,
  context: { event?: Event }
) => MaybePromise<void>;

export type InvalidSubmitHandler<TValues extends Record<string, any>> = (
  errors: Record<string, string>,
  context: { event?: Event; values: TValues }
) => MaybePromise<void>;

type WatchAllCallback<TValues extends Record<string, any>> = (
  values: TValues
) => void;
type WatchFieldCallback<
  TValues extends Record<string, any>,
  Name extends FieldPath<TValues> = FieldPath<TValues>
> = (value: FieldPathValue<TValues, Name>, values: TValues) => void;
type WatchFieldsCallback<TValues extends Record<string, any>> = (
  values: any[],
  formValues: TValues
) => void;

export interface WatchValues<TValues extends Record<string, any>> {
  (callback: WatchAllCallback<TValues>): WatchStopHandle;
  (
    name: FieldPath<TValues>,
    callback: WatchFieldCallback<TValues>
  ): WatchStopHandle;
  (
    names: FieldPath<TValues>[],
    callback: WatchFieldsCallback<TValues>
  ): WatchStopHandle;
}

export function useForm<
  TValues extends Record<string, any> = Record<string, any>
>(options: UseFormOptions<TValues> = {}): UseFormReturn<TValues> {
  const mode: ValidationMode = options.mode ?? "onSubmit";
  const defaultTrigger: ValidationTrigger = modeToTriggerMap[mode];
  const schema = options.schema;

  const preparedInitialValues = prepareInitialValues<TValues>(
    options.defaultValues,
    schema
  );

  const values = reactive(deepClone(preparedInitialValues)) as TValues;
  const defaultValues = ref(deepClone(preparedInitialValues)) as Ref<TValues>;

  const fieldStates = reactive<Record<string, FieldState>>({});
  const fieldConfigs = new Map<string, FieldConfig>();
  const fieldRegistry = new Map<string, RegisteredFieldBinding>();
  const fieldValidationCounters = new Map<string, number>();

  const errors = reactive<Record<string, string | null>>({});
  const isSubmitting = ref(false);
  const submitCount = ref(0);

  const listeners: Record<FormEventName, Set<(payload?: any) => void>> = {
    "values:change": new Set(),
    reset: new Set(),
  };

  const formState = computed<FormState>(() => {
    const dirtyFields: Record<string, boolean> = {};
    const touchedFields: Record<string, boolean> = {};
    const errorBag: Record<string, string> = {};

    for (const [name, state] of Object.entries(fieldStates)) {
      dirtyFields[name] = state.dirty;
      touchedFields[name] = state.touched;
      if (state.error) {
        errorBag[name] = state.error;
      }
    }

    const isValidating = Object.values(fieldStates).some(
      (state) => state.isValidating
    );

    return {
      isDirty: Object.values(dirtyFields).some(Boolean),
      isValid: Object.keys(errorBag).length === 0,
      isSubmitting: isSubmitting.value,
      isValidating,
      submitCount: submitCount.value,
      dirtyFields,
      touchedFields,
      errors: errorBag,
    };
  });

  async function setValueInternal(
    name: string,
    value: any,
    options: SetValueOptions = {}
  ): Promise<void> {
    const segments = parsePath(name);
    const config = ensureFieldConfig(name);
    const state = ensureFieldStateInternal(name);

    const shouldDirty =
      options.shouldDirty !== undefined
        ? options.shouldDirty
        : !isDeepEqual(value, getDeepValue(defaultValues.value, segments)) ||
          state.dirty;

    const shouldTouch =
      options.shouldTouch !== undefined ? options.shouldTouch : false;
    const shouldValidate =
      options.shouldValidate !== undefined
        ? options.shouldValidate
        : config.validateOn === "change" ||
          (config.validateOn === "submit" && defaultTrigger === "change");

    setDeepValue(values, segments, value);

    state.dirty = shouldDirty;
    if (shouldTouch) {
      state.touched = true;
    }

    emit("values:change", { name });

    if (shouldValidate) {
      await validateField(name);
    }
  }

  const setValue = async <Name extends FieldPath<TValues>>(
    name: Name,
    value: FieldPathValue<TValues, Name>,
    options: SetValueOptions = {}
  ): Promise<void> => {
    await setValueInternal(name, value, options);
  };

  const getValue = <Name extends FieldPath<TValues>>(
    name: Name
  ): FieldPathValue<TValues, Name> => {
    return getDeepValue(values, name) as FieldPathValue<TValues, Name>;
  };

  function getValues(): TValues {
    return deepClone(toRaw(values));
  }

  function register<Name extends FieldPath<TValues>>(
    name: Name,
    options: RegisterFieldOptions<FieldPathValue<TValues, Name>, TValues> = {}
  ): RegisteredFieldBinding {
    const segments = parsePath(name);

    const defaultValue =
      options.defaultValue ?? getDeepValue(defaultValues.value, segments);
    if (
      getDeepValue(values, segments) === undefined &&
      defaultValue !== undefined
    ) {
      setDeepValue(values, segments, deepClone(defaultValue));
    }

    const config = ensureFieldConfig(name);
    const state = ensureFieldStateInternal(name);

    const validators = normalizeValidators(options.validate);
    if (validators.length) {
      config.validators = validators;
      state.validators = validators;
    }

    config.validateOn = options.validateOn ?? config.validateOn;
    state.validateOn = config.validateOn;
    config.parse = options.parse as FieldConfig["parse"];
    config.valueProp = options.valueProp ?? config.valueProp;
    if (options.trueValue !== undefined) {
      config.trueValue = options.trueValue;
    }
    if (options.falseValue !== undefined) {
      config.falseValue = options.falseValue;
    }
    if (options.defaultError) {
      config.defaultError = options.defaultError;
    }

    let binding = fieldRegistry.get(name);
    if (!binding) {
      const model = computed({
        get: () => getDeepValue(values, segments),
        set: (newValue: any) => {
          void setValue(name, newValue, {
            shouldDirty: true,
            shouldTouch: false,
            shouldValidate:
              config.validateOn === "change" ||
              (config.validateOn === "submit" && defaultTrigger === "change"),
          });
        },
      });

      const handleChange = (eventOrValue: any) => {
        const resolved = resolveInputValue(eventOrValue, {
          config,
          fieldName: name,
          values,
          currentValue: model.value,
        });
        model.value = resolved;
      };

      const handleBlur = () => {
        state.touched = true;
        if (config.validateOn === "blur" || defaultTrigger === "blur") {
          void validateField(name);
        }
      };

      binding = reactive({
        name,
        value: model,
        modelValue: model,
        "onUpdate:modelValue": (value: any) => {
          model.value = value;
        },
        onInput: handleChange,
        onChange: handleChange,
        onBlur: handleBlur,
      }) as RegisteredFieldBinding;

      if (config.valueProp === "checked") {
        Object.defineProperty(binding, "checked", {
          enumerable: true,
          configurable: true,
          get: () => Boolean(model.value),
          set: (next) => {
            model.value = next;
          },
        });
      }

      fieldRegistry.set(name, binding);
    }

    return binding;
  }

  function unregister(
    name: FieldPath<TValues>,
    opts?: { keepState?: boolean; keepValue?: boolean }
  ) {
    const options = opts ?? {};

    if (!options.keepValue) {
      unsetDeepValue(values, name);
    }

    if (!options.keepState) {
      fieldRegistry.delete(name);
      fieldConfigs.delete(name);
      fieldValidationCounters.delete(name);
      if (fieldStates[name]) {
        Reflect.deleteProperty(fieldStates, name);
      }
      if (errors[name]) {
        Reflect.deleteProperty(errors, name);
      }
    }
  }

  function clearErrors(name?: FieldPath<TValues> | FieldPath<TValues>[]) {
    if (!name) {
      Object.keys(errors).forEach((field) => {
        errors[field] = null;
        if (fieldStates[field]) {
          fieldStates[field].error = null;
        }
      });
      return;
    }

    const fields = Array.isArray(name) ? name : [name];
    fields.forEach((field) => {
      if (errors[field]) {
        errors[field] = null;
      }
      if (fieldStates[field]) {
        fieldStates[field].error = null;
      }
    });
  }

  function setError(name: FieldPath<TValues>, error: string) {
    const state = ensureFieldStateInternal(name);
    state.error = error;
    errors[name] = error;
  }

  async function validateField(
    name: string,
    schemaIssues?: ZodIssue[]
  ): Promise<boolean> {
    const state = ensureFieldStateInternal(name);
    const config = ensureFieldConfig(name);
    const validators = state.validators;

    state.isValidating = true;
    const counter = (fieldValidationCounters.get(name) ?? 0) + 1;
    fieldValidationCounters.set(name, counter);

    try {
      const value = getDeepValue(values, name);
      const context: ValidationContext<TValues> = {
        name,
        values,
      };

      for (const validator of validators) {
        const result = await validator(value, context);
        const message = normalizeValidationResult(result, config.defaultError);
        if (fieldValidationCounters.get(name) !== counter) {
          return false;
        }
        if (message) {
          state.error = message;
          errors[name] = message;
          return false;
        }
      }

      if (schema) {
        const issues = schemaIssues ?? collectSchemaIssues();
        const schemaMessage = pickSchemaError(issues, parsePath(name));
        if (fieldValidationCounters.get(name) !== counter) {
          return false;
        }
        if (schemaMessage) {
          state.error = schemaMessage;
          errors[name] = schemaMessage;
          return false;
        }
      }

      state.error = null;
      errors[name] = null;
      return true;
    } finally {
      if (fieldValidationCounters.get(name) === counter) {
        state.isValidating = false;
      }
    }
  }

  async function validate(
    name?: FieldPath<TValues> | FieldPath<TValues>[]
  ): Promise<boolean> {
    // In submit mode, if no paths are provided, validate all fields
    // If paths are provided, validate only those specific paths
    const fieldsToValidate: string[] = name
      ? Array.isArray(name)
        ? [...new Set(name)]
        : [name]
      : mode === "onSubmit"
      ? Array.from(new Set(Object.keys(fieldStates)))
      : Array.from(new Set(Object.keys(fieldStates)));

    let schemaIssues: ZodIssue[] | undefined;
    if (schema) {
      schemaIssues = collectSchemaIssues();
      const issuePaths = schemaIssues
        .map((issue) => issuePathToName(issue.path as PathSegment[]))
        .filter((pathName): pathName is string => Boolean(pathName));

      // When validating specific fields, only include schema issues for those specific fields
      issuePaths.forEach((pathName) => {
        ensureFieldStateInternal(pathName);
        // Only add schema issue paths if:
        // 1. We're validating all fields (no name provided), OR
        // 2. The schema issue path is in our list of fields to validate
        if (!name || fieldsToValidate.includes(pathName)) {
          if (!fieldsToValidate.includes(pathName)) {
            fieldsToValidate.push(pathName);
          }
        }
      });
      
      // Filter schema issues to only include those for fields we're validating
      if (name) {
        schemaIssues = schemaIssues.filter((issue) => {
          const pathName = issuePathToName(issue.path as PathSegment[]);
          return pathName && fieldsToValidate.includes(pathName);
        });
      }
    }

    const results = await Promise.all(
      fieldsToValidate.map((fieldName) =>
        validateField(fieldName, schemaIssues)
      )
    );

    if (schema && schemaIssues) {
      applySchemaIssues(schemaIssues);
    }

    return results.every(Boolean);
  }

  function reset(valuesToSet?: Partial<TValues>) {
    // If no values are provided, use the original default values
    // Otherwise, merge the provided values with the original defaults
    const nextValues = valuesToSet 
      ? prepareInitialValues<TValues>(valuesToSet, schema)
      : deepClone(defaultValues.value);
    
    replaceReactiveValues(values, nextValues);

    Object.values(fieldStates).forEach((state) => {
      state.dirty = false;
      state.touched = false;
      state.error = null;
      state.isValidating = false;
    });

    Object.keys(errors).forEach((field) => {
      errors[field] = null;
    });

    emit("reset");
    emit("values:change");
  }

  function watchValuesImpl(
    arg0: FieldPath<TValues> | FieldPath<TValues>[] | WatchAllCallback<TValues>,
    arg1?: WatchFieldCallback<TValues> | WatchFieldsCallback<TValues>
  ): WatchStopHandle {
    if (typeof arg0 === "function") {
      return watch(
        () => values,
        () => {
          arg0(deepClone(toRaw(values)));
        },
        { deep: true }
      );
    }

    if (Array.isArray(arg0)) {
      return watch(
        () => arg0.map((field) => getDeepValue(values, field)),
        (newValues) => {
          if (typeof arg1 === "function") {
            (arg1 as WatchFieldsCallback<TValues>)(
              deepClone(newValues),
              deepClone(toRaw(values))
            );
          }
        },
        { deep: true }
      );
    }

    return watch(
      () => getDeepValue(values, arg0),
      (newValue) => {
        if (typeof arg1 === "function") {
          (arg1 as WatchFieldCallback<TValues>)(
            deepClone(newValue),
            deepClone(toRaw(values))
          );
        }
      },
      { deep: true }
    );
  }

  const watchValuesInterface = ((arg0: any, arg1: any) =>
    watchValuesImpl(arg0, arg1)) as WatchValues<TValues>;

  function handleSubmit(
    onValid: SubmitHandler<TValues>,
    onInvalid?: InvalidSubmitHandler<TValues>
  ) {
    return async (event?: Event) => {
      event?.preventDefault();
      submitCount.value += 1;
      isSubmitting.value = true;

      try {
        const isFormValid = await validate();
        if (isFormValid) {
          await onValid(deepClone(toRaw(values)), { event });
        } else if (onInvalid) {
          const errorBag = Object.entries(fieldStates).reduce<
            Record<string, string>
          >((acc, [fieldName, state]) => {
            if (state.error) {
              acc[fieldName] = state.error;
            }
            return acc;
          }, {});
          await onInvalid(errorBag, {
            event,
            values: deepClone(toRaw(values)),
          });
        }
      } finally {
        isSubmitting.value = false;
      }
    };
  }

  function ensureFieldStateInternal(name: string): FieldState {
    if (!fieldStates[name]) {
      fieldStates[name] = reactive<FieldState>({
        touched: false,
        dirty: false,
        error: null,
        isValidating: false,
        validators: [],
        validateOn: defaultTrigger,
      });
    }
    return fieldStates[name];
  }

  const ensureFieldState = (name: FieldPath<TValues>): FieldState =>
    ensureFieldStateInternal(name);

  function ensureFieldConfig(name: string): FieldConfig {
    if (!fieldConfigs.has(name)) {
      fieldConfigs.set(name, {
        validators: [],
        validateOn: defaultTrigger,
        valueProp: "value",
        defaultError: "Invalid value",
      });
    }
    return fieldConfigs.get(name)!;
  }

  function emit(event: FormEventName, payload?: any) {
    listeners[event].forEach((listener) => listener(payload));
  }

  function subscribe(event: FormEventName, listener: (payload?: any) => void) {
    listeners[event].add(listener);
    return () => {
      listeners[event].delete(listener);
    };
  }

  const control: FormControl<TValues> = {
    values,
    defaultValues,
    getValue,
    setValue,
    ensureFieldState,
    subscribe,
  };

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
  };

  function collectSchemaIssues():ZodIssue[] {
    if (!schema) {
      return [];
    }
    const result = schema.safeParse(deepClone(toRaw(values)));
    if (result.success) {
      return [];
    }
    return result.error.issues;
  }

  function applySchemaIssues(issues: ZodIssue[]) {
    const seen = new Set<string>();

    issues.forEach((issue) => {
      const name = issuePathToName(issue.path as PathSegment[]);
      if (!name) {
        return;
      }
      seen.add(name);
      const state = ensureFieldStateInternal(name);
      state.error = issue.message;
      errors[name] = issue.message;
    });

    Object.entries(fieldStates).forEach(([name, state]) => {
      if (!seen.has(name) && state.validators.length === 0) {
        if (errors[name] && !state.error) {
          errors[name] = null;
        }
      }
    });
  }
}

function normalizeValidators(
  validators?: Validator<any, any> | Array<Validator<any, any>>
): Array<Validator<any, any>> {
  if (!validators) {
    return [];
  }
  return Array.isArray(validators) ? validators : [validators];
}

function parsePath(path: string): PathSegment[] {
  const sanitized = path.replace(/\[(\w+)\]/g, ".$1").replace(/^\./, "");
  if (!sanitized) {
    return [];
  }
  return sanitized.split(".").map((segment) => {
    if (/^\d+$/.test(segment)) {
      return Number(segment);
    }
    return segment;
  });
}

function pathSegmentsToString(segments: PathSegment[]): string {
  if (!segments.length) {
    return "";
  }
  return segments
    .map((segment) => (typeof segment === "number" ? String(segment) : segment))
    .join(".");
}

function getDeepValue(target: any, path: string | PathSegment[]): any {
  if (target == null) {
    return undefined;
  }
  const segments = Array.isArray(path) ? path : parsePath(path);
  return segments.reduce((acc, key) => {
    if (acc == null) {
      return undefined;
    }
    return acc[key];
  }, target);
}

function setDeepValue(
  target: any,
  path: string | PathSegment[],
  value: any
): void {
  const segments = Array.isArray(path) ? path : parsePath(path);
  if (!segments.length) {
    return;
  }
  let cursor = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!;
    if ((cursor as any)[segment] == null) {
      const nextSegment = segments[i + 1];
      (cursor as any)[segment] = typeof nextSegment === "number" ? [] : {};
    }
    cursor = (cursor as any)[segment];
  }
  const lastSegment = segments[segments.length - 1]!;
  (cursor as any)[lastSegment] = value;
}

function unsetDeepValue(target: any, path: string | PathSegment[]): void {
  const segments = Array.isArray(path) ? path : parsePath(path);
  if (!segments.length) {
    return;
  }
  let cursor = target;
  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i]!;
    if ((cursor as any)[segment] == null) {
      return;
    }
    cursor = (cursor as any)[segment];
  }
  if (Array.isArray(cursor)) {
    const index = segments[segments.length - 1] as number | undefined;
    if (typeof index === "number") {
      cursor.splice(index, 1);
    }
  } else {
    const lastSegment = segments[segments.length - 1];
    if (lastSegment !== undefined) {
      Reflect.deleteProperty(cursor, lastSegment);
    }
  }
}

function deepClone<T>(value: T): T {
  const structured = (globalThis as any).structuredClone;
  if (typeof structured === "function") {
    try {
      return structured(value);
    } catch {
      // Fall back to JSON serialization if structuredClone fails
      // This handles cases where objects contain non-cloneable properties
    }
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return Object.prototype.toString.call(value) === "[object Object]";
}

function isDeepEqual(a: any, b: any): boolean {
  if (a === b) {
    return true;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => isDeepEqual(item, b[index]));
  }

  if (isPlainObject(a) && isPlainObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    return keysA.every((key) => isDeepEqual(a[key], b[key]));
  }

  return false;
}

function replaceReactiveValues(target: any, source: any) {
  if (Array.isArray(target) && Array.isArray(source)) {
    target.splice(0, target.length, ...source);
    return;
  }

  Object.keys(target).forEach((key) => {
    if (!(key in source)) {
      Reflect.deleteProperty(target, key);
    }
  });

  Object.entries(source).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (!Array.isArray(target[key])) {
        target[key] = [];
      }
      replaceReactiveValues(target[key], value);
    } else if (isPlainObject(value)) {
      if (!isPlainObject(target[key])) {
        target[key] = {};
      }
      replaceReactiveValues(target[key], value);
    } else {
      target[key] = value;
    }
  });
}

function prepareInitialValues<TValues extends Record<string, any>>(
  baseValues: Partial<TValues> | undefined,
  schema?: ZodType<TValues, any, any>
): TValues {
  const fallback = deepClone((baseValues ?? {}) as TValues);

  if (!schema) {
    return fallback;
  }

  if (baseValues) {
    const parsed = schema.safeParse(baseValues);
    if (parsed.success) {
      return deepClone(parsed.data);
    }
  }

  const emptyAttempt = schema.safeParse({});
  if (emptyAttempt.success) {
    return deepClone(emptyAttempt.data);
  }

  return fallback;
}

function normalizeValidationResult(
  result: any,
  fallbackMessage: string
): string | null {
  if (result === undefined || result === null || result === true) {
    return null;
  }
  if (result === false) {
    return fallbackMessage;
  }
  if (Array.isArray(result)) {
    const messages = result.filter(Boolean).map(String);
    return messages.length ? messages.join("\n") : null;
  }
  return String(result);
}

function resolveInputValue(
  eventOrValue: any,
  options: {
    config: FieldConfig;
    fieldName: string;
    values: Record<string, any>;
    currentValue: any;
  }
) {
  const { config, fieldName, values, currentValue } = options;

  if (config.parse) {
    return config.parse(eventOrValue, { name: fieldName, values });
  }

  if (
    eventOrValue &&
    typeof eventOrValue === "object" &&
    "target" in eventOrValue &&
    eventOrValue.target
  ) {
    const target = eventOrValue.target as HTMLInputElement;
    if (config.valueProp === "checked" || target.type === "checkbox") {
      const checked = Boolean(target.checked);
      if (config.trueValue !== undefined || config.falseValue !== undefined) {
        return checked ? config.trueValue : config.falseValue;
      }
      return checked;
    }
    if (target.type === "number") {
      return target.value === "" ? null : Number(target.value);
    }
    return target.value;
  }

  return eventOrValue ?? currentValue;
}

function issuePathToName(path: PathSegment[]): string | null {
  const name = pathSegmentsToString(path);
  return name || null;
}

function pathsAreEqual(a: PathSegment[], b: PathSegment[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function pickSchemaError(
  issues: ZodIssue[],
  targetSegments: PathSegment[]
): string | null {
  for (const issue of issues) {
    const issueSegments = issue.path as PathSegment[];
    if (pathsAreEqual(issueSegments, targetSegments)) {
      return issue.message;
    }
  }
  return null;
}
