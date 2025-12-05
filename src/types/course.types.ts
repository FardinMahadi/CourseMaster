export interface Instructor {
  _id: string;
  name: string;
  email?: string;
  bio?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: number;
  order: number;
}

export interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate?: Date;
  maxScore?: number;
}

export interface Quiz {
  _id: string;
  title: string;
  questions: QuizQuestion[];
  passingScore?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  instructor: Instructor | string;
  lessons?: Lesson[] | string[];
  assignments?: Assignment[] | string[];
  quizzes?: Quiz[] | string[];
  thumbnail?: string;
  duration?: number; // in minutes
  level?: 'beginner' | 'intermediate' | 'advanced';
  language?: string;
  isPublished?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseListResponse {
  courses: Course[];
  currentPage: number;
  totalPages: number;
  total: number;
}

export interface CourseFilters {
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'price-asc' | 'price-desc' | 'title';
  page?: number;
  limit?: number;
}
