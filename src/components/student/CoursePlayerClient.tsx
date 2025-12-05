'use client';

import type { Lesson as LessonType } from '@/types/course.types';
import type {
  AssignmentWithSubmission,
  CourseWithProgress,
  Quiz as QuizType,
} from '@/types/student.types';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { QuizCard } from '@/components/student/QuizCard';
import { LessonContent } from '@/components/student/LessonContent';
import { LessonSidebar } from '@/components/student/LessonSidebar';
import { AssignmentCard } from '@/components/student/AssignmentCard';
import { LessonNavigation } from '@/components/student/LessonNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CoursePlayerClientProps {
  course: CourseWithProgress;
  lessons: LessonType[];
  completedLessonIds: string[]; // Accept array for serialization
  assignmentsWithSubmissions: AssignmentWithSubmission[];
  quizzes: QuizType[];
  currentLessonId: string;
  courseId: string;
}

export function CoursePlayerClient({
  course,
  lessons,
  completedLessonIds,
  assignmentsWithSubmissions,
  quizzes,
  currentLessonId,
  courseId,
}: CoursePlayerClientProps) {
  const router = useRouter();
  // Convert array to Set for efficient lookups
  const completedLessonIdsSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const currentLessonIndex = lessons.findIndex(l => l._id === currentLessonId);
  const currentLesson = lessons[currentLessonIndex >= 0 ? currentLessonIndex : 0];
  const isCompleted = completedLessonIdsSet.has(currentLesson._id);

  const handleLessonClick = (lessonId: string) => {
    router.push(`/learn/${courseId}?lesson=${lessonId}`);
  };

  const handlePrevious = () => {
    if (currentLessonIndex > 0) {
      router.push(`/learn/${courseId}?lesson=${lessons[currentLessonIndex - 1]._id}`);
    }
  };

  const handleNext = () => {
    if (currentLessonIndex < lessons.length - 1) {
      router.push(`/learn/${courseId}?lesson=${lessons[currentLessonIndex + 1]._id}`);
    }
  };

  const handleComplete = () => {
    // Refresh to update progress
    router.refresh();
  };

  return (
    <div className="flex h-screen">
      <LessonSidebar
        lessons={lessons}
        currentLessonId={currentLesson._id}
        completedLessonIds={completedLessonIdsSet}
        onLessonClick={handleLessonClick}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-muted-foreground">{course.description}</p>
          </div>

          <Tabs defaultValue="lesson" className="space-y-6">
            <TabsList>
              <TabsTrigger value="lesson">Lesson</TabsTrigger>
              <TabsTrigger value="assignments">
                Assignments ({assignmentsWithSubmissions.length})
              </TabsTrigger>
              <TabsTrigger value="quizzes">Quizzes ({quizzes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="lesson" className="space-y-6">
              <LessonContent
                lesson={currentLesson}
                courseId={courseId}
                isCompleted={isCompleted}
                onComplete={handleComplete}
              />

              <LessonNavigation
                lessons={lessons}
                currentLessonIndex={currentLessonIndex >= 0 ? currentLessonIndex : 0}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            </TabsContent>

            <TabsContent value="assignments" className="space-y-4">
              {assignmentsWithSubmissions.length === 0 ? (
                <p className="text-muted-foreground">No assignments for this course.</p>
              ) : (
                assignmentsWithSubmissions.map(assignment => (
                  <AssignmentCard key={assignment._id} assignment={assignment} />
                ))
              )}
            </TabsContent>

            <TabsContent value="quizzes" className="space-y-4">
              {quizzes.length === 0 ? (
                <p className="text-muted-foreground">No quizzes for this course.</p>
              ) : (
                quizzes.map(quiz => <QuizCard key={quiz._id} quiz={quiz as any} />)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
