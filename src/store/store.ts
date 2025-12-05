import { configureStore } from '@reduxjs/toolkit';

import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      course: courseReducer,
      ui: uiReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
