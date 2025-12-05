'use client';

import type { Progress, AssignmentSubmission, QuizAttempt } from '@/types/student.types';

import { CheckCircle2, FileText, HelpCircle } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentActivityProps {
  recentProgress?: Progress[];
  recentSubmissions?: AssignmentSubmission[];
  recentQuizAttempts?: QuizAttempt[];
}

export function RecentActivity({
  recentProgress,
  recentSubmissions,
  recentQuizAttempts,
}: RecentActivityProps) {
  const activities: Array<{
    type: 'progress' | 'submission' | 'quiz';
    title: string;
    description: string;
    date: Date;
    icon: React.ReactNode;
  }> = [];

  // Add progress activities
  recentProgress?.forEach(progress => {
    if (progress.isCompleted && progress.completedAt) {
      activities.push({
        type: 'progress',
        title: 'Lesson Completed',
        description: 'You completed a lesson',
        date: new Date(progress.completedAt),
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    }
  });

  // Add submission activities
  recentSubmissions?.forEach(submission => {
    activities.push({
      type: 'submission',
      title: 'Assignment Submitted',
      description: 'You submitted an assignment',
      date: new Date(submission.submittedAt),
      icon: <FileText className="h-4 w-4" />,
    });
  });

  // Add quiz activities
  recentQuizAttempts?.forEach(attempt => {
    activities.push({
      type: 'quiz',
      title: 'Quiz Completed',
      description: `You scored ${attempt.score}% on a quiz`,
      date: new Date(attempt.completedAt || attempt.startedAt),
      icon: <HelpCircle className="h-4 w-4" />,
    });
  });

  // Sort by date (most recent first)
  activities.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Get top 5
  const topActivities = activities.slice(0, 5);

  if (topActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-0.5 text-muted-foreground">{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
