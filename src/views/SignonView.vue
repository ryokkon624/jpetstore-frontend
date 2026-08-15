<script setup lang="ts">
// AC7/AC9: サインオン画面。既定資格情報のプリフィルは行わない(初期表示は空)。
// AC6: 失敗理由(未知ユーザー/誤PW)を問わず一律メッセージのみ表示する。
// AC8/AC-neg2: 成功時はredirectクエリ(相対パスのみ許可)へ復帰する。
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { sanitizeRedirectTarget } from '@/utils/redirectValidator'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// AC9: 既定資格情報を初期値にプリフィルしない(空文字で開始)。
const username = ref('')
const password = ref('')

async function handleSubmit() {
  const success = await authStore.signon(username.value, password.value)
  if (success) {
    router.push(sanitizeRedirectTarget(route.query.redirect))
  }
}
</script>

<template>
  <AppLayout>
    <div class="signon">
      <form class="jps-card jps-card-pad signon__form" @submit.prevent="handleSubmit">
        <h1 class="signon__title">{{ t('auth.signon.title') }}</h1>

        <p v-if="authStore.hasSignonError" class="jps-alert jps-alert-danger" role="alert">
          {{ t('auth.signon.error') }}
        </p>

        <div class="jps-field">
          <label class="jps-label" for="signon-username">
            {{ t('auth.signon.usernameLabel') }}
          </label>
          <input
            id="signon-username"
            v-model="username"
            name="username"
            type="text"
            class="jps-input"
            autocomplete="username"
          />
        </div>

        <div class="jps-field">
          <label class="jps-label" for="signon-password">
            {{ t('auth.signon.passwordLabel') }}
          </label>
          <input
            id="signon-password"
            v-model="password"
            name="password"
            type="password"
            class="jps-input"
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="jps-btn jps-btn-primary jps-btn-block"
          :disabled="authStore.isSigningOn"
        >
          {{ authStore.isSigningOn ? t('auth.signon.submitting') : t('auth.signon.submit') }}
        </button>
      </form>
    </div>
  </AppLayout>
</template>

<style scoped>
.signon {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.signon__form {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.signon__title {
  font-size: 1.375rem;
}
</style>
