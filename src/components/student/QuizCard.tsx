'use client';

import type { Quiz, QuizAttempt } from '@/types/student.types';

import { useState } from 'react';
import { PlayCircle, CheckCircle2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuizResults } from '@/components/student/QuizResults';
import { QuizInterface } from '@/components/student/QuizInterface';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface QuizCardProps {
  quiz: Quiz & {
    attempts?: QuizAttempt[];
    latestAttempt?: QuizAttempt;
  };
  onQuizComplete?: () => void;
}

export function QuizCard({ quiz, onQuizComplete }: QuizCardProps) {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | undefined>(quiz.latestAttempt);

  const handleQuizComplete = (attempt: QuizAttempt) => {
    setLatestAttempt(attempt);
    setShowQuiz(false);
    setShowResults(true);
    onQuizComplete?.();
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
    setShowResults(false);
  };

  const handleViewResults = () => {
    setShowResults(true);
    setShowQuiz(false);
  };

  if (showQuiz) {
    return (
      <QuizInterface
        quiz={quiz}
        onComplete={handleQuizComplete}
        onCancel={() => setShowQuiz(false)}
      />
    );
  }

  if (showResults && latestAttempt) {
    return (
      <QuizResults quiz={quiz} attempt={latestAttempt} onClose={() => setShowResults(false)} />
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription className="mt-2">{quiz.description}</CardDescription>
            )}
          </div>
          {latestAttempt && (
            <Badge
              variant={latestAttempt.isPassed ? 'default' : 'destructive'}
              className="flex items-center gap-1"
            >
              {latestAttempt.isPassed ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Passed
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  Failed
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Questions:</span> {quiz.questions.length}
          </p>
          {quiz.timeLimit && (
            <p>
              <span className="font-medium">Time Limit:</span> {quiz.timeLimit} minutes
            </p>
          )}
          <p>
            <span className="font-medium">Passing Score:</span> {quiz.passingScore}%
          </p>
          {latestAttempt && (
            <div className="pt-2 border-t">
              <p>
                <span className="font-medium">Your Score:</span> {latestAttempt.score}%
              </p>
              <p className="text-muted-foreground">
                Attempted on{' '}
                {new Date(
                  latestAttempt.completedAt || latestAttempt.startedAt
                ).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        {latestAttempt ? (
          <Button onClick={handleViewResults} variant="outline" className="w-full">
            View Results
          </Button>
        ) : (
          <Button onClick={handleStartQuiz} className="w-full">
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Quiz
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
