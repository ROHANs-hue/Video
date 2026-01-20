
import { AppState, Student, Belt, Lesson, PracticeSubmission, Question, QuizResult } from '../types';

const STORAGE_KEY = 'golden_shoto_academy_v5_prod';
const SESSION_KEY = 'gs_auth_session';

const INITIAL_STATE: AppState = {
  students: [],
  lessons: [],
  submissions: [],
  // Initialize new fields
  questions: [],
  results: []
};

export const getDB = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return INITIAL_STATE;
  try {
    const parsed = JSON.parse(data);
    return {
      ...INITIAL_STATE,
      ...parsed,
      students: Array.isArray(parsed.students) ? parsed.students : [],
      lessons: Array.isArray(parsed.lessons) ? parsed.lessons : [],
      submissions: Array.isArray(parsed.submissions) ? parsed.submissions : [],
      // Ensure new arrays are correctly populated during hydration from storage
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
      results: Array.isArray(parsed.results) ? parsed.results : []
    };
  } catch {
    return INITIAL_STATE;
  }
};

export const saveDB = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const setSessionUser = (user: Student | null) => {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const getSessionUser = (): Student | null => {
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const addLesson = (lesson: Lesson) => {
  const db = getDB();
  db.lessons.push(lesson);
  saveDB(db);
};

export const addSubmission = (sub: PracticeSubmission) => {
  const db = getDB();
  db.submissions.push(sub);
  saveDB(db);
};

// Added addResult to fix the error in pages/Quiz.tsx
export const addResult = (result: QuizResult) => {
  const db = getDB();
  db.results.push(result);
  saveDB(db);
};

export const registerStudent = (displayName: string, username: string, password: string, belt: Belt): Student | string => {
  const db = getDB();
  const normalizedUsername = username.trim().toLowerCase();
  if (db.students.some(s => s.username.toLowerCase() === normalizedUsername)) {
    return "This Warrior ID is already taken.";
  }
  const newStudent: Student = {
    id: `student_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    username: normalizedUsername, 
    displayName, 
    password, 
    belt,
    achievements: []
  };
  db.students.push(newStudent);
  saveDB(db);
  return newStudent;
};

export const loginStudent = (username: string, password: string): Student | string => {
  const db = getDB();
  const student = db.students.find(s => s.username.toLowerCase() === username.trim().toLowerCase());
  if (!student) return "Warrior ID not found.";
  if (student.password !== password) return "Incorrect Password.";
  return student;
};
