import { LocalStorage } from "@raycast/api";
import { NoteContent, NoteIndex } from "./types";

export function desensitize(value: string) {
  if (value.length <= 2) {
    return "\\*\\*";
  } else if (value.length < 6) {
    const s = value.replace(/(.{2}).*/, "$1" + "\\*".padEnd(value.length - 1, "*"));
    return s;
  } else {
    const s = value.replace(/(.{2}).*(.{2})/, "$1" + "\\*".padEnd(value.length - 3, "*") + "$2");
    return s;
  }
}

export async function getKeys(): Promise<NoteIndex[]> {
  const items = await LocalStorage.allItems<object>();
  const keys = Object.keys(items).map((x) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const i = JSON.parse((items as any)[x]) as NoteContent;
    // console.debug("aaaaaaa", i, i.createTime);
    return { key: x, createTime: i.createTime ?? 0 };
  });

  // console.log("GET ALL KEYS", items, keys);
  if (keys.length > 0) return keys.sort((x, y) => y.createTime - x.createTime);
  else return [{ key: "Create Your First Note", createTime: 0 }];
}

export async function getNoteByKey(key: string): Promise<NoteContent> {
  const v = await LocalStorage.getItem<string>(key);
  console.debug("GET NOTE CONTENT STRING:\t", v);

  try {
    const note = JSON.parse(v ?? "{}") as NoteContent;
    return note;
  } catch {
    return { key: key, value: v ?? "" };
  }
}

export async function updateDateByKey(note: NoteContent, oldKey?: string): Promise<NoteContent> {
  if (oldKey && oldKey != note.key) await LocalStorage.removeItem(oldKey);
  note.createTime = Date.now();
  LocalStorage.setItem(note.key, JSON.stringify(note));
  return note;
}

export async function deleteNoteByKey(key: string) {
  LocalStorage.removeItem(key);
}
