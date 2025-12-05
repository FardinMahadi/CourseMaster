'use client';

import { toast } from 'sonner';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  FormDescription,
} from '@/components/ui/form';

import {
  createBatchSchema,
  updateBatchSchema,
  type CreateBatchInput,
  type UpdateBatchInput,
} from '@/lib/validations/batch.schema';

interface BatchFormProps {
  batchId?: string;
  initialData?: {
    name: string;
    course: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    status?: 'upcoming' | 'ongoing' | 'completed';
  };
  courses: Array<{ _id: string; title: string }>;
}

export function BatchForm({ batchId, initialData, courses }: BatchFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateBatchInput | UpdateBatchInput>({
    resolver: zodResolver(batchId ? updateBatchSchema : createBatchSchema),
    defaultValues: {
      course: initialData?.course || '',
      name: initialData?.name || '',
      startDate: initialData?.startDate
        ? new Date(initialData.startDate).toISOString().slice(0, 16)
        : '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
      maxStudents: initialData?.maxStudents || 10,
    },
  });

  const onSubmit = async (data: CreateBatchInput | UpdateBatchInput) => {
    try {
      setIsLoading(true);

      // Convert dates to ISO strings
      const submitData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      };

      const url = batchId ? `/api/batches/${batchId}` : '/api/batches';
      const method = batchId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save batch');
      }

      toast.success(batchId ? 'Batch updated successfully' : 'Batch created successfully');
      router.push('/admin/batches');
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save batch';
      toast.error(errorMessage);
      console.error('Batch save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{batchId ? 'Edit Batch' : 'Create Batch'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!batchId && (
              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Batch 2025-01" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value).toISOString() : ''
                          )
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                        onChange={e =>
                          field.onChange(
                            e.target.value ? new Date(e.target.value).toISOString() : ''
                          )
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxStudents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Students</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of students that can enroll in this batch
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : batchId ? 'Update Batch' : 'Create Batch'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
