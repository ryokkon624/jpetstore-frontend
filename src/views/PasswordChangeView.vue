<script setup lang="ts">
// #15 AC1〜AC2: パスワード変更画面。requiresAuth(本人のみ・現在PW再認証必須)。
// 成功時はbackendが現在セッションのトークンをローテートする(Q3)ため、画面側は成功メッセージを表示し
// フォームをクリアするのみで、フロント側の再ログイン導線は不要(既存Cookieがそのまま有効なため)。
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'
import { useAccountStore } from '@/stores/account'
import { isStrongPassword } from '@/utils/accountValidation'

const { t } = useI18n()
const accountStore = useAccountStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')

// #17 AC3: クライアント側のインライン検証(UX向上・backendの権威400/422がbackstop)。
const newPasswordWeak = computed(
  () => newPassword.value.length > 0 && !isStrongPassword(newPassword.value),
)
const passwordsMismatch = computed(
  () => confirmNewPassword.value.length > 0 && newPassword.value !== confirmNewPassword.value,
)
const hasClientValidationError = computed(() => newPasswordWeak.value || passwordsMismatch.value)

const errorMessageKey = computed(() => {
  if (accountStore.passwordChangeError === null) return null
  return `account.password.error.${accountStore.passwordChangeError}`
})

async function handleSubmit() {
  if (hasClientValidationError.value) {
    return
  }
  const success = await accountStore.changePassword({
    currentPassword: currentPassword.value,
    newPassword: newPassword.value,
  })
  if (success) {
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
  }
}
</script>

<template>
  <AppLayout>
    <div class="password-change">
      <form class="jps-card jps-card-pad password-change__form" @submit.prevent="handleSubmit">
        <h1 class="password-change__title">{{ t('account.password.title') }}</h1>

        <p v-if="errorMessageKey" class="jps-alert jps-alert-danger" role="alert">
          {{ t(errorMessageKey) }}
        </p>
        <p v-if="passwordsMismatch" class="jps-alert jps-alert-danger" role="alert">
          {{ t('account.password.mismatch') }}
        </p>
        <p
          v-if="accountStore.passwordChangeSuccess"
          class="jps-alert jps-alert-success"
          role="status"
        >
          {{ t('account.password.success') }}
        </p>

        <div class="jps-field">
          <label class="jps-label jps-required" for="password-change-current">
            {{ t('account.password.currentPasswordLabel') }}
          </label>
          <input
            id="password-change-current"
            v-model="currentPassword"
            name="currentPassword"
            type="password"
            class="jps-input"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="jps-field">
          <label class="jps-label jps-required" for="password-change-new">
            {{ t('account.password.newPasswordLabel') }}
          </label>
          <input
            id="password-change-new"
            v-model="newPassword"
            name="newPassword"
            type="password"
            class="jps-input"
            autocomplete="new-password"
            :aria-invalid="newPasswordWeak ? 'true' : undefined"
            required
          />
          <p v-if="newPasswordWeak" class="jps-error-text">
            {{ t('account.validation.weakPassword') }}
          </p>
        </div>

        <div class="jps-field">
          <label class="jps-label jps-required" for="password-change-confirm">
            {{ t('account.password.confirmNewPasswordLabel') }}
          </label>
          <input
            id="password-change-confirm"
            v-model="confirmNewPassword"
            name="confirmNewPassword"
            type="password"
            class="jps-input"
            autocomplete="new-password"
            :aria-invalid="passwordsMismatch ? 'true' : undefined"
            required
          />
        </div>

        <button
          type="submit"
          class="jps-btn jps-btn-primary jps-btn-block"
          :disabled="accountStore.isChangingPassword"
        >
          {{
            accountStore.isChangingPassword
              ? t('account.password.submitting')
              : t('account.password.submit')
          }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<style scoped>
.password-change {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.password-change__form {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.password-change__title {
  font-size: 1.375rem;
}
</style>
