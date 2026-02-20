export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export interface ChatRoom {
  id: string
  name: string
  messages: Message[]
}
