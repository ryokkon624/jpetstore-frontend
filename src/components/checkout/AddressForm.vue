<script setup lang="ts">
// #7: billing/shipping共通の住所入力フォーム部品。既達フォームkit(.jps-field等)を再利用する。
// #17 AC3: errors/maxLengthsは後方互換のopt-inプロップ(未指定=挙動不変・checkout側は現状どおり)。
// register/account-edit側がインラインエラー表示・DBカラム幅maxlengthを渡すために追加した(Sprint7共用
// フォーム教訓・計画フェーズ確定⑦)。
import { useI18n } from 'vue-i18n'
import type { Address } from '@/domain/checkout'

const props = defineProps<{
  modelValue: Address
  idPrefix: string
  errors?: Partial<Record<keyof Address, string>>
  maxLengths?: Partial<Record<keyof Address, number>>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Address] }>()
const { t } = useI18n()

function updateField(key: keyof Address, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function fieldId(key: keyof Address): string {
  return `${props.idPrefix}-${key}`
}

function fieldError(key: keyof Address): string | undefined {
  return props.errors?.[key]
}

function fieldMaxLength(key: keyof Address): number | undefined {
  return props.maxLengths?.[key]
}
</script>

<template>
  <div class="address-form">
    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('firstName')">
        {{ t('checkout.addressStep.fields.firstName') }}
      </label>
      <input
        :id="fieldId('firstName')"
        class="jps-input"
        type="text"
        autocomplete="given-name"
        :maxlength="fieldMaxLength('firstName')"
        :aria-invalid="fieldError('firstName') ? 'true' : undefined"
        :value="modelValue.firstName"
        @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('firstName')" class="jps-error-text">{{ fieldError('firstName') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('lastName')">
        {{ t('checkout.addressStep.fields.lastName') }}
      </label>
      <input
        :id="fieldId('lastName')"
        class="jps-input"
        type="text"
        autocomplete="family-name"
        :maxlength="fieldMaxLength('lastName')"
        :aria-invalid="fieldError('lastName') ? 'true' : undefined"
        :value="modelValue.lastName"
        @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('lastName')" class="jps-error-text">{{ fieldError('lastName') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('email')">
        {{ t('checkout.addressStep.fields.email') }}
      </label>
      <input
        :id="fieldId('email')"
        class="jps-input"
        type="email"
        autocomplete="email"
        :maxlength="fieldMaxLength('email')"
        :aria-invalid="fieldError('email') ? 'true' : undefined"
        :value="modelValue.email"
        @input="updateField('email', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('email')" class="jps-error-text">{{ fieldError('email') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('phone')">
        {{ t('checkout.addressStep.fields.phone') }}
      </label>
      <input
        :id="fieldId('phone')"
        class="jps-input"
        type="tel"
        autocomplete="tel"
        :maxlength="fieldMaxLength('phone')"
        :aria-invalid="fieldError('phone') ? 'true' : undefined"
        :value="modelValue.phone"
        @input="updateField('phone', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('phone')" class="jps-error-text">{{ fieldError('phone') }}</p>
    </div>

    <div class="jps-field address-form__span2">
      <label class="jps-label jps-required" :for="fieldId('address1')">
        {{ t('checkout.addressStep.fields.address1') }}
      </label>
      <input
        :id="fieldId('address1')"
        class="jps-input"
        type="text"
        autocomplete="address-line1"
        :maxlength="fieldMaxLength('address1')"
        :aria-invalid="fieldError('address1') ? 'true' : undefined"
        :value="modelValue.address1"
        @input="updateField('address1', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('address1')" class="jps-error-text">{{ fieldError('address1') }}</p>
    </div>

    <div class="jps-field address-form__span2">
      <label class="jps-label" :for="fieldId('address2')">
        {{ t('checkout.addressStep.fields.address2') }}
      </label>
      <input
        :id="fieldId('address2')"
        class="jps-input"
        type="text"
        autocomplete="address-line2"
        :maxlength="fieldMaxLength('address2')"
        :aria-invalid="fieldError('address2') ? 'true' : undefined"
        :value="modelValue.address2"
        @input="updateField('address2', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('address2')" class="jps-error-text">{{ fieldError('address2') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('city')">
        {{ t('checkout.addressStep.fields.city') }}
      </label>
      <input
        :id="fieldId('city')"
        class="jps-input"
        type="text"
        autocomplete="address-level2"
        :maxlength="fieldMaxLength('city')"
        :aria-invalid="fieldError('city') ? 'true' : undefined"
        :value="modelValue.city"
        @input="updateField('city', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('city')" class="jps-error-text">{{ fieldError('city') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('state')">
        {{ t('checkout.addressStep.fields.state') }}
      </label>
      <input
        :id="fieldId('state')"
        class="jps-input"
        type="text"
        autocomplete="address-level1"
        :maxlength="fieldMaxLength('state')"
        :aria-invalid="fieldError('state') ? 'true' : undefined"
        :value="modelValue.state"
        @input="updateField('state', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('state')" class="jps-error-text">{{ fieldError('state') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('postalCode')">
        {{ t('checkout.addressStep.fields.postalCode') }}
      </label>
      <input
        :id="fieldId('postalCode')"
        class="jps-input"
        type="text"
        autocomplete="postal-code"
        :maxlength="fieldMaxLength('postalCode')"
        :aria-invalid="fieldError('postalCode') ? 'true' : undefined"
        :value="modelValue.postalCode"
        @input="updateField('postalCode', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('postalCode')" class="jps-error-text">{{ fieldError('postalCode') }}</p>
    </div>

    <div class="jps-field">
      <label class="jps-label jps-required" :for="fieldId('country')">
        {{ t('checkout.addressStep.fields.country') }}
      </label>
      <input
        :id="fieldId('country')"
        class="jps-input"
        type="text"
        autocomplete="country-name"
        :maxlength="fieldMaxLength('country')"
        :aria-invalid="fieldError('country') ? 'true' : undefined"
        :value="modelValue.country"
        @input="updateField('country', ($event.target as HTMLInputElement).value)"
      />
      <p v-if="fieldError('country')" class="jps-error-text">{{ fieldError('country') }}</p>
    </div>
  </div>
</template>

<style scoped>
.address-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.address-form__span2 {
  grid-column: 1 / -1;
}

@media (max-width: 640px) {
  .address-form {
    grid-template-columns: 1fr;
  }
}
</style>
