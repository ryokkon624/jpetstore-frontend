<script setup lang="ts">
// #14 AC1〜AC3: アカウント/プロフィール編集画面。requiresAuth(本人のみ)。version楽観ロック（arch §4.2）。
// 409競合時は新UX（既存order.tsの409→終端文言とは別・store.shouldPromptReloadで「再読込」を促す）。
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '@/components/AppLayout.vue'
import AddressForm from '@/components/checkout/AddressForm.vue'
import { useAccountStore } from '@/stores/account'
import { useCatalogStore } from '@/stores/catalog'
import type { AccountEditDetail } from '@/domain/account'
import { emptyAddress, type Address } from '@/domain/checkout'

const { t } = useI18n()
const accountStore = useAccountStore()
const catalogStore = useCatalogStore()

// AddressFormは`Address`(氏名/連絡先/住所・address2は常にstring)のみを束縛する。AccountEditDetailの
// address2はサーバ由来でnull許容のため、フォーム用のaddressと編集専用フィールドを分けて保持し、
// 送信時にのみ合成する(checkout store の toAddress/emptyAddress と同じ橋渡しパターン)。
const address = ref<Address>(emptyAddress())
const languagePreference = ref('english')
const favoriteCategoryId = ref<string | null>(null)
const version = ref(0)
const loaded = ref(false)
const justSaved = ref(false)

onMounted(async () => {
  // #24で確立した並行初期化パターン(依存の無い非同期処理はPromise.allで並行取得)。
  await Promise.all([accountStore.fetchAccount(), catalogStore.fetchCategories()])
  syncFormFromStore()
})

function syncFormFromStore() {
  const detail = accountStore.detail
  if (detail === null) {
    loaded.value = false
    return
  }
  address.value = {
    firstName: detail.firstName,
    lastName: detail.lastName,
    email: detail.email,
    phone: detail.phone,
    address1: detail.address1,
    address2: detail.address2 ?? '',
    city: detail.city,
    state: detail.state,
    postalCode: detail.postalCode,
    country: detail.country,
  }
  languagePreference.value = detail.languagePreference
  favoriteCategoryId.value = detail.favoriteCategoryId
  version.value = detail.version
  loaded.value = true
}

async function handleSubmit() {
  justSaved.value = false
  const payload: AccountEditDetail = {
    ...address.value,
    address2: address.value.address2 || null,
    languagePreference: languagePreference.value,
    favoriteCategoryId: favoriteCategoryId.value,
    version: version.value,
  }
  const success = await accountStore.updateAccount(payload)
  if (success) {
    syncFormFromStore()
    justSaved.value = true
  }
}

async function handleReload() {
  await accountStore.fetchAccount()
  syncFormFromStore()
}
</script>

<template>
  <AppLayout>
    <div v-if="loaded" class="account-edit">
      <form class="jps-card jps-card-pad account-edit__form" @submit.prevent="handleSubmit">
        <h1 class="account-edit__title">{{ t('account.edit.title') }}</h1>

        <p v-if="accountStore.shouldPromptReload" class="jps-alert jps-alert-danger" role="alert">
          {{ t('account.edit.conflict') }}
          <button type="button" class="jps-btn jps-btn-secondary" @click="handleReload">
            {{ t('account.edit.reload') }}
          </button>
        </p>
        <p v-if="accountStore.hasSaveError" class="jps-alert jps-alert-danger" role="alert">
          {{ t('account.edit.error') }}
        </p>
        <p
          v-if="justSaved && !accountStore.hasConflict"
          class="jps-alert jps-alert-success"
          role="status"
        >
          {{ t('account.edit.success') }}
        </p>

        <AddressForm v-model="address" id-prefix="account-edit" />

        <div class="jps-field">
          <label class="jps-label" for="account-edit-language-preference">
            {{ t('account.edit.languagePreferenceLabel') }}
          </label>
          <select
            id="account-edit-language-preference"
            v-model="languagePreference"
            class="jps-select"
          >
            <option value="english">{{ t('account.edit.languageOptions.english') }}</option>
            <option value="japanese">{{ t('account.edit.languageOptions.japanese') }}</option>
          </select>
        </div>

        <div class="jps-field">
          <label class="jps-label" for="account-edit-favorite-category">
            {{ t('account.edit.favoriteCategoryLabel') }}
          </label>
          <select
            id="account-edit-favorite-category"
            v-model="favoriteCategoryId"
            class="jps-select"
          >
            <option :value="null">{{ t('account.edit.favoriteCategoryNone') }}</option>
            <option
              v-for="category in catalogStore.categories"
              :key="category.categoryId"
              :value="category.categoryId"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <button
          type="submit"
          class="jps-btn jps-btn-primary jps-btn-block"
          :disabled="accountStore.isSaving"
        >
          {{ accountStore.isSaving ? t('account.edit.saving') : t('account.edit.submit') }}
        </button>
      </form>
    </div>
    <p v-else-if="accountStore.hasLoadError" class="jps-alert jps-alert-danger" role="alert">
      {{ t('account.edit.loadError') }}
    </p>
  </AppLayout>
</template>

<style scoped>
.account-edit {
  display: flex;
  justify-content: center;
  padding: 2rem 0;
}

.account-edit__form {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.account-edit__title {
  font-size: 1.375rem;
}
</style>
