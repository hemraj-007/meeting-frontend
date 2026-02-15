export type ActionItem = {
  id: string;
  task: string;
  owner: string | null;
  dueDate: string | null;
  completed: boolean;
  tags: string[];
};

export type Transcript = {
  id: string;
  text: string;
  items: ActionItem[];
};
