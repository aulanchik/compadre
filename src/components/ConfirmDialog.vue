<script setup lang="ts">
import { ref, watch } from 'vue'
import './ConfirmDialog.scss'

const props = defineProps<{
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const isOpen = ref(props.modelValue)

const handleConfirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleCancel" role="dialog" aria-modal="true" :aria-labelledby="`dialog-title-${title}`">
        <div class="modal-content" :class="type || 'info'" @click.stop>
          <div class="modal-header">
            <div class="icon-wrapper" :class="type || 'info'">
              <svg v-if="type === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 2.99h16.94a2 2 0 0 0 1.71-2.99L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg v-else-if="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 2.99h16.94a2 2 0 0 0 1.71-2.99L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
            <h3 :id="`dialog-title-${title}`">{{ title }}</h3>
          </div>

          <div class="modal-body">
            <p>{{ message }}</p>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="handleCancel">
              {{ cancelText || 'Cancel' }}
            </button>
            <button
              class="confirm-btn"
              :class="type || 'info'"
              @click="handleConfirm"
            >
              {{ confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
