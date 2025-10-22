<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFieldArray } from './composables/useFieldArray'
import { useForm, type Validator } from './composables/useForm'

interface Address {
  street: string
  city: string
  country: string
}

interface ProfileFormValues {
  profile: {
    firstName: string
    lastName: string
    email: string
    age: number | null
  }
  addresses: Address[]
}

const required =
  (message: string): Validator<string | number | null, ProfileFormValues> =>
  (value) =>
    value !== undefined && value !== null && value !== '' ? true : message

const email = (message: string): Validator<string, ProfileFormValues> => (value) =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) ? true : message

const adult = (message: string): Validator<number | null, ProfileFormValues> => (value) =>
  value === null || Number(value) >= 18 ? true : message

const form = useForm<ProfileFormValues>({
  mode: 'onBlur',
  schema: {
    'profile.firstName': {
      defaultValue: '',
      validate: required('First name is required'),
    },
    'profile.lastName': {
      defaultValue: '',
      validate: required('Last name is required'),
    },
    'profile.email': {
      defaultValue: '',
      validate: [required('Email is required'), email('Email must be valid')],
    },
    'profile.age': {
      defaultValue: null,
      validate: adult('You must be at least 18 years old'),
    },
    addresses: {
      defaultValue: [
        {
          street: '',
          city: '',
          country: '',
        },
      ],
    },
  },
})

const {
  fields: addressFields,
  append: appendAddress,
  remove: removeAddress,
  move: moveAddress,
} = useFieldArray<ProfileFormValues, ProfileFormValues['addresses'][number]>({
  form,
  name: 'addresses',
})

const submitted = ref<ProfileFormValues | null>(null)

const submitForm = form.handleSubmit(async (values) => {
  submitted.value = values
})

const resetForm = () => {
  submitted.value = null
  form.reset()
}

const formErrors = computed(() => form.formState.value.errors)
const isSubmitting = computed(() => form.formState.value.isSubmitting)
const isDirty = computed(() => form.formState.value.isDirty)
</script>

