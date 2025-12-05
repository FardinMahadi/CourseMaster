import Link from 'next/link';
import { cookies } from 'next/headers';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { verifyToken } from '@/lib/auth';

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return false;
    }
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

export default async function Home() {
  const authenticated = await isAuthenticated();
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 px-4 py-20 md:py-32">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              CourseMaster
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl lg:text-2xl">
            Your comprehensive EdTech platform for learning, teaching, and managing courses. Start
            your learning journey today.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/courses">Browse Courses</Link>
            </Button>
            {!authenticated && (
              <>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Why Choose CourseMaster?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Everything you need to learn, teach, and manage courses in one powerful platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                Comprehensive Course Library
              </CardTitle>
              <CardDescription>
                Browse through a wide range of courses with detailed descriptions, syllabi, and
                instructor information.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Track Your Progress
              </CardTitle>
              <CardDescription>
                Monitor your learning journey with real-time progress tracking and completion
                statistics for each course.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Interactive Assignments
              </CardTitle>
              <CardDescription>
                Submit assignments via Google Drive links or text answers. Get feedback and improve
                your skills.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                Interactive Quizzes
              </CardTitle>
              <CardDescription>
                Test your knowledge with multiple-choice quizzes and get immediate feedback on your
                performance.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Video Lectures
              </CardTitle>
              <CardDescription>
                Learn from high-quality video lectures embedded from YouTube or Vimeo, accessible
                anytime, anywhere.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Feature 6 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="size-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Expert Instructors
              </CardTitle>
              <CardDescription>
                Learn from experienced instructors who are passionate about sharing their knowledge
                and expertise.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Ready to Start Learning?
          </h2>
          <p className="mb-8 mx-auto max-w-2xl text-lg text-muted-foreground">
            Join thousands of students already learning on CourseMaster. Create your account today
            and unlock unlimited access to our course library.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            {!authenticated ? (
              <>
                <Button asChild size="lg" className="text-lg">
                  <Link href="/register">Create Free Account</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg">
                  <Link href="/login">Sign In</Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="text-lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center text-sm text-muted-foreground md:text-left">
              <p>&copy; 2025 CourseMaster. All rights reserved.</p>
            </div>
            {!authenticated && (
              <div className="flex gap-6">
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Student Login
                </Link>
                <Link
                  href="/admin-login"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
