import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AssignmentReviewForm } from '@/components/admin/AssignmentReviewForm';

import connectDB from '@/lib/db';
import { verifyToken } from '@/lib/auth';

import Course from '@/models/Course';
import Submission from '@/models/Submission';
import Assignment from '@/models/Assignment';

import {
  extractId,
  isPopulated,
  type PopulatedUser,
  type PopulatedAssignment,
  type PopulatedCourse,
} from '@/types/populated.types';

async function getSubmissionData(submissionId: string, adminId: string) {
  await connectDB();

  const submission = await Submission.findById(submissionId)
    .populate('assignment', 'title description instructions maxScore')
    .populate('student', 'name email')
    .populate({
      path: 'assignment',
      populate: {
        path: 'course',
        select: 'title',
      },
    })
    .lean();

  if (!submission) {
    return null;
  }

  // Verify admin owns the course
  const assignmentDoc = await Assignment.findById(submission.assignment);
  if (!assignmentDoc) {
    return null;
  }

  const courseDoc = await Course.findById(assignmentDoc.course);
  if (!courseDoc || courseDoc.instructor.toString() !== adminId) {
    return null;
  }

  const populatedAssignment = isPopulated(submission.assignment)
    ? (submission.assignment as unknown as PopulatedAssignment)
    : null;
  const populatedStudent = isPopulated(submission.student)
    ? (submission.student as unknown as PopulatedUser)
    : null;
  const populatedCourse =
    populatedAssignment && populatedAssignment.course && isPopulated(populatedAssignment.course)
      ? (populatedAssignment.course as unknown as PopulatedCourse)
      : null;

  return {
    _id: submission._id.toString(),
    assignment: {
      _id: populatedAssignment ? extractId(populatedAssignment._id) : '',
      title: populatedAssignment ? String(populatedAssignment.title || '') : '',
      description: populatedAssignment ? String(populatedAssignment.description || '') : '',
      instructions: populatedAssignment ? String(populatedAssignment.instructions || '') : '',
      maxScore: populatedAssignment ? Number(populatedAssignment.maxScore || 100) : 100,
      course: populatedCourse
        ? {
            _id: extractId(populatedCourse._id),
            title: String(populatedCourse.title || ''),
          }
        : null,
    },
    student: {
      _id: populatedStudent ? extractId(populatedStudent._id) : '',
      name: populatedStudent ? String(populatedStudent.name || '') : '',
      email: populatedStudent ? String(populatedStudent.email || '') : '',
    },
    submissionText: submission.submissionText,
    submissionUrl: submission.submissionUrl,
    submittedAt: submission.submittedAt,
    gradedAt: submission.gradedAt,
    score: submission.score,
    feedback: submission.feedback,
    status: submission.status,
  };
}

export default async function AssignmentReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const submissionData = await getSubmissionData(id, adminId);

  if (!submissionData) {
    redirect('/admin/assignments');
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Review Assignment</h1>
        <p className="text-muted-foreground mt-2">Review and grade student submission.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Assignment Details</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Course</p>
                <p className="font-medium">{submissionData.assignment.course?.title || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assignment</p>
                <p className="font-medium">{submissionData.assignment.title}</p>
              </div>
              {submissionData.assignment.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{submissionData.assignment.description}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Instructions</p>
                <p className="text-sm whitespace-pre-wrap">
                  {submissionData.assignment.instructions}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maximum Score</p>
                <p className="font-medium">{submissionData.assignment.maxScore} points</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Student Information</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{submissionData.student.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm">{submissionData.student.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Submitted At</p>
                <p className="text-sm">{new Date(submissionData.submittedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Submission</h2>
            <div className="space-y-4">
              {submissionData.submissionText && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Text Submission</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{submissionData.submissionText}</p>
                  </div>
                </div>
              )}

              {submissionData.submissionUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Link Submission</p>
                  <a
                    href={submissionData.submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {submissionData.submissionUrl}
                  </a>
                </div>
              )}

              {submissionData.score !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Current Score</p>
                  <p className="text-lg font-semibold">
                    {submissionData.score} / {submissionData.assignment.maxScore}
                  </p>
                </div>
              )}

              {submissionData.feedback && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Previous Feedback</p>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{submissionData.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AssignmentReviewForm
            submissionId={id}
            maxScore={submissionData.assignment.maxScore}
            currentScore={submissionData.score}
            currentFeedback={submissionData.feedback}
            currentStatus={submissionData.status}
          />
        </div>
      </div>
    </div>
  );
}
