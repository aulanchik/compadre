<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ChatRoom, Message } from '@/types/chat'
import { BOT_RESPONSES } from '@/data/bot'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatMain from '@/components/ChatMain.vue'
import './ChatRoom.scss'

const STORAGE_KEY = 'chatrooms-state'
const ACTIVE_ROOM_KEY = 'chatrooms-active'

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).substr(2, 9)
}

const loadFromStorage = (): ChatRoom[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ChatRoom[]
      // Restore Date objects from serialized strings
      return parsed.map(room => ({
        ...room,
        messages: room.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }))
    }
  } catch (e) {
    console.error('Failed to load chat state from storage:', e)
  }
  return []
}

const saveToStorage = (rooms: ChatRoom[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  } catch (e) {
    console.error('Failed to save chat state to storage:', e)
  }
}

const loadActiveRoomId = (): string | null => {
  try {
    return localStorage.getItem(ACTIVE_ROOM_KEY)
  } catch (e) {
    console.error('Failed to load active room from storage:', e)
  }
  return null
}

const saveActiveRoomId = (roomId: string | null) => {
  try {
    if (roomId) {
      localStorage.setItem(ACTIVE_ROOM_KEY, roomId)
    } else {
      localStorage.removeItem(ACTIVE_ROOM_KEY)
    }
  } catch (e) {
    console.error('Failed to save active room to storage:', e)
  }
}

const storedRooms = loadFromStorage()
const rooms = ref<ChatRoom[]>(storedRooms.length > 0 ? storedRooms : [
  {
    id: generateId(),
    name: 'General Chat',
    messages: [],
  },
])

const storedActiveRoomId = loadActiveRoomId()
const activeRoomId = ref<string | null>(
  storedActiveRoomId && rooms.value.some(r => r.id === storedActiveRoomId)
    ? storedActiveRoomId
    : rooms.value[0]?.id ?? null
)

const activeRoom = computed(() => {
  return rooms.value.find(r => r.id === activeRoomId.value) || null
})

// Persist rooms to localStorage whenever they change
watch(rooms, (newRooms) => {
  saveToStorage(newRooms)
}, { deep: true })

// Persist active room selection
watch(activeRoomId, (newId) => {
  saveActiveRoomId(newId)
})

const selectRoom = (roomId: string) => {
  activeRoomId.value = roomId
}

const createRoom = () => {
  const newRoom: ChatRoom = {
    id: generateId(),
    name: `Chat Room ${rooms.value.length + 1}`,
    messages: [],
  }
  rooms.value.push(newRoom)
  activeRoomId.value = newRoom.id
}

const getRandomResponse = () => {
  const randomIndex = Math.floor(Math.random() * BOT_RESPONSES.length)
  return BOT_RESPONSES[randomIndex] ?? "That's interesting!"
}

const sendMessage = (text: string) => {
  const room = activeRoom.value
  if (!room) return
  
  // Add user message
  const userMessage: Message = {
    id: generateId(),
    text,
    sender: 'user',
    timestamp: new Date(),
  }
  room.messages.push(userMessage)
  
  // Simulate bot response with 1 second delay
  setTimeout(() => {
    const botMessage: Message = {
      id: generateId(),
      text: getRandomResponse(),
      sender: 'bot',
      timestamp: new Date(),
    }
    room.messages.push(botMessage)
  }, 1000)
}
</script>

<template>
  <div class="chat-room">
    <ChatSidebar
      :rooms="rooms"
      :active-room-id="activeRoomId"
      @select-room="selectRoom"
      @create-room="createRoom"
    />
    <ChatMain
      :room="activeRoom"
      @send-message="sendMessage"
    />
  </div>
</template>
