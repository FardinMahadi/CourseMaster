import type { Course } from '@/types/course.types';

import { Suspense } from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { SearchBar } from '@/components/course/SearchBar';
import { Pagination } from '@/components/shared/Pagination';
import { SortSelect } from '@/components/course/SortSelect';
import { CourseGrid } from '@/components/course/CourseGrid';
import { FilterPanel } from '@/components/course/FilterPanel';

import connectDB from '@/lib/db';
import { courseListQuerySchema } from '@/lib/validations/course.schema';

import User from '@/models/User';
import CourseModel from '@/models/Course';

async function getCourses(searchParams: {
  page?: string;
  limit?: string;
  search?: string;
  sort?: string;
  category?: string;
  tags?: string;
  level?: string;
}): Promise<{
  courses: Course[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}> {
  await connectDB();

  const queryParams = {
    page: searchParams.page || undefined,
    limit: searchParams.limit || undefined,
    search: searchParams.search || undefined,
    sort: searchParams.sort || undefined,
    category: searchParams.category || undefined,
    tags: searchParams.tags || undefined,
    level: searchParams.level || undefined,
  };

  const validatedQuery = courseListQuerySchema.parse(queryParams);

  // Build filter object
  const filter: Record<string, unknown> & {
    $or?: Array<Record<string, unknown>>;
  } = {
    isPublished: true,
  };

  // Search filter
  if (validatedQuery.search) {
    const searchRegex = new RegExp(validatedQuery.search, 'i');
    filter.$or = [{ title: searchRegex }, { description: searchRegex }];

    const instructors = await User.find({
      name: searchRegex,
      role: 'admin',
    }).select('_id');

    if (instructors.length > 0) {
      const instructorIds = instructors.map(inst => inst._id);
      if (filter.$or) {
        filter.$or.push({ instructor: { $in: instructorIds } });
      }
    }
  }

  // Category filter
  if (validatedQuery.category) {
    filter.category = validatedQuery.category;
  }

  // Tags filter
  if (validatedQuery.tags && validatedQuery.tags.length > 0) {
    filter.tags = { $in: validatedQuery.tags };
  }

  // Level filter
  if (validatedQuery.level) {
    filter.level = validatedQuery.level;
  }

  // Build sort object
  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (validatedQuery.sort) {
    switch (validatedQuery.sort) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'title-asc':
        sort = { title: 1 };
        break;
      case 'title-desc':
        sort = { title: -1 };
        break;
    }
  }

  // Pagination
  const page = validatedQuery.page;
  const limit = validatedQuery.limit;
  const skip = (page - 1) * limit;

  const total = await CourseModel.countDocuments(filter);
  const courses = await CourseModel.find(filter)
    .populate('instructor', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  const totalPages = Math.ceil(total / limit);

  return {
    courses: courses.map(course => {
      const instructor =
        typeof course.instructor === 'object' &&
        course.instructor !== null &&
        'name' in course.instructor &&
        'email' in course.instructor
          ? {
              _id: course.instructor._id.toString(),
              name: course.instructor.name as string,
              email: course.instructor.email as string,
            }
          : course.instructor.toString();

      return {
        ...course,
        _id: course._id.toString(),
        instructor,
      };
    }) as Course[],
    pagination: {
      currentPage: page,
      totalPages,
      total,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

async function getCategories(): Promise<string[]> {
  await connectDB();

  const categories = await CourseModel.distinct('category', { isPublished: true });
  return categories;
}

function CourseListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4 rounded-lg border p-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    sort?: string;
    category?: string;
    tags?: string;
    level?: string;
  }>;
}) {
  const params = await searchParams;
  const [coursesData, categories] = await Promise.all([getCourses(params), getCategories()]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">Browse Courses</h1>
        <p className="text-muted-foreground">
          Discover our comprehensive collection of courses designed to help you learn and grow.
        </p>
      </div>

      <div className="mb-6">
        <SearchBar />
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <FilterPanel categories={categories} />
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {coursesData.pagination.total} course{coursesData.pagination.total !== 1 ? 's' : ''}{' '}
              found
            </p>
            <SortSelect />
          </div>

          <Suspense fallback={<CourseListSkeleton />}>
            <CourseGrid courses={coursesData.courses} />
          </Suspense>

          {coursesData.pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={coursesData.pagination.currentPage}
                hasNextPage={coursesData.pagination.hasNextPage}
                hasPrevPage={coursesData.pagination.hasPrevPage}
                totalPages={coursesData.pagination.totalPages}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
