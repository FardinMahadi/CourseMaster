'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') || '';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    // Handle special "default" value to clear sort
    if (value === 'default') {
      params.delete('sort');
    } else if (value) {
      params.set('sort', value);
    } else {
      params.delete('sort');
    }
    params.set('page', '1'); // Reset to first page
    router.push(`/courses?${params.toString()}`);
  };

  return (
    <Select onValueChange={handleSortChange} value={currentSort || 'default'}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default">Default (Newest)</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="title-asc">Title: A to Z</SelectItem>
        <SelectItem value="title-desc">Title: Z to A</SelectItem>
      </SelectContent>
    </Select>
  );
}
