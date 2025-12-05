import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { BatchForm } from '@/components/admin/BatchForm';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import Batch from '@/models/Batch';
import Course from '@/models/Course';

async function getBatchData(batchId: string, adminId: string) {
  await connectDB();

  const batch = await Batch.findById(batchId).populate('course').lean();

  if (!batch) {
    return null;
  }

  const course = await Course.findById(batch.course);
  if (!course || course.instructor.toString() !== adminId) {
    return null;
  }

  return {
    name: batch.name,
    course: batch.course.toString(),
    startDate: new Date(batch.startDate).toISOString(),
    endDate: new Date(batch.endDate).toISOString(),
    maxStudents: batch.maxStudents,
    status: batch.status,
  };
}

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

export default async function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const batchData = await getBatchData(id, adminId);
  const courses = await getAdminCourses(adminId);

  if (!batchData) {
    redirect('/admin/batches');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Batch</h1>
        <p className="text-muted-foreground mt-2">Update batch details.</p>
      </div>
      <BatchForm batchId={id} initialData={batchData} courses={courses} />
    </div>
  );
}
