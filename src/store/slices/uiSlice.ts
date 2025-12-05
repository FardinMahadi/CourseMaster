import type { PayloadAction } from '@reduxjs/toolkit';

import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  theme: 'light' | 'dark' | 'system';
}

const initialState: UIState = {
  sidebarOpen:
    typeof window !== 'undefined' ? localStorage.getItem('sidebarOpen') === 'true' : false,
  activeModal: null,
  theme: (typeof window !== 'undefined' ? localStorage.getItem('theme') : 'system') as
    | 'light'
    | 'dark'
    | 'system',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: state => {
      state.sidebarOpen = !state.sidebarOpen;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarOpen', state.sidebarOpen.toString());
      }
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebarOpen', action.payload.toString());
      }
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: state => {
      state.activeModal = null;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', action.payload);
      }
    },
  },
});

export const { toggleSidebar, setSidebarOpen, openModal, closeModal, setTheme } = uiSlice.actions;
export default uiSlice.reducer;
