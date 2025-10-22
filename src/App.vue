<script setup lang="ts">
import { computed, ref } from 'vue'
import { z } from 'zod'
import FormCheckbox from './components/form/FormCheckbox.vue'
import FormInput from './components/form/FormInput.vue'
import FormRadioGroup from './components/form/FormRadioGroup.vue'
import FormTextarea from './components/form/FormTextarea.vue'
import { useFieldArray } from './composables/useFieldArray'
import { useForm } from './composables/useForm'

const contactOptions = [
  {
    label: 'Email',
    value: 'email',
    description: 'We will reach out via the email you provide above.',
  },
  {
    label: 'Phone',
    value: 'phone',
    description: 'We will follow up with a quick call to your phone number.',
  },
] as const satisfies Array<{ label: string; value: 'email' | 'phone'; description: string }>

const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  country: z.string().min(1, 'Country is required'),
})

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Email must be valid'),
  age: z.number().min(18, 'You must be at least 18 years old').nullable(),
  bio: z.string().min(10, 'Tell us a little more (min. 10 characters)'),
})

const preferencesSchema = z.object({
  contactMethod: z.enum(['email', 'phone']),
  newsletter: z.boolean(),
})

const profileFormSchema = z.object({
  profile: profileSchema,
  preferences: preferencesSchema,
  addresses: z
    .array(addressSchema)
    .min(1, 'Add at least one address'),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

const createEmptyAddress = (): ProfileFormValues['addresses'][number] => ({
  street: '',
  city: '',
  country: '',
})

const defaultValues: ProfileFormValues = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    age: null,
    bio: '',
  },
  preferences: {
    contactMethod: 'email',
    newsletter: true,
  },
  addresses: [createEmptyAddress()],
}

const form = useForm<ProfileFormValues>({
  mode: 'onBlur',
  schema: profileFormSchema,
  defaultValues,
})

const {
  fields: addressFields,
  append: appendAddress,
  remove: removeAddress,
  move: moveAddress,
} = useFieldArray({
  form,
  name: 'addresses',
})

const addressesError = computed(() => form.errors['addresses'])

const submitted = ref<ProfileFormValues | null>(null)

const submitForm = form.handleSubmit(async (values) => {
  submitted.value = values
})

const resetForm = () => {
  submitted.value = null
  form.reset()
}

const isSubmitting = computed(() => form.formState.value.isSubmitting)
const isDirty = computed(() => form.formState.value.isDirty)

