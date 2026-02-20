<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ChatRoom, Message, Participant } from '@/types/chat'
import { BOT_RESPONSES } from '@/data/bot'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatMain from '@/components/ChatMain.vue'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useIdGenerator } from '@/composables/useIdGenerator'
import './ChatRoom.scss'

const STORAGE_KEY = 'chatrooms-state'
const ACTIVE_ROOM_KEY = 'chatrooms-active'

const { generateId } = useIdGenerator()

// Helper to restore Date objects from serialized strings
const restoreChatRooms = (data: any[]): ChatRoom[] => {
  return data.map(room => ({
    ...room,
    messages: room.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  }))
}

// Custom storage handling for complex data (Date objects)
const loadFromStorage = (): ChatRoom[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as any[]
      return restoreChatRooms(parsed)
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

const storedRooms = loadFromStorage()
const rooms = ref<ChatRoom[]>(storedRooms.length > 0 ? storedRooms : [
  {
    id: generateId(),
    name: 'General Chat',
    messages: [],
    participants: [],
  },
])

// Persist active room ID
const activeRoomId = useLocalStorage<string | null>(ACTIVE_ROOM_KEY, null)

// Validate active room ID on mount
if (!activeRoomId.value || !rooms.value.some(r => r.id === activeRoomId.value)) {
  activeRoomId.value = rooms.value[0]?.id ?? null
}

const activeRoom = computed(() => {
  return rooms.value.find(r => r.id === activeRoomId.value) || null
})

// Persist rooms to localStorage whenever they change
watch(rooms, (newRooms) => {
  saveToStorage(newRooms)
}, { deep: true })

const selectRoom = (roomId: string) => {
  activeRoomId.value = roomId
}

const createRoom = (name?: string) => {
  const newRoom: ChatRoom = {
    id: generateId(),
    name: name || `Chat Room ${rooms.value.length + 1}`,
    messages: [],
    participants: [],
  }
  rooms.value.push(newRoom)
  activeRoomId.value = newRoom.id
}

const inviteParticipant = (participant: Participant) => {
  const room = activeRoom.value
  if (!room) return
  room.participants.push(participant)
}

const updateRoomName = (name: string) => {
  const room = activeRoom.value
  if (!room) return
  room.name = name
}

const deleteRoom = (roomId: string) => {
  const roomIndex = rooms.value.findIndex(r => r.id === roomId)
  if (roomIndex === -1) return

  // Handle edge case: if deleting the active room
  if (activeRoomId.value === roomId) {
    // If there are other rooms, select the first available one
    if (rooms.value.length > 1) {
      // Prefer the next room, or the previous one if deleting the last room
      const newActiveIndex = roomIndex < rooms.value.length - 1 ? roomIndex + 1 : roomIndex - 1
      const newRoom = rooms.value[newActiveIndex]
      if (newRoom) {
        activeRoomId.value = newRoom.id
      }
    } else {
      // Last room is being deleted, clear active room
      activeRoomId.value = null
    }
  }

  // Remove the room
  rooms.value.splice(roomIndex, 1)
}

const getRandomResponse = () => {
  const randomIndex = Math.floor(Math.random() * BOT_RESPONSES.length)
  return BOT_RESPONSES[randomIndex] ?? "That's interesting!"
}

const triggerAutoResponse = (participant: Participant) => {
  const room = activeRoom.value
  if (!room || !participant.autoRespond) return

  // Calculate random delay between min and max response time
  const delay = Math.floor(
    Math.random() * (participant.maxResponseTime - participant.minResponseTime) +
    participant.minResponseTime
  )

  setTimeout(() => {
    // Check if room still exists and is still the active room
    const currentRoom = rooms.value.find(r => r.id === room.id)
    if (!currentRoom) return

    const botMessage: Message = {
      id: generateId(),
      text: getRandomResponse(),
      sender: 'bot',
      participantId: participant.id,
      participantAvatar: participant.avatar,
      timestamp: new Date(),
    }
    currentRoom.messages.push(botMessage)
  }, delay)
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

  // Trigger auto-responses from all participants with auto-respond enabled
  room.participants.forEach(participant => {
    if (participant.autoRespond) {
      triggerAutoResponse(participant)
    }
  })
}
</script>

<template>
  <div class="chat-room">
    <ChatSidebar
      :rooms="rooms"
      :active-room-id="activeRoomId"
      @select-room="selectRoom"
      @create-room="createRoom"
      @invite-participant="inviteParticipant"
      @delete-room="deleteRoom"
    />
    <ChatMain
      :room="activeRoom"
      @send-message="sendMessage"
      @update-room-name="updateRoomName"
    />
  </div>
</template>
