import { create } from 'zustand';

interface PresenceMember {
  id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
}

interface PresenceState {
  members: PresenceMember[];
  setMembers: (members: PresenceMember[]) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  members: [],
  setMembers: (members) => set({ members }),
}));