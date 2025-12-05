'use client';

import type { Quiz, QuizAttempt } from '@/types/student.types';

import { CheckCircle2, X, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onClose: () => void;
}

export function QuizResults({ quiz, attempt, onClose }: QuizResultsProps) {
  const correctAnswers = quiz.questions.map(q => q.correctAnswer);
  const totalScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = quiz.questions.reduce((sum, q, index) => {
    const answer = attempt.answers.find(a => a.questionIndex === index);
    if (answer && answer.selectedAnswer === q.correctAnswer) {
      return sum + q.points;
    }
    return sum;
  }, 0);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription className="mt-2">{quiz.title}</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="text-center p-6 bg-muted rounded-lg">
          <div className="flex items-center justify-center mb-4">
            {attempt.isPassed ? (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            ) : (
              <XCircle className="h-16 w-16 text-destructive" />
            )}
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {attempt.score}% - {attempt.isPassed ? 'Passed' : 'Failed'}
          </h3>
          <p className="text-muted-foreground">Passing Score: {quiz.passingScore}%</p>
          <p className="text-sm text-muted-foreground mt-2">
            {earnedPoints} / {totalScore} points earned
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold">Question Review</h4>
          {quiz.questions.map((question, index) => {
            const answer = attempt.answers.find(a => a.questionIndex === index);
            const isCorrect = answer?.selectedAnswer === question.correctAnswer;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isCorrect
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium">
                    Question {index + 1} ({question.points}{' '}
                    {question.points === 1 ? 'point' : 'points'})
                  </h5>
                  {isCorrect ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Correct
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Incorrect
                    </Badge>
                  )}
                </div>
                <p className="mb-3 font-medium">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answer?.selectedAnswer === optIndex;
                    const isCorrectAnswer = optIndex === question.correctAnswer;

                    return (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          isCorrectAnswer
                            ? 'bg-green-100 dark:bg-green-900/30 font-medium'
                            : isSelected && !isCorrectAnswer
                              ? 'bg-red-100 dark:bg-red-900/30'
                              : 'bg-muted'
                        }`}
                      >
                        {isSelected && '✓ '}
                        {isCorrectAnswer && !isSelected && '✓ '}
                        {option}
                        {isCorrectAnswer && ' (Correct Answer)'}
                        {isSelected && !isCorrectAnswer && ' (Your Answer)'}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
