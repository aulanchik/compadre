<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message, ChatRoom } from '@/types/chat'
import './ChatMain.scss'

const props = defineProps<{
  room: ChatRoom | null
}>()

const emit = defineEmits<{
  sendMessage: [text: string]
  updateRoomName: [name: string]
}>()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const isEditingName = ref(false)
const editedName = ref('')

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => props.room?.messages.length, () => {
  scrollToBottom()
})

const handleSend = () => {
  const text = messageInput.value.trim()
  if (text) {
    emit('sendMessage', text)
    messageInput.value = ''
  }
}

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const startEditingName = () => {
  if (props.room) {
    editedName.value = props.room.name
    isEditingName.value = true
  }
}

const handleTitleKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    startEditingName()
  }
}

const saveRoomName = () => {
  if (editedName.value.trim() && props.room) {
    emit('updateRoomName', editedName.value.trim())
    isEditingName.value = false
  }
}

const cancelEditingName = () => {
  isEditingName.value = false
  editedName.value = ''
}

const handleNameKeyPress = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    saveRoomName()
  } else if (e.key === 'Escape') {
    cancelEditingName()
  }
}
</script>

<template>
  <main class="chat-main">
    <div v-if="!room" class="empty-state">
      <svg class="empty-icon" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <line x1="9" y1="10" x2="9.01" y2="10"></line>
        <line x1="13" y1="10" x2="13.01" y2="10"></line>
        <line x1="17" y1="10" x2="17.01" y2="10"></line>
      </svg>
      <p>Select a chat room to start messaging</p>
    </div>

    <template v-else>
      <div class="chat-header">
        <div class="header-left">
          <div v-if="isEditingName" class="name-edit">
            <input
              v-model="editedName"
              type="text"
              @keyup="handleNameKeyPress"
              @blur="saveRoomName"
              class="name-input"
              autofocus
            />
          </div>
          <h3 v-else class="room-title" @click="startEditingName" @keydown="handleTitleKeyPress" title="Click to rename" tabindex="0" role="button" aria-label="Edit room name">
            {{ room.name }}
            <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </h3>
        </div>
        <div class="participants-list" v-if="room.participants?.length">
          <div
            v-for="participant in room.participants"
            :key="participant.id"
            class="participant"
            :title="`${participant.name}${participant.autoRespond ? ' (Auto-respond enabled)' : ''}`"
          >
            <span class="participant-avatar">{{ participant.avatar }}</span>
            <span class="participant-name">{{ participant.name }}</span>
            <span v-if="participant.autoRespond" class="auto-respond-badge" :title="`${participant.name} auto-responds`" role="status" aria-label="Auto-respond enabled">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
              Auto-respond
            </span>
          </div>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="message in room.messages"
          :key="message.id"
          class="message"
          :class="message.sender"
        >
          <div class="message-avatar">
            <svg v-if="message.sender === 'user'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <line x1="8" y1="16" x2="8" y2="16"></line>
              <line x1="16" y1="16" x2="16" y2="16"></line>
            </svg>
          </div>
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div class="message-time">{{ formatTime(message.timestamp) }}</div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <textarea
          v-model="messageInput"
          @keydown="handleKeyPress"
          placeholder="Type a message..."
          rows="1"
        ></textarea>
        <button class="send-btn" @click="handleSend" :disabled="!messageInput.trim()" aria-label="Send message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </template>
  </main>
</template>
