import { create } from 'zustand';
import { DEFAULT_EDIT_STATE, type EditState } from '@ymshots/types';

interface EditStoreState {
  // Current edit state
  current: EditState;
  setCurrent: (state: EditState) => void;
  updateField: <K extends keyof EditState>(key: K, value: EditState[K]) => void;
  reset: () => void;

  // Undo/redo
  history: EditState[];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Before/after compare
  isComparing: boolean;
  setComparing: (v: boolean) => void;
}

export const useEditStore = create<EditStoreState>((set, get) => ({
  current: { ...DEFAULT_EDIT_STATE },
  setCurrent: (state) => {
    const { history, historyIndex } = get();
    const newHistory = [...history.slice(0, historyIndex + 1), state];
    set({ current: state, history: newHistory, historyIndex: newHistory.length - 1 });
  },
  updateField: (key, value) => {
    const next = { ...get().current, [key]: value };
    get().setCurrent(next);
  },
  reset: () => {
    const fresh = { ...DEFAULT_EDIT_STATE };
    set({ current: fresh, history: [fresh], historyIndex: 0 });
  },

  history: [{ ...DEFAULT_EDIT_STATE }],
  historyIndex: 0,
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      set({ historyIndex: historyIndex - 1, current: history[historyIndex - 1] });
    }
  },
  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      set({ historyIndex: historyIndex + 1, current: history[historyIndex + 1] });
    }
  },
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  isComparing: false,
  setComparing: (v) => set({ isComparing: v }),
}));
