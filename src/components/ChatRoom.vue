<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ChatRoom, Message, Participant } from '@/types/chat'
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
    participants: [],
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
    />
    <ChatMain
      :room="activeRoom"
      @send-message="sendMessage"
      @update-room-name="updateRoomName"
    />
  </div>
</template>
