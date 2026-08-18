<script setup lang="ts">
// #36/#25: ヘッダー設定コントロール(テーマ/言語)の共通ドロップダウン部品。
// repoに既存の再利用可能なdropdown/menu/popoverが無いため新規実装する(open/close・click-outside・
// aria/keyboardを備える)。呼び出し側(AppHeader.vue)はテーマ3択・言語2択の両方でそのまま再利用する。
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface SettingsDropdownOption {
  value: string
  label: string
}

const props = defineProps<{
  /** アクセシブルラベル(トリガーボタンのaria-label・listboxのaria-label)。 */
  label: string
  options: SettingsDropdownOption[]
  modelValue: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function toggle(): void {
  isOpen.value = !isOpen.value
}

function close(): void {
  isOpen.value = false
}

function select(value: string): void {
  emit('update:modelValue', value)
  close()
}

/** click-outside: ルート要素の外側をクリックしたら閉じる。 */
function handleDocumentClick(event: MouseEvent): void {
  if (isOpen.value && rootRef.value && !rootRef.value.contains(event.target as Node)) {
    close()
  }
}

/** keyboard: Escapeで閉じる。 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})

function currentOptionLabel(): string {
  return props.options.find((option) => option.value === props.modelValue)?.label ?? props.label
}
</script>

<template>
  <div ref="rootRef" class="jps-settings-dropdown">
    <button
      type="button"
      class="jps-btn jps-btn-ghost jps-btn-sm jps-settings-dropdown__trigger"
      :aria-label="label"
      aria-haspopup="listbox"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      {{ currentOptionLabel() }}
    </button>
    <ul v-if="isOpen" class="jps-settings-dropdown__menu" role="listbox" :aria-label="label">
      <li
        v-for="option in options"
        :key="option.value"
        role="option"
        :aria-selected="option.value === modelValue"
        class="jps-settings-dropdown__option"
        :class="{ 'jps-settings-dropdown__option-active': option.value === modelValue }"
        @click="select(option.value)"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.jps-settings-dropdown {
  position: relative;
}

.jps-settings-dropdown__menu {
  position: absolute;
  top: calc(100% + 0.25rem);
  right: 0;
  min-width: 8rem;
  padding: 0.25rem;
  margin: 0;
  list-style: none;
  background-color: var(--jps-surface-card);
  border: 1px solid var(--jps-border);
  border-radius: var(--jps-radius-md);
  box-shadow: var(--jps-shadow-md);
  z-index: 20;
}

.jps-settings-dropdown__option {
  padding: 0.375rem 0.625rem;
  font-size: 0.8125rem;
  border-radius: var(--jps-radius-sm);
  cursor: pointer;
  color: var(--jps-text-body);
}

.jps-settings-dropdown__option:hover {
  background-color: var(--jps-surface-subtle);
}

.jps-settings-dropdown__option-active {
  font-weight: 600;
  color: var(--jps-primary-text);
}
</style>
