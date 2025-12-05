'use client';

import type { Quiz, QuizAnswer, QuizAttempt } from '@/types/student.types';

import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { submitQuiz } from '@/lib/api/quizzes';

interface QuizInterfaceProps {
  quiz: Quiz;
  onComplete: (attempt: QuizAttempt) => void;
  onCancel: () => void;
}

export function QuizInterface({ quiz, onComplete, onCancel }: QuizInterfaceProps) {
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize answers array
  useEffect(() => {
    setAnswers(
      quiz.questions.map((_, index) => ({
        questionIndex: index,
        selectedAnswer: -1,
      }))
    );
  }, [quiz]);

  // Timer logic
  useEffect(() => {
    if (!quiz.timeLimit) {
      return;
    }

    setTimeRemaining(quiz.timeLimit * 60); // Convert minutes to seconds

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.timeLimit]);

  const handleAnswerSelect = (questionIndex: number, selectedAnswer: number) => {
    setAnswers(prev =>
      prev.map(answer =>
        answer.questionIndex === questionIndex ? { ...answer, selectedAnswer } : answer
      )
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = answers.filter(a => a.selectedAnswer === -1);
    if (unanswered.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setLoading(true);

    try {
      const response = await submitQuiz(
        quiz._id,
        answers.map(a => ({
          questionIndex: a.questionIndex,
          selectedAnswer: a.selectedAnswer === -1 ? 0 : a.selectedAnswer,
        }))
      );

      onComplete(response.data.attempt);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers.find(a => a.questionIndex === currentQuestionIndex);
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.description && (
              <CardDescription className="mt-2">{quiz.description}</CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            {timeRemaining !== null && (
              <span className={timeRemaining < 60 ? 'text-destructive font-medium' : ''}>
                Time: {formatTime(timeRemaining)}
              </span>
            )}
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {currentQuestion.question} ({currentQuestion.points}{' '}
            {currentQuestion.points === 1 ? 'point' : 'points'})
          </h3>

          <RadioGroup
            value={currentAnswer?.selectedAnswer.toString() || ''}
            onValueChange={value => handleAnswerSelect(currentQuestionIndex, parseInt(value, 10))}
          >
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50"
              >
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
          Previous
        </Button>

        <div className="flex gap-2">
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Quiz'
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
