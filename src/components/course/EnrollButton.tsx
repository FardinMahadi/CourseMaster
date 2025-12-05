'use client';

import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

import { checkEnrollment, enrollInCourse } from '@/lib/api/enrollments';

import { useAppDispatch } from '@/store/hooks';
import { clearUser } from '@/store/slices/authSlice';

import { useAuth } from '@/hooks/useAuth';

interface EnrollButtonProps {
  courseId: string;
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading: authLoading, initialized } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check enrollment status on mount and when auth state changes
  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      if (!isAuthenticated || !courseId) {
        setIsEnrolled(false);
        return;
      }

      setIsChecking(true);
      try {
        const enrollment = await checkEnrollment(courseId);
        setIsEnrolled(!!enrollment);
      } catch (err) {
        // Silently fail - user might not be authenticated
        setIsEnrolled(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkEnrollmentStatus();
  }, [isAuthenticated, courseId]);

  const handleEnroll = async () => {
    // Wait for auth to be initialized
    if (!initialized || authLoading) {
      toast.info('Please wait while we verify your authentication...');
      return;
    }

    // Double-check authentication before proceeding
    if (!isAuthenticated || !user) {
      toast.error('Please log in to enroll in courses');
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }

    // Ensure user is a student
    if (user.role !== 'student') {
      toast.error('Only students can enroll in courses');
      return;
    }

    if (isEnrolled) {
      // If already enrolled, redirect to course player
      router.push(`/learn/${courseId}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await enrollInCourse(courseId);
      setIsEnrolled(true);

      // Show success message
      toast.success('Successfully enrolled in course!');

      // Redirect to course player
      router.push(`/learn/${courseId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enroll in course';
      setError(errorMessage);

      // Handle specific error cases
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('401')) {
        // Clear stale auth state
        dispatch(clearUser());
        toast.error('Your session has expired. Please log in again.');
        router.push(`/login?redirect=/courses/${courseId}`);
      } else if (errorMessage.includes('already enrolled')) {
        toast.info('You are already enrolled in this course');
        setIsEnrolled(true);
        router.push(`/learn/${courseId}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking enrollment or auth initialization
  if (isChecking || !initialized || authLoading) {
    return (
      <Button disabled size="lg">
        {!initialized || authLoading ? 'Checking authentication...' : 'Checking...'}
      </Button>
    );
  }

  // Determine button text and state
  let buttonText = 'Login to Enroll';
  let buttonVariant: 'default' | 'outline' | 'secondary' = 'default';

  if (isAuthenticated) {
    if (isEnrolled) {
      buttonText = 'Continue Learning';
      buttonVariant = 'default';
    } else {
      buttonText = 'Enroll Now';
      buttonVariant = 'default';
    }
  }

  return (
    <div className="space-y-2">
      <Button disabled={isLoading} onClick={handleEnroll} size="lg" variant={buttonVariant}>
        {isLoading ? 'Processing...' : buttonText}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
