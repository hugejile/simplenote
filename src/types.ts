export class NoteContent {
  public key!: string;
  public value!: string;
  public createTime?: number = Date.now();
}

export type State = {
  notes: NoteContent[];
};

export interface ICreateNoteHandler {
  (note: NoteContent): void;
}
