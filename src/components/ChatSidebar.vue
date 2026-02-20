<script setup lang="ts">
import { ref } from 'vue'
import type { ChatRoom } from '@/types/chat'
import InviteParticipant from '@/components/InviteParticipant.vue'
import './ChatSidebar.scss'

const props = defineProps<{
  rooms: ChatRoom[]
  activeRoomId: string | null
}>()

const emit = defineEmits<{
  selectRoom: [roomId: string]
  createRoom: [name?: string]
  inviteParticipant: [participant: any]
}>()

const isCollapsed = ref(false)
const showInviteModal = ref(false)
const newChatName = ref('')
const showNewChatInput = ref(false)

const handleCreateRoom = () => {
  if (showNewChatInput.value && newChatName.value.trim()) {
    emit('createRoom', newChatName.value.trim())
    newChatName.value = ''
    showNewChatInput.value = false
  } else if (!showNewChatInput.value) {
    showNewChatInput.value = true
  }
}

const cancelNewChat = () => {
  newChatName.value = ''
  showNewChatInput.value = false
}

const handleInviteParticipant = (participant: any) => {
  emit('inviteParticipant', participant)
}

const openInviteModal = () => {
  showInviteModal.value = true
}

const activeRoom = ref(() => {
  return props.rooms.find(r => r.id === props.activeRoomId) || null
})
</script>

<template>
  <aside class="chat-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <h2 v-if="!isCollapsed">Chat Rooms</h2>
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>

    <div class="new-chat-wrapper" v-if="!isCollapsed">
      <div v-if="showNewChatInput" class="new-chat-input-wrapper">
        <input
          v-model="newChatName"
          type="text"
          placeholder="Enter chat name..."
          @keyup.enter="handleCreateRoom"
          @keyup.escape="cancelNewChat"
          class="new-chat-input"
        />
        <button class="confirm-btn" @click="handleCreateRoom">✓</button>
        <button class="cancel-btn" @click="cancelNewChat">✕</button>
      </div>
      <button v-else class="new-chat-btn" @click="handleCreateRoom">
        + New Chat
      </button>
    </div>

    <div class="rooms-list">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="room-item"
        :class="{ active: room.id === activeRoomId }"
        @click="emit('selectRoom', room.id)"
      >
        <span class="room-icon">💬</span>
        <div class="room-info" v-if="!isCollapsed">
          <span class="room-name">{{ room.name }}</span>
          <div class="room-participants-preview" v-if="room.participants?.length">
            <span
              v-for="p in room.participants.slice(0, 3)"
              :key="p.id"
              class="participant-avatar"
              :title="p.name"
            >
              {{ p.avatar }}
            </span>
            <span v-if="room.participants.length > 3" class="more-participants">
              +{{ room.participants.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <button
      v-if="!isCollapsed && activeRoomId"
      class="invite-btn"
      @click="openInviteModal"
    >
      👥 Invite Participant
    </button>

    <InviteParticipant
      v-model="showInviteModal"
      :existing-participants="activeRoom?.() ?.participants || []"
      @add-participant="handleInviteParticipant"
    />
  </aside>
</template>
