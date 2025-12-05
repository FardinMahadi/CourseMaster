import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { handleAuthError, requireAdmin } from '@/lib/auth-helpers';

import User from '@/models/User';
import Course from '@/models/Course';
import Progress from '@/models/Progress';
import Enrollment from '@/models/Enrollment';

// GET /api/analytics - Get analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication and admin role
    requireAdmin(request);

    // Get date range (default: last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Enrollment trends (daily for the last N days)
    const enrollmentTrends = await Enrollment.aggregate([
      {
        $match: {
          enrolledAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$enrolledAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Course creation trends
    const courseTrends = await Course.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Enrollment by course (top courses)
    const enrollmentsByCourse = await Enrollment.aggregate([
      {
        $group: {
          _id: '$course',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: '$course',
      },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          enrollmentCount: '$count',
        },
      },
    ]);

    // Enrollment by category
    const enrollmentsByCategory = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: '$course',
      },
      {
        $group: {
          _id: '$course.category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Student registration trends
    const studentTrends = await User.aggregate([
      {
        $match: {
          role: 'student',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Course completion rate
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });
    const completionRate =
      totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    // Average progress per course
    const averageProgress = await Progress.aggregate([
      {
        $group: {
          _id: '$course',
          completedLessons: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course',
        },
      },
      {
        $unwind: '$course',
      },
      {
        $lookup: {
          from: 'lessons',
          localField: '_id',
          foreignField: 'course',
          as: 'lessons',
        },
      },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          completedLessons: 1,
          totalLessons: { $size: '$lessons' },
        },
      },
      {
        $project: {
          courseId: 1,
          courseTitle: 1,
          progressPercentage: {
            $cond: [
              { $gt: ['$totalLessons', 0] },
              { $multiply: [{ $divide: ['$completedLessons', '$totalLessons'] }, 100] },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageProgress: { $avg: '$progressPercentage' },
        },
      },
    ]);

    return NextResponse.json(
      {
        message: 'Analytics data retrieved successfully',
        data: {
          enrollmentTrends: enrollmentTrends.map(item => ({
            date: item._id,
            count: item.count,
          })),
          courseTrends: courseTrends.map(item => ({
            date: item._id,
            count: item.count,
          })),
          studentTrends: studentTrends.map(item => ({
            date: item._id,
            count: item.count,
          })),
          enrollmentsByCourse: enrollmentsByCourse.map(item => ({
            courseId: item.courseId.toString(),
            courseTitle: item.courseTitle,
            enrollmentCount: item.enrollmentCount,
          })),
          enrollmentsByCategory: enrollmentsByCategory.map(item => ({
            category: item._id,
            count: item.count,
          })),
          completionRate: Math.round(completionRate * 100) / 100,
          averageProgress:
            averageProgress.length > 0
              ? Math.round(averageProgress[0].averageProgress * 100) / 100
              : 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (handleAuthError(error)) {
      return handleAuthError(error) as NextResponse;
    }

    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
