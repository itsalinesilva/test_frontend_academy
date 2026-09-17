import { Course, CourseModule, Lesson, UserCourseProgress } from '../domain/types';

export interface CourseDetailResponse {
  course: Course;
  modules: CourseModule[];
  lessons: Lesson[];
  userProgress?: UserCourseProgress;
}

export interface EnrollCourseRequest {
  courseId: string;
}

export interface SubmitLessonProgressRequest {
  courseId: string;
  lessonId: string;
  durationSeconds: number;
}
