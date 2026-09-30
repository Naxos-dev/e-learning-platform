export interface OptionSeed {
  text: string;
  isCorrect: boolean;
}

export interface QuestionSeed {
  text: string;
  options: OptionSeed[];
}

export interface ChapterSeed {
  title: string;
  content: string;
  quiz?: QuestionSeed[];
  videoUrl?: string;
  videoKey?: string;
}

export interface CourseSeed {
  title: string;
  description: string;
  authorEmail: string;
  chapters: ChapterSeed[];
}