<template>
  <main class="page">
    <section class="panel">
      <header class="panel__header">
        <h1>Profile form</h1>
        <p>Composable-powered form utilities inspired by react-hook-form.</p>
      </header>

      <form class="form" @submit.prevent="submitForm">
        <div class="grid two-col">
          <div class="field">
            <label for="first-name">First name</label>
            <input id="first-name" type="text" placeholder="Ada" v-bind="form.register('profile.firstName')" />
            <p v-if="formErrors['profile.firstName']" class="field__error">
              {{ formErrors['profile.firstName'] }}
            </p>
          </div>

          <div class="field">
            <label for="last-name">Last name</label>
            <input id="last-name" type="text" placeholder="Lovelace" v-bind="form.register('profile.lastName')" />
            <p v-if="formErrors['profile.lastName']" class="field__error">
              {{ formErrors['profile.lastName'] }}
            </p>
          </div>
        </div>

        <div class="grid two-col">
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" placeholder="ada@example.com" v-bind="form.register('profile.email')" />
            <p v-if="formErrors['profile.email']" class="field__error">
              {{ formErrors['profile.email'] }}
            </p>
          </div>

          <div class="field">
            <label for="age">Age</label>
            <input id="age" type="number" min="0" v-bind="form.register('profile.age')" />
            <p v-if="formErrors['profile.age']" class="field__error">
              {{ formErrors['profile.age'] }}
            </p>
          </div>
        </div>

        <section class="field-array">
          <header class="field-array__header">
            <h2>Addresses</h2>
            <button
              type="button"
              class="btn btn--secondary"
              @click="appendAddress({ street: '', city: '', country: '' })"
            >
              Add address
            </button>
          </header>

          <p class="field-array__hint">
            Use the buttons to add, remove, or re-order addresses with the <code>useFieldArray</code> helper.
          </p>

          <div
            v-for="(address, index) in addressFields"
            :key="address.id"
            class="field-array__item"
          >
            <div class="field-array__item-header">
              <h3>Address {{ index + 1 }}</h3>
              <div class="field-array__actions">
                <button
                  type="button"
                  class="btn btn--icon"
                  :disabled="index === 0"
                  @click="moveAddress(index, index - 1)"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="btn btn--icon"
                  :disabled="index === addressFields.length - 1"
                  @click="moveAddress(index, index + 1)"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  class="btn btn--danger"
                  @click="removeAddress(index)"
                  title="Remove address"
                >
                  Remove
                </button>
              </div>
            </div>

            <div class="grid three-col field-array__grid">
              <div class="field">
                <label :for="`street-${address.id}`">Street</label>
                <input
                  :id="`street-${address.id}`"
                  type="text"
                  placeholder="221B Baker Street"
                  v-bind="form.register(`addresses.${index}.street`, {
                    validate: required('Street is required'),
                  })"
                />
                <p v-if="formErrors[`addresses.${index}.street`]" class="field__error">
                  {{ formErrors[`addresses.${index}.street`] }}
                </p>
              </div>

              <div class="field">
                <label :for="`city-${address.id}`">City</label>
                <input
                  :id="`city-${address.id}`"
                  type="text"
                  placeholder="London"
                  v-bind="form.register(`addresses.${index}.city`, {
                    validate: required('City is required'),
                  })"
                />
                <p v-if="formErrors[`addresses.${index}.city`]" class="field__error">
                  {{ formErrors[`addresses.${index}.city`] }}
                </p>
              </div>

              <div class="field">
                <label :for="`country-${address.id}`">Country</label>
                <input
                  :id="`country-${address.id}`"
                  type="text"
                  placeholder="United Kingdom"
                  v-bind="form.register(`addresses.${index}.country`, {
                    validate: required('Country is required'),
                  })"
                />
                <p v-if="formErrors[`addresses.${index}.country`]" class="field__error">
                  {{ formErrors[`addresses.${index}.country`] }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer class="form__footer">
          <button type="submit" class="btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'Submitting…' : 'Submit' }}
          </button>
          <button type="button" class="btn btn--secondary" :disabled="isSubmitting || !isDirty" @click="resetForm">
            Reset
          </button>
        </footer>
      </form>
    </section>

    <aside class="panel">
      <header class="panel__header">
        <h2>Live values</h2>
        <p>Form state updates reactively as you interact with the form.</p>
      </header>
      <pre class="pre">{{ JSON.stringify(form.values, null, 2) }}</pre>

      <header class="panel__header">
        <h2>Latest submission</h2>
      </header>
      <pre v-if="submitted" class="pre">{{ JSON.stringify(submitted, null, 2) }}</pre>
      <p v-else class="empty-state">No submission yet.</p>
    </aside>
  </main>
</template>

<style scoped>
.page {
  display: grid;
  gap: 2.5rem;
  padding: 2.5rem 1.5rem 4rem;
  max-width: 1200px;
  margin: 0 auto;
}

.panel {
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
  padding: 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel__header h1,
.panel__header h2 {
  margin: 0 0 0.25rem;
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f172a;
}

.panel__header p {
  margin: 0;
  color: #475569;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid.two-col {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

.grid.three-col {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field label {
  font-weight: 500;
  color: #0f172a;
}

.field input {
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  height: 2.6rem;
  padding: 0 0.75rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field input:focus {
  border-color: #6366f1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.field__error {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0;
}

.field-array {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-array__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.field-array__header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #0f172a;
}

.field-array__hint {
  margin: -0.5rem 0 0;
  color: #64748b;
  font-size: 0.9rem;
}

.field-array__item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-array__item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.field-array__item-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.field-array__actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.field-array__grid {
  margin-top: 0.5rem;
}

.form__footer {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  background: #6366f1;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 0.65rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn--secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn--danger {
  background: #dc2626;
  color: #ffffff;
}

.btn--icon {
  background: #e2e8f0;
  color: #1e293b;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  padding: 0;
}

.panel .pre {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 10px;
  padding: 1.25rem;
  font-size: 0.9rem;
  overflow-x: auto;
  max-height: 320px;
}

.empty-state {
  margin: 0;
  color: #94a3b8;
}

@media (min-width: 960px) {
  .page {
    grid-template-columns: 3fr 2fr;
  }
}
</style>
