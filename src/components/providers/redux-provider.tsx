'use client';

import type { AppStore } from '@/store/store';

import { useMemo } from 'react';
import { Provider } from 'react-redux';

import { makeStore } from '@/store/store';

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const store = useMemo<AppStore>(() => makeStore(), []);

  return <Provider store={store}>{children}</Provider>;
}
