export interface Todo {
  id: number;
  name: string;
  description: string;

  effort: number;
  pctComplete: number;
  isDone: boolean;

  dateCreated: Date;
  dateUpdated: Date;
  dateDone: Date;
}
