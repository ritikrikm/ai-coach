export type SearchItem = {
  //returned from search (after searching)
  title: string;
  url: string;
  snippet?: string;
};
export type SearchRequest = {
  //search
  query: string; //eg "React interview questions 2025"
  limit?: number; //default is 10
};
// for competency c
export type Competency = {
  skill: string;
  subskills: string[];
};
