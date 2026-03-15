import { create } from 'zustand'

type KanbanState = {
  selectedActivityId: string | null
  setSelectedActivity: (id: string | null) => void
  isPanelOpen: boolean
}

export const useKanbanStore = create<KanbanState>((set) => ({
  selectedActivityId: null,
  isPanelOpen: false,
  setSelectedActivity: (id) => set({ selectedActivityId: id, isPanelOpen: id !== null }),
}))
