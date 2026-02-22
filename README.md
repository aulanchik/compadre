# Compadre

Compadre is a modern, single-page chat application built with Vue 3. It provides a persistent, local chat experience where you can create multiple chat rooms and simulate conversations by inviting configurable "participants" (bots) who can auto-respond to your messages.

## Features

-   **Dynamic Chat Rooms**: Create, rename, and delete multiple chat rooms.
-   **Persistent State**: All chat rooms, messages, and participants are saved to your browser's `localStorage`, so your conversations are preserved across sessions.
-   **Configurable Participants**: Invite participants to any chat room. Customize their name, avatar, and auto-response behavior.
-   **Auto-Response System**: Enable participants to automatically reply to messages. You can set minimum and maximum response times in milliseconds to simulate realistic conversation delays.
-   **Modern UI**: A clean, dark-themed user interface built with modern CSS and SCSS.
-   **Type-Safe**: Built with Vue 3 (Composition API) and TypeScript for a robust and maintainable codebase.

## Technology Stack

-   **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [SCSS](https://sass-lang.com/)
-   **State Management**: Vue Reactivity + local state management
-   **Testing**: [Vitest](https://vitest.dev/)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   Node.js (version `^20.19.0 || >=22.12.0` as specified in `package.json`)
-   `pnpm` package manager is recommended (based on `pnpm-lock.yaml`). You can also use `npm` or `yarn`.

### Installation and Usage

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/aulanchik/compadre.git
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd compadre
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Run the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

### Available Scripts

-   `pnpm dev`: Starts the development server with hot-reloading.
-   `pnpm build`: Compiles and bundles the application for production.
-   `pnpm test:unit`: Runs the unit tests using Vitest.
-   `pnpm preview`: Serves the production build locally for previewing.

## Project Structure

The project follows a standard Vue 3 + Vite structure:

```
src/
├── components/      # Reusable Vue components (ChatMain, ChatSidebar, Modals)
│   ├── ChatMain.vue
│   ├── ChatRoom.vue
│   ├── ChatSidebar.vue
│   ├── ConfirmDialog.vue
│   └── InviteParticipant.vue
├── composables/     # Reusable composition functions
│   ├── useIdGenerator.ts   # For generating unique IDs
│   └── useLocalStorage.ts  # For persisting state to localStorage
├── data/            # Static data
│   └── bot.ts       # Pre-defined responses for bot participants
├── types/           # TypeScript type definitions
│   └── chat.ts
├── __tests__/       # Unit tests for components
├── App.vue          # Main application component
└── main.ts          # Application entry point
