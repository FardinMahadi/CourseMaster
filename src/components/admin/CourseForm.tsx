'use client';

import type { Course } from '@/types/course.types';

import { z } from 'zod';
import { toast } from 'sonner';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, GripVertical } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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

import { createCourseSchema, updateCourseSchema } from '@/lib/validations/course.schema';

interface Lesson {
  _id?: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

interface Assignment {
  _id?: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: string;
  maxScore: number;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

interface Quiz {
  _id?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore: number;
}

interface CourseFormProps {
  courseId?: string;
  initialData?: {
    course: Course;
    lessons: Lesson[];
    assignments: Assignment[];
    quizzes: Quiz[];
  };
}

export function CourseForm({ courseId, initialData }: CourseFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  // Create extended schema with lessons, assignments, quizzes
  const lessonSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    duration: z.number().min(0),
    order: z.number().min(1),
    isPreview: z.boolean(),
  });

  const assignmentSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    instructions: z.string().min(1),
    dueDate: z.string().optional(),
    maxScore: z.number().min(0),
  });

  const quizQuestionSchema = z.object({
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    correctAnswer: z.number().min(0),
    points: z.number().min(0),
  });

  const quizSchema = z.object({
    _id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    questions: z.array(quizQuestionSchema).min(1),
    timeLimit: z.number().optional(),
    passingScore: z.number().min(0).max(100),
  });

  const formSchema = courseId
    ? updateCourseSchema.extend({
        lessons: z.array(lessonSchema).optional(),
        assignments: z.array(assignmentSchema).optional(),
        quizzes: z.array(quizSchema).optional(),
      })
    : createCourseSchema.extend({
        lessons: z.array(lessonSchema).default([]),
        assignments: z.array(assignmentSchema).default([]),
        quizzes: z.array(quizSchema).default([]),
      });

  type CourseFormData = z.infer<typeof formSchema>;

  const form = useForm<CourseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.course?.title || '',
      description: initialData?.course?.description || '',
      thumbnail: initialData?.course?.thumbnail || '',
      price: initialData?.course?.price || 0,
      category: initialData?.course?.category || '',
      tags: initialData?.course?.tags || [],
      duration: initialData?.course?.duration || 0,
      level: initialData?.course?.level || 'beginner',
      language: initialData?.course?.language || 'English',
      isPublished: initialData?.course?.isPublished || false,
      lessons: initialData?.lessons || [],
      assignments: initialData?.assignments || [],
      quizzes: initialData?.quizzes || [],
    },
  });

  const {
    fields: lessonFields,
    append: appendLesson,
    remove: removeLesson,
  } = useFieldArray({
    control: form.control,
    name: 'lessons',
  });

  const {
    fields: assignmentFields,
    append: appendAssignment,
    remove: removeAssignment,
  } = useFieldArray({
    control: form.control,
    name: 'assignments',
  });

  const {
    fields: quizFields,
    append: appendQuiz,
    remove: removeQuiz,
  } = useFieldArray({
    control: form.control,
    name: 'quizzes',
  });

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues('tags') || [];
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue('tags', [...currentTags, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter(tag => tag !== tagToRemove)
    );
  };

  const onSubmit = async (data: CourseFormData) => {
    try {
      setIsLoading(true);

      const { lessons, assignments, quizzes, ...courseData } = data;

      // Create or update course
      const courseUrl = courseId ? `/api/courses/${courseId}` : '/api/courses';
      const courseMethod = courseId ? 'PUT' : 'POST';

      const courseResponse = await fetch(courseUrl, {
        method: courseMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (!courseResponse.ok) {
        const error = await courseResponse.json();
        throw new Error(error.error || 'Failed to save course');
      }

      const courseResult = await courseResponse.json();
      const savedCourseId = courseId || courseResult.data._id;

      // Save lessons
      if (lessons && lessons.length > 0) {
        await Promise.all(
          lessons.map(async (lesson, index) => {
            const lessonData = {
              ...lesson,
              course: savedCourseId,
              order: index + 1,
            };

            if (lesson._id) {
              // Update existing lesson
              await fetch(`/api/lessons/${lesson._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lessonData),
              });
            } else {
              // Create new lesson
              await fetch('/api/lessons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lessonData),
              });
            }
          })
        );
      }

      // Save assignments
      if (assignments && assignments.length > 0) {
        await Promise.all(
          assignments.map(async assignment => {
            const assignmentData = {
              ...assignment,
              course: savedCourseId,
            };

            if (assignment._id) {
              await fetch(`/api/assignments/admin/${assignment._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData),
              });
            } else {
              await fetch('/api/assignments/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assignmentData),
              });
            }
          })
        );
      }

      // Save quizzes
      if (quizzes && quizzes.length > 0) {
        await Promise.all(
          quizzes.map(async quiz => {
            const quizData = {
              ...quiz,
              course: savedCourseId,
            };

            if (quiz._id) {
              await fetch(`/api/quizzes/admin/${quiz._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData),
              });
            } else {
              await fetch('/api/quizzes/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(quizData),
              });
            }
          })
        );
      }

      toast.success(courseId ? 'Course updated successfully' : 'Course created successfully');
      router.push('/admin/courses');
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save course';
      toast.error(errorMessage);
      console.error('Course save error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Course Information */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Course title" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Course description"
                      rows={4}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Web Development" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
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
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>URL to course thumbnail image</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="English" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Tags</FormLabel>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  disabled={isLoading}
                />
                <Button type="button" onClick={addTag} disabled={isLoading}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch('tags')?.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Publish Course</FormLabel>
                    <FormDescription>Make this course visible to students</FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isLoading}
                      className="h-4 w-4"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Lessons Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lessons</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendLesson({
                  title: '',
                  description: '',
                  videoUrl: '',
                  duration: 0,
                  order: lessonFields.length + 1,
                  isPreview: false,
                })
              }
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Lesson
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessonFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start gap-4">
                  <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Lesson {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLesson(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`lessons.${index}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Lesson title" {...field} disabled={isLoading} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`lessons.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Lesson description"
                              rows={2}
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`lessons.${index}.videoUrl`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Video URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="YouTube/Vimeo URL"
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
                        name={`lessons.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
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
                      name={`lessons.${index}.isPreview`}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={isLoading}
                              className="h-4 w-4"
                            />
                          </FormControl>
                          <FormLabel>Preview Lesson (free to view)</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {lessonFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No lessons added yet. Click &quot;Add Lesson&quot; to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assignments Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assignments</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendAssignment({
                  title: '',
                  description: '',
                  instructions: '',
                  maxScore: 100,
                })
              }
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Assignment
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignmentFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Assignment {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAssignment(index)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`assignments.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Assignment title" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`assignments.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Assignment description"
                            rows={2}
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
                    name={`assignments.${index}.instructions`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Assignment instructions"
                            rows={3}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`assignments.${index}.dueDate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              value={
                                field.value ? new Date(field.value).toISOString().slice(0, 16) : ''
                              }
                              onChange={e =>
                                field.onChange(
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : undefined
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
                      name={`assignments.${index}.maxScore`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Score</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </Card>
            ))}

            {assignmentFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No assignments added yet. Click &quot;Add Assignment&quot; to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quizzes Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Quizzes</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendQuiz({
                  title: '',
                  description: '',
                  questions: [],
                  passingScore: 60,
                })
              }
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quiz
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizFields.map((quizField, quizIndex) => (
              <Card key={quizField.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Quiz {quizIndex + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuiz(quizIndex)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`quizzes.${quizIndex}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Quiz title" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`quizzes.${quizIndex}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Quiz description"
                            rows={2}
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`quizzes.${quizIndex}.timeLimit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time Limit (minutes, optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              value={field.value || ''}
                              onChange={e =>
                                field.onChange(
                                  e.target.value ? parseInt(e.target.value) : undefined
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
                      name={`quizzes.${quizIndex}.passingScore`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passing Score (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <FormLabel>Questions</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentQuestions =
                            form.getValues(`quizzes.${quizIndex}.questions`) || [];
                          form.setValue(`quizzes.${quizIndex}.questions`, [
                            ...currentQuestions,
                            {
                              question: '',
                              options: ['', ''],
                              correctAnswer: 0,
                              points: 1,
                            },
                          ]);
                        }}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Question
                      </Button>
                    </div>

                    {form.watch(`quizzes.${quizIndex}.questions`)?.map((question, qIndex) => (
                      <Card key={qIndex} className="p-4 mb-4">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-medium">Question {qIndex + 1}</h5>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentQuestions =
                                form.getValues(`quizzes.${quizIndex}.questions`) || [];
                              form.setValue(
                                `quizzes.${quizIndex}.questions`,
                                currentQuestions.filter((_, i) => i !== qIndex)
                              );
                            }}
                            disabled={isLoading}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name={`quizzes.${quizIndex}.questions.${qIndex}.question`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Question</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter question"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div>
                            <FormLabel>Options</FormLabel>
                            {form
                              .watch(`quizzes.${quizIndex}.questions.${qIndex}.options`)
                              ?.map((_, optIndex) => (
                                <div key={optIndex} className="flex gap-2 mt-2">
                                  <FormField
                                    control={form.control}
                                    name={`quizzes.${quizIndex}.questions.${qIndex}.options.${optIndex}`}
                                    render={({ field }) => (
                                      <FormItem className="flex-1">
                                        <FormControl>
                                          <Input
                                            placeholder={`Option ${optIndex + 1}`}
                                            {...field}
                                            disabled={isLoading}
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  {(form.watch(`quizzes.${quizIndex}.questions.${qIndex}.options`)
                                    ?.length ?? 0) > 2 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        const currentOptions = form.getValues(
                                          `quizzes.${quizIndex}.questions.${qIndex}.options`
                                        );
                                        if (currentOptions) {
                                          form.setValue(
                                            `quizzes.${quizIndex}.questions.${qIndex}.options`,
                                            currentOptions.filter((_, i) => i !== optIndex)
                                          );
                                        }
                                      }}
                                      disabled={isLoading}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                const currentOptions =
                                  form.getValues(
                                    `quizzes.${quizIndex}.questions.${qIndex}.options`
                                  ) || [];
                                if (currentOptions.length < 6) {
                                  form.setValue(
                                    `quizzes.${quizIndex}.questions.${qIndex}.options`,
                                    [...currentOptions, '']
                                  );
                                }
                              }}
                              disabled={
                                isLoading ||
                                (form.watch(`quizzes.${quizIndex}.questions.${qIndex}.options`)
                                  ?.length || 0) >= 6
                              }
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Option
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name={`quizzes.${quizIndex}.questions.${qIndex}.correctAnswer`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Correct Answer (Option Index)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      max={
                                        (form.watch(
                                          `quizzes.${quizIndex}.questions.${qIndex}.options`
                                        )?.length || 1) - 1
                                      }
                                      {...field}
                                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name={`quizzes.${quizIndex}.questions.${qIndex}.points`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Points</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="0"
                                      {...field}
                                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                      disabled={isLoading}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}

                    {(!form.watch(`quizzes.${quizIndex}.questions`) ||
                      form.watch(`quizzes.${quizIndex}.questions`)?.length === 0) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No questions added yet. Click &quot;Add Question&quot; to get started.
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {quizFields.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No quizzes added yet. Click &quot;Add Quiz&quot; to get started.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Buttons */}
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
            {isLoading ? 'Saving...' : courseId ? 'Update Course' : 'Create Course'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
