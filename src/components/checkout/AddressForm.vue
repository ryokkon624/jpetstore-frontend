<script setup lang="ts">
// #7: billing/shipping共通の住所入力フォーム部品。既達フォームkit(.jps-field等)を再利用する。
import { useI18n } from 'vue-i18n'
import type { Address } from '@/domain/checkout'

const props = defineProps<{ modelValue: Address; idPrefix: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: Address] }>()
const { t } = useI18n()

function updateField(key: keyof Address, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function fieldId(key: keyof Address): string {
  return `${props.idPrefix}-${key}`
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
        :value="modelValue.firstName"
        @input="updateField('firstName', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.lastName"
        @input="updateField('lastName', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.email"
        @input="updateField('email', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.phone"
        @input="updateField('phone', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.address1"
        @input="updateField('address1', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.address2"
        @input="updateField('address2', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.city"
        @input="updateField('city', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.state"
        @input="updateField('state', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.postalCode"
        @input="updateField('postalCode', ($event.target as HTMLInputElement).value)"
      />
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
        :value="modelValue.country"
        @input="updateField('country', ($event.target as HTMLInputElement).value)"
      />
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
