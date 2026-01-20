
export enum Belt {
  WHITE = "White",
  YELLOW = "Yellow",
  YELLOW_2 = "Yellow 2",
  BLUE = "Blue",
  GREEN = "Green",
  PURPLE = "Purple",
  PURPLE_2 = "Purple 2",
  BROWN = "Brown",
  BROWN_2_WHITE = "Brown 2(White)",
  BROWN_3_BLACK = "Brown 3(Black)"
}

export interface Lesson {
  id: string;
  belt: Belt;
  title: string;
  videoUrl: string;
  description: string;
}

export interface PracticeSubmission {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  videoBlobUrl: string;
  timestamp: number;
  status: 'Pending' | 'Approved' | 'Try Again';
  score?: number; // 1-10 marks
  feedback?: string;
}

export interface Student {
  id: string;
  username: string;
  displayName: string;
  password: string;
  belt: Belt;
  achievements: string[];
}

// Added Question interface to resolve import error in pages/Quiz.tsx
export interface Question {
  id: string;
  belt: Belt;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

// Added QuizResult interface to resolve import error in pages/Quiz.tsx and missing properties in AppState
export interface QuizResult {
  id: string;
  studentName: string;
  belt: Belt;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  timestamp: number;
  answers: {
    questionId: string;
    selectedOption: number;
    isCorrect: boolean;
  }[];
}

export interface AppState {
  students: Student[];
  lessons: Lesson[];
  submissions: PracticeSubmission[];
  // Added questions and results properties to fix AppState errors in Quiz.tsx and LeaderboardPage.tsx
  questions: Question[];
  results: QuizResult[];
}
