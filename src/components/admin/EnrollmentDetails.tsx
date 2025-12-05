'use client';

import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface EnrollmentDetailsProps {
  enrollment: {
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
    };
    course: {
      _id: string;
      title: string;
    };
    batch?: {
      _id: string;
      name: string;
    } | null;
    enrolledAt: string;
    status: 'enrolled' | 'completed' | 'dropped';
  };
  progress?: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
}

export function EnrollmentDetails({ enrollment, progress }: EnrollmentDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Student</h3>
            <p className="text-lg font-semibold">{enrollment.student.name}</p>
            <p className="text-sm text-muted-foreground">{enrollment.student.email}</p>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Course</h3>
            <p className="text-lg font-semibold">{enrollment.course.title}</p>
          </div>

          {enrollment.batch && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Batch</h3>
                <p className="text-lg font-semibold">{enrollment.batch.name}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <Badge
                variant={
                  enrollment.status === 'enrolled'
                    ? 'default'
                    : enrollment.status === 'completed'
                      ? 'secondary'
                      : 'outline'
                }
                className="mt-2"
              >
                {enrollment.status}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Enrolled At</h3>
              <p className="text-sm mt-2">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
            </div>
          </div>

          {progress && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lessons Completed</span>
                    <span>
                      {progress.completedLessons} / {progress.totalLessons}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{progress.percentage}% Complete</p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
