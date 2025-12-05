'use client';

import type { AssignmentWithSubmission } from '@/types/student.types';

import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { submitAssignment } from '@/lib/api/assignments';

interface AssignmentCardProps {
  assignment: AssignmentWithSubmission;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(!!assignment.submission);

  const handleSubmit = async () => {
    if (!submissionText && !submissionUrl) {
      toast.error('Please provide either text or a URL');
      return;
    }

    setLoading(true);

    try {
      await submitAssignment({
        assignmentId: assignment._id,
        submissionText: submissionText || undefined,
        submissionUrl: submissionUrl || undefined,
      });

      toast.success('Assignment submitted successfully!');
      setSubmitted(true);
      setSubmissionText('');
      setSubmissionUrl('');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{assignment.title}</CardTitle>
            {assignment.description && (
              <CardDescription className="mt-2">{assignment.description}</CardDescription>
            )}
          </div>
          {submitted && assignment.submission && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Submitted
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Instructions</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {assignment.instructions}
          </p>
        </div>

        {assignment.dueDate && (
          <div>
            <p className="text-sm">
              <span className="font-medium">Due Date:</span>{' '}
              <span className="text-muted-foreground">{formatDate(assignment.dueDate)}</span>
            </p>
          </div>
        )}

        {assignment.submission && (
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Your Submission</h4>
            {assignment.submission.submissionText && (
              <p className="text-sm whitespace-pre-wrap">{assignment.submission.submissionText}</p>
            )}
            {assignment.submission.submissionUrl && (
              <a
                href={assignment.submission.submissionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                View Submission <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {assignment.submission.score !== undefined && (
              <p className="text-sm">
                <span className="font-medium">Score:</span> {assignment.submission.score} /{' '}
                {assignment.maxScore}
              </p>
            )}
            {assignment.submission.feedback && (
              <div>
                <p className="text-sm font-medium mb-1">Feedback:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {assignment.submission.feedback}
                </p>
              </div>
            )}
          </div>
        )}

        {!submitted && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="submission-text">Submission Text (Optional)</Label>
              <Textarea
                id="submission-text"
                placeholder="Enter your answer here..."
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submission-url">Or Google Drive Link (Optional)</Label>
              <Input
                id="submission-url"
                type="url"
                placeholder="https://drive.google.com/..."
                value={submissionUrl}
                onChange={e => setSubmissionUrl(e.target.value)}
              />
            </div>
          </div>
        )}
      </CardContent>

      {!submitted && (
        <CardFooter>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Assignment'
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
