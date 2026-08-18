<script setup lang="ts">
// #13 AC1/AC2/AC3/AC6: ユーザー登録画面。SignonView(認証情報入力)+AddressForm(氏名/連絡先/住所)を
// 下敷きにする。langpref/favcategoryの入力欄は持たない(E5・サーバ既定値/未設定で登録される)。
// 成功時は自動ログイン済みのためredirectクエリ(相対パスのみ許可)へ復帰する(AC2/SBD-4)。
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AddressForm from '@/components/checkout/AddressForm.vue'
import { useAuthStore } from '@/stores/auth'
import { sanitizeRedirectTarget } from '@/utils/redirectValidator'
import { emptyAddress, type Address } from '@/domain/checkout'
import { isValidEmail, isStrongPassword, ACCOUNT_FIELD_MAX_LENGTH } from '@/utils/accountValidation'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const repeatedPassword = ref('')
const address = ref(emptyAddress())

// #17 AC3: クライアント側のインライン検証(UX向上・backendの権威400がbackstop)。
// 空欄はネイティブrequired属性で防ぐため、各errorは値が入力済みの場合のみ表示する。
const passwordsMismatch = computed(
  () => repeatedPassword.value.length > 0 && password.value !== repeatedPassword.value,
)
const passwordWeak = computed(() => password.value.length > 0 && !isStrongPassword(password.value))
const usernameTooLong = computed(() => username.value.length > ACCOUNT_FIELD_MAX_LENGTH.username)

const addressFieldMaxLengths = {
  firstName: ACCOUNT_FIELD_MAX_LENGTH.firstName,
  lastName: ACCOUNT_FIELD_MAX_LENGTH.lastName,
  email: ACCOUNT_FIELD_MAX_LENGTH.email,
  phone: ACCOUNT_FIELD_MAX_LENGTH.phone,
  address1: ACCOUNT_FIELD_MAX_LENGTH.address1,
  address2: ACCOUNT_FIELD_MAX_LENGTH.address2,
  city: ACCOUNT_FIELD_MAX_LENGTH.city,
  state: ACCOUNT_FIELD_MAX_LENGTH.state,
  postalCode: ACCOUNT_FIELD_MAX_LENGTH.postalCode,
  country: ACCOUNT_FIELD_MAX_LENGTH.country,
} as const satisfies Partial<Record<keyof Address, number>>

const addressErrors = computed<Partial<Record<keyof Address, string>>>(() => {
  const errors: Partial<Record<keyof Address, string>> = {}
  const current = address.value
  if (current.email.length > 0 && !isValidEmail(current.email)) {
    errors.email = t('account.validation.emailInvalid')
  }
  for (const key of Object.keys(addressFieldMaxLengths) as (keyof Address)[]) {
    const value = current[key]
    const max = addressFieldMaxLengths[key]
    if (value.length > 0 && max !== undefined && value.length > max) {
      errors[key] = t('account.validation.tooLong')
    }
  }
  return errors
})

const hasClientValidationError = computed(
  () =>
    passwordsMismatch.value ||
    passwordWeak.value ||
    usernameTooLong.value ||
    Object.keys(addressErrors.value).length > 0,
)

const errorMessageKey = computed(() => {
  if (authStore.registerError === null) return null
  return `account.register.error.${authStore.registerError}`
})

async function handleSubmit() {
  if (hasClientValidationError.value) {
    return
  }
  const success = await authStore.register({
    ...address.value,
    username: username.value,
    password: password.value,
    repeatedPassword: repeatedPassword.value,
  })
  if (success) {
    router.push(sanitizeRedirectTarget(route.query.redirect))
  }
}
</script>

<template>
  <AppLayout>
    <div class="register">
      <form class="jps-card jps-card-pad register__form" @submit.prevent="handleSubmit">
        <h1 class="register__title">{{ t('account.register.title') }}</h1>

        <p v-if="errorMessageKey" class="jps-alert jps-alert-danger" role="alert">
          {{ t(errorMessageKey) }}
        </p>
        <p v-if="passwordsMismatch" class="jps-alert jps-alert-danger" role="alert">
          {{ t('account.register.passwordMismatch') }}
        </p>

        <div class="jps-field">
          <label class="jps-label jps-required" for="register-username">
            {{ t('account.register.usernameLabel') }}
          </label>
          <input
            id="register-username"
            v-model="username"
            name="username"
            type="text"
            class="jps-input"
            autocomplete="username"
            :maxlength="ACCOUNT_FIELD_MAX_LENGTH.username"
            :aria-invalid="usernameTooLong ? 'true' : undefined"
            required
          />
          <p v-if="usernameTooLong" class="jps-error-text">{{ t('account.validation.tooLong') }}</p>
        </div>

        <div class="jps-field">
          <label class="jps-label jps-required" for="register-password">
            {{ t('account.register.passwordLabel') }}
          </label>
          <input
            id="register-password"
            v-model="password"
            name="password"
            type="password"
            class="jps-input"
            autocomplete="new-password"
            :aria-invalid="passwordWeak ? 'true' : undefined"
            required
          />
          <p v-if="passwordWeak" class="jps-error-text">
            {{ t('account.validation.weakPassword') }}
          </p>
        </div>

        <div class="jps-field">
          <label class="jps-label jps-required" for="register-repeated-password">
            {{ t('account.register.repeatedPasswordLabel') }}
          </label>
          <input
            id="register-repeated-password"
            v-model="repeatedPassword"
            name="repeatedPassword"
            type="password"
            class="jps-input"
            autocomplete="new-password"
            :aria-invalid="passwordsMismatch ? 'true' : undefined"
            required
          />
        </div>

        <AddressForm
          v-model="address"
          id-prefix="register"
          :errors="addressErrors"
          :max-lengths="addressFieldMaxLengths"
        />

        <button
          type="submit"
          class="jps-btn jps-btn-primary jps-btn-block"
          :disabled="authStore.isRegistering"
        >
          {{
            authStore.isRegistering
              ? t('account.register.submitting')
              : t('account.register.submit')
          }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.register__form {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.register__title {
  font-size: 1.375rem;
}
</style>
