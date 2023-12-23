export class NoteContent {
  public key!: string;
  public value!: string;
  public createTime?: number = Date.now();
}

export function formatNote(note?: NoteContent) {
  if (!note) return emptyNote;
  if (!note.key) note.key = emptyNote.key;
  if (!note.value) note.value = emptyNote.value;

  return note;
}

export const emptyNote: NoteContent = {
  key: "",
  value: "",
};

export type State = {
  notes: NoteContent[];
};

export interface ICreateNoteHandler {
  (note: NoteContent, oldKey?: string): void;
}

export interface IDeleteNoteHandler {
  (key: string): void;
}