const addAddress = () => {
  void appendAddress(createEmptyAddress())
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 py-12">
    <main class="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 lg:flex-row">
      <section class="flex-1">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 lg:p-10"
        >
          <header class="space-y-2">
            <p class="text-xs uppercase tracking-[0.3em] text-indigo-500">Demo</p>
            <h1 class="text-3xl font-semibold text-slate-900 lg:text-4xl">
              Profile form
            </h1>
            <p class="max-w-2xl text-sm text-slate-500">
              Composable-powered form utilities inspired by react-hook-form, ready to handle
              complex schemas without external libraries.
            </p>
          </header>

          <form class="mt-10 space-y-12" @submit.prevent="submitForm">
            <section class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900">Basics</h2>
                <span class="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Step 1 of 3
                </span>
              </div>
              <div class="grid gap-6 md:grid-cols-2">
                <FormInput
                  :form="form"
                  name="profile.firstName"
                  label="First name"
                  placeholder="Ada"
                  required
                />
                <FormInput
                  :form="form"
                  name="profile.lastName"
                  label="Last name"
                  placeholder="Lovelace"
                  required
                />
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <FormInput
                  :form="form"
                  name="profile.email"
                  type="email"
                  label="Email"
                  placeholder="ada@example.com"
                  required
                />
                <FormInput
                  :form="form"
                  name="profile.age"
                  type="number"
                  label="Age"
                  placeholder="18"
                  description="Optional — used to tailor future recommendations."
                />
              </div>

              <FormTextarea
                :form="form"
                name="profile.bio"
                label="Short bio"
                placeholder="Tell us about your current role, interests, or goals."
                description="Give the community a sense of who you are — minimum of 10 characters."
                required
              />
            </section>

            <section class="space-y-6">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-slate-900">Preferences</h2>
                <span class="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Step 2 of 3
                </span>
              </div>

              <FormRadioGroup
                :form="form"
                name="preferences.contactMethod"
                label="How should we reach you?"
                description="Choose the channel you prefer for follow-ups and updates."
                :options="contactOptions"
                inline
              />

              <FormCheckbox
                :form="form"
                name="preferences.newsletter"
                label="Subscribe to product updates"
                description="Get occasional emails about new features and beta programs."
              />
            </section>

            <section class="space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="text-lg font-semibold text-slate-900">Addresses</h2>
                  <p class="text-sm text-slate-500">
                    Use the controls below to add, remove, or reorder addresses you want to keep on
                    file.
                  </p>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
                  @click="addAddress"
                >
                  <span class="-mt-[1px] text-lg leading-none">＋</span>
                  Add address
                </button>
              </div>

              <p v-if="addressesError" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
                {{ addressesError }}
              </p>

              <div v-if="addressFields.length" class="space-y-4">
                <div
                  v-for="(address, index) in addressFields"
                  :key="address.id"
                  class="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm"
                >
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <h3 class="text-base font-semibold text-slate-900">
                      Address {{ index + 1 }}
                    </h3>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="index === 0"
                        @click="moveAddress(index, index - 1)"
                        aria-label="Move address up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
                        :disabled="index === addressFields.length - 1"
                        @click="moveAddress(index, index + 1)"
                        aria-label="Move address down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        class="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:ring-offset-2"
                        @click="removeAddress(index)"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div class="mt-6 grid gap-6 md:grid-cols-3">
                    <FormInput
                      :form="form"
                      :name="`addresses.${index}.street`"
                      label="Street"
                      placeholder="221B Baker Street"
                      required
                    />
                    <FormInput
                      :form="form"
                      :name="`addresses.${index}.city`"
                      label="City"
                      placeholder="London"
                      required
                    />
                    <FormInput
                      :form="form"
                      :name="`addresses.${index}.country`"
                      label="Country"
                      placeholder="United Kingdom"
                      required
                    />
                  </div>
                </div>
              </div>

              <p v-else class="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
                No addresses yet. Add one to keep track of where we can find you.
              </p>
            </section>

            <footer class="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:bg-indigo-300"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting">Submitting…</span>
                <span v-else>Submit form</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isSubmitting || !isDirty"
                @click="resetForm"
              >
                Reset
              </button>
              <span
                v-if="form.formState.value.submitCount"
                class="text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Submitted {{ form.formState.value.submitCount }} times
              </span>
            </footer>
          </form>
        </div>
      </section>

      <aside class="lg:w-96">
        <div class="space-y-6">
          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <header class="space-y-2">
              <h2 class="text-lg font-semibold text-slate-900">Live values</h2>
              <p class="text-sm text-slate-500">
                Form state updates reactively as you interact.
              </p>
            </header>
            <pre
              class="mt-4 max-h-80 overflow-y-auto rounded-2xl bg-slate-900/95 px-4 py-3 text-xs leading-relaxed text-slate-100 shadow-inner"
            >{{ JSON.stringify(form.values, null, 2) }}</pre>
          </section>

          <section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50">
            <header class="space-y-2">
              <h2 class="text-lg font-semibold text-slate-900">Latest submission</h2>
              <p class="text-sm text-slate-500">
                Results are cleared when you reset the form.
              </p>
            </header>
            <pre
              v-if="submitted"
              class="mt-4 max-h-80 overflow-y-auto rounded-2xl bg-emerald-950/95 px-4 py-3 text-xs leading-relaxed text-emerald-100 shadow-inner"
            >{{ JSON.stringify(submitted, null, 2) }}</pre>
            <p v-else class="mt-4 text-sm text-slate-500">
              No submission yet. Fill out the form and hit submit to preview the payload.
            </p>
          </section>
        </div>
      </aside>
    </main>
  </div>
</template>
