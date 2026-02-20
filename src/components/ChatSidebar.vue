<script setup lang="ts">
import { ref } from 'vue'
import type { ChatRoom } from '@/types/chat'
import './ChatSidebar.scss'

const props = defineProps<{
  rooms: ChatRoom[]
  activeRoomId: string | null
}>()

const emit = defineEmits<{
  selectRoom: [roomId: string]
  createRoom: []
}>()

const isCollapsed = ref(false)
</script>

<template>
  <aside class="chat-sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-header">
      <h2 v-if="!isCollapsed">Chat Rooms</h2>
      <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>
    
    <button class="new-chat-btn" @click="emit('createRoom')" v-if="!isCollapsed">
      + New Chat
    </button>
    
    <div class="rooms-list">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="room-item"
        :class="{ active: room.id === activeRoomId }"
        @click="emit('selectRoom', room.id)"
      >
        <span class="room-icon">💬</span>
        <span class="room-name" v-if="!isCollapsed">{{ room.name }}</span>
      </div>
    </div>
  </aside>
</template>
