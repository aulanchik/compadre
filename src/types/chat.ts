export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  participantId?: string
  participantAvatar?: string
  timestamp: Date
}

export interface Participant {
  id: string
  name: string
  avatar: string
  autoRespond: boolean
  minResponseTime: number // in milliseconds
  maxResponseTime: number // in milliseconds
}

export interface ChatRoom {
  id: string
  name: string
  messages: Message[]
  participants: Participant[]
}
