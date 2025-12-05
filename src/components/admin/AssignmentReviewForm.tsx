'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import {
  gradeAssignmentSchema,
  type GradeAssignmentInput,
} from '@/lib/validations/assignment.schema';

interface AssignmentReviewFormProps {
  submissionId: string;
  maxScore: number;
  currentScore?: number;
  currentFeedback?: string;
  currentStatus?: 'submitted' | 'graded' | 'returned';
}

export function AssignmentReviewForm({
  submissionId,
  maxScore,
  currentScore,
  currentFeedback,
  currentStatus,
}: AssignmentReviewFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<GradeAssignmentInput>({
    resolver: zodResolver(gradeAssignmentSchema),
    defaultValues: {
      score: currentScore ?? 0,
      feedback: currentFeedback ?? '',
      status: currentStatus ?? 'graded',
    },
  });

  const onSubmit = async (data: GradeAssignmentInput) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/assignments/admin/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grade assignment');
      }

      toast.success('Assignment graded successfully');
      router.push('/admin/assignments');
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to grade assignment';
      toast.error(errorMessage);
      console.error('Grading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grade Assignment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="score"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Score</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max={maxScore}
                      {...field}
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">Maximum: {maxScore} points</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide feedback to the student..."
                      rows={6}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="graded">Graded</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Grading...' : 'Submit Grade'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
