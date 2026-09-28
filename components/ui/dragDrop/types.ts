export interface BaseTask {
  id: string;
  type: "task" | "story" | "bug";
  key: string;
  title: string;
  epic?: string;
}

export interface FloatingPayload<T = BaseTask> {
  tasks: T[];
  source: string;
  taskIds: string[];
}
