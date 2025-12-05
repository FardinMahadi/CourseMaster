import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { courseListQuerySchema, createCourseSchema } from '@/lib/validations/course.schema';

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

    return NextResponse.json(
      {
        data: {
          courses,
          pagination: {
            currentPage: page,
            totalPages,
            total,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during course listing:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Course listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    return NextResponse.json(
      {
        message: 'Course created successfully',
        data: course.toJSON(),
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during course creation:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error instanceof Error && (error as any).code === 11000) {
      return NextResponse.json(
        {
          error: 'Course with this title already exists',
        },
        { status: 409 }
      );
    }

    // Handle other errors
    console.error('Course creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
