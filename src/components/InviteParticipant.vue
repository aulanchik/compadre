<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Participant } from '@/types/chat'
import { useIdGenerator } from '@/composables/useIdGenerator'
import './InviteParticipant.scss'

const props = defineProps<{
  modelValue: boolean
  existingParticipants: Participant[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  addParticipant: [participant: Participant]
}>()

const { generateId } = useIdGenerator()

const AVATARS = ['👨', '👩', '🧑', '👴', '👵', '🧔', '👱', '👮', '👷', '🕵️', '🧙', '🧚', '🧛', '🧜'] as const

const participantName = ref('')
const autoRespond = ref(true)
const minResponseTime = ref(1000)
const maxResponseTime = ref(5000)
const selectedAvatar = ref<string>(AVATARS[0])

const resetForm = () => {
  participantName.value = ''
  autoRespond.value = true
  minResponseTime.value = 1000
  maxResponseTime.value = 5000
  selectedAvatar.value = AVATARS[0] as string
}

const handleAddParticipant = () => {
  const name = participantName.value.trim()
  if (!name) return

  const newParticipant: Participant = {
    id: generateId(),
    name,
    avatar: selectedAvatar.value,
    autoRespond: autoRespond.value,
    minResponseTime: minResponseTime.value,
    maxResponseTime: maxResponseTime.value,
  }

  emit('addParticipant', newParticipant)
  resetForm()
  emit('update:modelValue', false)
}

const closeModal = () => {
  resetForm()
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="closeModal" role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
        <div class="modal-content invite-modal" @click.stop>
          <div class="modal-header">
            <h3 id="invite-modal-title">Invite Participant</h3>
            <button class="close-btn" @click="closeModal" aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label>Avatar</label>
              <div class="avatar-selector">
                <button
                  v-for="avatar in AVATARS"
                  :key="avatar"
                  class="avatar-option"
                  :class="{ selected: selectedAvatar === avatar }"
                  @click="selectedAvatar = avatar"
                >
                  {{ avatar }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="name">Name</label>
              <input
                id="name"
                v-model="participantName"
                type="text"
                placeholder="Enter participant name"
                @keyup.enter="handleAddParticipant"
              />
            </div>

            <div class="form-group">
              <label class="checkbox-label">
                <input v-model="autoRespond" type="checkbox" />
                <span>Enable Auto-Response</span>
              </label>
            </div>

            <div v-if="autoRespond" class="form-group response-time">
              <div class="time-input">
                <label for="minTime">Min Response Time (ms)</label>
                <input
                  id="minTime"
                  v-model.number="minResponseTime"
                  type="number"
                  min="0"
                  step="500"
                />
              </div>
              <div class="time-input">
                <label for="maxTime">Max Response Time (ms)</label>
                <input
                  id="maxTime"
                  v-model.number="maxResponseTime"
                  type="number"
                  min="0"
                  step="500"
                />
              </div>
              <p class="hint">Response will be sent at a random time between min and max</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-btn" @click="closeModal">Cancel</button>
            <button
              class="add-btn"
              @click="handleAddParticipant"
              :disabled="!participantName.trim()"
            >
              Add Participant
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
