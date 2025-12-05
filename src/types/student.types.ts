export interface Progress {
  _id: string;
  student: string;
  course: string;
  lesson: string;
  isCompleted: boolean;
  completedAt?: Date;
  timeSpent: number; // in minutes
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressUpdate {
  courseId: string;
  lessonId: string;
  isCompleted: boolean;
  timeSpent?: number;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface Assignment {
  _id: string;
  course: string;
  lesson?: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: Date;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: string | Assignment;
  student: string;
  submissionText?: string;
  submissionUrl?: string;
  submittedAt: Date;
  gradedAt?: Date;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'returned';
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentWithSubmission extends Assignment {
  submission?: AssignmentSubmission;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  points: number;
}

export interface Quiz {
  _id: string;
  course: string;
  lesson?: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore: number; // percentage
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number; // Index of selected option
}

export interface QuizAttempt {
  _id: string;
  quiz: string | Quiz;
  student: string;
  answers: QuizAnswer[];
  score: number;
  isPassed: boolean;
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizSubmission {
  quizId: string;
  answers: QuizAnswer[];
}

export interface QuizResult {
  attempt: QuizAttempt;
  correctAnswers: number[];
  totalQuestions: number;
  percentage: number;
}

export interface EnrollmentWithProgress {
  _id: string;
  student: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    price: number;
    category: string;
    duration?: number;
    level?: string;
  };
  enrolledAt: Date;
  status: 'enrolled' | 'completed' | 'dropped';
  progress?: CourseProgress;
}

export interface CourseWithProgress {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  category: string;
  tags: string[];
  instructor: {
    _id: string;
    name: string;
    email?: string;
  };
  lessons: Array<{
    _id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
    order: number;
    isPreview: boolean;
  }>;
  assignments?: AssignmentWithSubmission[];
  quizzes?: Quiz[];
  progress?: CourseProgress;
  duration?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}
