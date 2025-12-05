'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const COURSE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

interface FilterPanelProps {
  categories?: string[];
}

export function FilterPanel({ categories = [] }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';
  const currentLevel = searchParams.get('level') || '';

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // Handle special "all" value to clear filter
    if (value === 'all') {
      params.delete(key);
    } else if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/courses?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    params.delete('level');
    params.delete('tags');
    params.set('page', '1');
    router.push(`/courses?${params.toString()}`);
  };

  const hasActiveFilters = currentCategory || currentLevel;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button onClick={clearFilters} size="sm" variant="ghost">
            Clear
          </Button>
        )}
      </div>
      <Separator />
      <div className="space-y-4">
        {categories.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-medium">Category</label>
            <Select
              onValueChange={value => updateFilter('category', value)}
              value={currentCategory || 'all'}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium">Level</label>
          <Select
            onValueChange={value => updateFilter('level', value)}
            value={currentLevel || 'all'}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {COURSE_LEVELS.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {currentCategory && (
              <Badge variant="secondary" className="gap-1">
                {currentCategory}
                <button
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                  onClick={() => updateFilter('category', '')}
                  type="button"
                >
                  ×
                </button>
              </Badge>
            )}
            {currentLevel && (
              <Badge variant="secondary" className="gap-1">
                {COURSE_LEVELS.find(l => l.value === currentLevel)?.label}
                <button
                  className="ml-1 rounded-full hover:bg-secondary-foreground/20"
                  onClick={() => updateFilter('level', '')}
                  type="button"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
