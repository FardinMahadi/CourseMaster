import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CourseForm } from '@/components/admin/CourseForm';

import { verifyToken } from '@/lib/auth';

export default async function CreateCoursePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/admin-login');
  }

  try {
    const payload = verifyToken(token);

    if (payload.role !== 'admin') {
      redirect('/dashboard');
    }
  } catch {
    redirect('/admin-login');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-2">Fill in the details to create a new course.</p>
      </div>
      <CourseForm />
    </div>
  );
}
