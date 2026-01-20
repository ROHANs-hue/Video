
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

// Fixed: Added Question interface for the quiz system
export interface Question {
  id: string;
  belt: Belt;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

// Fixed: Added QuizResult interface for tracking student performance
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

// Fixed: Updated AppState to include questions and results
export interface AppState {
  students: Student[];
  lessons: Lesson[];
  submissions: PracticeSubmission[];
  questions: Question[];
  results: QuizResult[];
}
