import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { handleApiError } from '@/lib/api-error-handler';
import { courseListQuerySchema, createCourseSchema } from '@/lib/validations/course.schema';
import {
  generateCacheKey,
  getCachedData,
  invalidateCourseListCache,
  setCachedData,
} from '@/lib/cache';

import User from '@/models/User';
import Course from '@/models/Course';

// GET /api/courses - List courses with pagination, search, filter, and sort
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
      sort: searchParams.get('sort') || undefined,
      category: searchParams.get('category') || undefined,
      tags: searchParams.get('tags') || undefined,
      level: searchParams.get('level') || undefined,
    };

    const validatedQuery = courseListQuerySchema.parse(queryParams);

    // Try to get cached data
    const cacheKey = generateCacheKey(validatedQuery);
    const cachedData = await getCachedData<{
      courses: unknown[];
      pagination: {
        currentPage: number;
        totalPages: number;
        total: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    }>(cacheKey);

    if (cachedData) {
      return NextResponse.json(
        {
          data: cachedData,
        },
        { status: 200 }
      );
    }

    // Build filter object
    const filter: Record<string, unknown> & {
      $or?: Array<Record<string, unknown>>;
    } = {
      isPublished: true, // Only show published courses to public
    };

    // Search filter (by title or instructor name)
    if (validatedQuery.search) {
      const searchRegex = new RegExp(validatedQuery.search, 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];

      // Also search by instructor name
      const instructors = await User.find({
        name: searchRegex,
        role: 'admin',
      }).select('_id');

      if (instructors.length > 0) {
        const instructorIds = instructors.map(inst => inst._id);
        if (filter.$or) {
          filter.$or.push({ instructor: { $in: instructorIds } });
        } else {
          filter.instructor = { $in: instructorIds };
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
    let sort: Record<string, 1 | -1> = { createdAt: -1 }; // Default: newest first

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
        default:
          sort = { createdAt: -1 };
      }
    }

    // Calculate pagination
    const page = validatedQuery.page;
    const limit = validatedQuery.limit;
    const skip = (page - 1) * limit;

    // Get total count
    const total = await Course.countDocuments(filter);

    // Fetch courses with pagination
    const courses = await Course.find(filter)
      .populate('instructor', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    const responseData = {
      courses,
      pagination: {
        currentPage: page,
        totalPages,
        total,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    // Cache the response data
    await setCachedData(cacheKey, responseData);

    return NextResponse.json(
      {
        data: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, 'course listing');
  }
}

// POST /api/courses - Create course (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Get admin user ID from middleware headers
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createCourseSchema.parse(body);

    // Verify instructor exists and is admin
    const instructor = await User.findById(userId);
    if (!instructor || instructor.role !== 'admin') {
      return NextResponse.json({ error: 'Invalid instructor' }, { status: 400 });
    }

    // Create course
    const course = new Course({
      ...validatedData,
      instructor: userId,
    });

    await course.save();

    // Populate instructor for response
    await course.populate('instructor', 'name email');

    // Invalidate course list cache since a new course was created
    await invalidateCourseListCache();

    return NextResponse.json(
      {
        message: 'Course created successfully',
        data: course.toJSON(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, 'course creation');
  }
}
