'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { useTheme } from '@/hooks/use-theme';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Initialize mounted state to prevent hydration mismatch
    const initialize = () => {
      setMounted(true);
    };
    initialize();
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-9">
        <div className="size-4" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="size-4" />;
    }
    return resolvedTheme === 'dark' ? <Moon className="size-4" /> : <Sun className="size-4" />;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="size-9 transition-all duration-300"
      aria-label="Toggle theme"
    >
      <div className="relative size-4">
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
          }`}
        >
          <Sun className="size-4" />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
          }`}
        >
          <Moon className="size-4" />
        </div>
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-180 scale-0 opacity-0'
          }`}
        >
          <Monitor className="size-4" />
        </div>
      </div>
    </Button>
  );
}
