'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';

import { Button } from '../ui/button';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
      params.set('page', '1'); // Reset to first page
    } else {
      params.delete('search');
      params.set('page', '1');
    }
    router.push(`/courses?${params.toString()}`);
  };

  return (
    <form className="flex gap-2" onSubmit={handleSearch}>
      <Input
        className="flex-1"
        placeholder="Search courses by title, description, or instructor..."
        type="search"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
      />
      <Button type="submit">Search</Button>
    </form>
  );
}
