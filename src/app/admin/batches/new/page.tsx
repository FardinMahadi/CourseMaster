import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { BatchForm } from '@/components/admin/BatchForm';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import Course from '@/models/Course';

async function getAdminCourses(adminId: string) {
  await connectDB();

  const courses = await Course.find({ instructor: adminId })
    .select('_id title')
    .sort({ title: 1 })
    .lean();

  return courses.map(course => ({
    _id: course._id.toString(),
    title: course.title,
  }));
}

export default async function CreateBatchPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/admin-login');
  }

  let adminId: string;
  try {
    const payload = verifyToken(token);
    adminId = payload.userId;

    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/admin-login');
  }

  const courses = await getAdminCourses(adminId);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Batch</h1>
        <p className="text-muted-foreground mt-2">Fill in the details to create a new batch.</p>
      </div>
      <BatchForm courses={courses} />
    </div>
  );
}
