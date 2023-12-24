import { homedir } from "os";
import path from "path";

export class NoteContent {
  public key!: string;
  public value!: string;
  public createTime?: number = Date.now();
}

export class NoteIndex {
  public key!: string;
  public createTime!: number;
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

export interface ICreateNoteHandler {
  (note: NoteContent, oldKey?: string): void;
}

export interface IDeleteNoteHandler {
  (key: string): void;
}

export type SystemConfig = {
  databaseCon: string;
  databaseType: "file" | "sqlite";
  desensitize: boolean;
};

export const DefaultConfig: SystemConfig = {
  databaseCon: path.join(homedir(), "Downloads"),
  databaseType: "file",
  desensitize: true,
};
