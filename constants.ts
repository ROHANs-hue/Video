
import { Belt } from './types.ts';

export const ACADEMY_NAME = "Golden Shoto Karate Academy";
export const TRAINER_PIN = "2005";

export const BELTS: Belt[] = [
  Belt.WHITE,
  Belt.YELLOW,
  Belt.YELLOW_2,
  Belt.BLUE,
  Belt.GREEN,
  Belt.PURPLE,
  Belt.PURPLE_2,
  Belt.BROWN,
  Belt.BROWN_2_WHITE,
  Belt.BROWN_3_BLACK
];

// Fixed: Added constants for the quiz feature
export const QUIZ_QUESTION_COUNT = 10;
export const QUIZ_TIME_LIMIT_SECONDS = 300;
