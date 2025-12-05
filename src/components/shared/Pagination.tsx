'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({ currentPage, totalPages, hasNextPage, hasPrevPage }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/courses?${params.toString()}`);
  };

  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        disabled={!hasPrevPage}
        onClick={() => changePage(currentPage - 1)}
        size="sm"
        variant="outline"
      >
        Previous
      </Button>
      <div className="flex gap-1">
        {getPageNumbers().map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span className="px-2 py-1 text-muted-foreground" key={`ellipsis-${index}`}>
                ...
              </span>
            );
          }
          return (
            <Button
              key={page}
              onClick={() => changePage(page as number)}
              size="sm"
              variant={currentPage === page ? 'default' : 'outline'}
            >
              {page}
            </Button>
          );
        })}
      </div>
      <Button
        disabled={!hasNextPage}
        onClick={() => changePage(currentPage + 1)}
        size="sm"
        variant="outline"
      >
        Next
      </Button>
    </div>
  );
}
