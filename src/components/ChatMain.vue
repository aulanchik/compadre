<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Message, ChatRoom } from '@/types/chat'
import './ChatMain.scss'

const props = defineProps<{
  room: ChatRoom | null
}>()

const emit = defineEmits<{
  sendMessage: [text: string]
}>()

const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

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
</script>

<template>
  <main class="chat-main">
    <div v-if="!room" class="empty-state">
      <span class="empty-icon">💬</span>
      <p>Select a chat room to start messaging</p>
    </div>
    
    <template v-else>
      <div class="chat-header">
        <h3>{{ room.name }}</h3>
      </div>
      
      <div class="messages-container" ref="messagesContainer">
        <div
          v-for="message in room.messages"
          :key="message.id"
          class="message"
          :class="message.sender"
        >
          <div class="message-avatar">
            {{ message.sender === 'user' ? '👤' : '🤖' }}
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
