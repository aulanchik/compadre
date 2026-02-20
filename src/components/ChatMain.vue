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
      <span class="empty-icon">💬</span>
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
          <h3 v-else class="room-title" @click="startEditingName" title="Click to rename">
            {{ room.name }}
            <span class="edit-icon">✏️</span>
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
            <span v-if="participant.autoRespond" class="auto-respond-badge" title="Auto-respond enabled">
              [CHATBOT]
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
            {{ message.sender === 'user' ? '👤' : (message.participantAvatar || '🤖') }}
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
        <button class="send-btn" @click="handleSend" :disabled="!messageInput.trim()">
          <span>➤</span>
        </button>
      </div>
    </template>
  </main>
</template>
