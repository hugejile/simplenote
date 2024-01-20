import { Alert, LocalStorage, confirmAlert } from "@raycast/api";
import { DefaultConfig, NoteContent, NoteIndex, Sort, SystemConfig } from "./types";

export const CONFIG_FILE_NAME = "__CONFIG_FILE_NAME__";

export function desensitize(value: string) {
  if (value == undefined || value.length == 0) {
    return value;
  } else if (value.length <= 2) {
    return "\\*\\*";
  } else if (value.length < 6) {
    const s = value.replace(/(.{2}).*/g, "$1" + "\\*".padEnd(value.length - 1, "*"));
    return s;
  } else {
    const s = value.replace(/(.{2}).*(.{2})/g, "$1" + "\\*".padEnd(value.length - 3, "*") + "$2");
    return s;
  }
}

export async function getKeys(sort: Sort): Promise<NoteIndex[]> {
  const items = await LocalStorage.allItems<object>();
  const keys = Object.keys(items)
    .filter((x) => x !== CONFIG_FILE_NAME)
    .map((x) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const i = JSON.parse((items as any)[x]) as NoteContent;
      return { key: x, createTime: i.createTime ?? 0 };
    });

  // await new Promise((resolve) => setTimeout(resolve, 500));

  console.log(keys);
  if (keys.length > 0) {
    switch (sort) {
      case Sort.CreateTimeAsc:
        return keys.sort((x, y) => x.createTime - y.createTime);
      default:
      case Sort.CreateTimeDesc:
        return keys.sort((x, y) => y.createTime - x.createTime);
      case Sort.AlphabetAsc:
        return keys.sort((x, y) => (y.key < x.key ? 1 : -1));
      case Sort.AlphabetDesc:
        return keys.sort((x, y) => (y.key > x.key ? 1 : -1));
    }
  } else return [{ key: "Create Your First Note", createTime: 0 }];
}

export async function getNoteByKey(key: string): Promise<NoteContent> {
  const v = await LocalStorage.getItem<string>(key);
  console.debug("GET NOTE CONTENT STRING:\t", v);

  try {
    const note = JSON.parse(v!) as NoteContent;
    return note;
  } catch {
    return { key: key, value: v ?? "" };
  }
}

export async function createOrUpdateNote(note: NoteContent, oldKey?: string): Promise<NoteContent> {
  if (oldKey === CONFIG_FILE_NAME || note.key == CONFIG_FILE_NAME) {
    return note;
  }
  if (oldKey && oldKey != note.key) await LocalStorage.removeItem(oldKey);
  note.createTime = Date.now();
  LocalStorage.setItem(note.key, JSON.stringify(note));
  return note;
}

export async function deleteNoteByKey(key: string) {
  if (key === CONFIG_FILE_NAME) return;

  const options: Alert.Options = {
    title: "Deleting",
    message: "Are you sure to delete?",
    primaryAction: {
      title: "Delete",
      onAction: () => {
        LocalStorage.removeItem(key);
      },
    },
  };
  await confirmAlert(options);
}

export async function getConfig(): Promise<SystemConfig> {
  const configStr = await LocalStorage.getItem<string>(CONFIG_FILE_NAME);

  let config;
  if (configStr) {
    config = JSON.parse(configStr ?? "{}") as SystemConfig;
  } else {
    config = DefaultConfig;
  }

  console.debug(JSON.stringify(config));
  return config;
}

export async function saveSystemConfig(configs: SystemConfig) {
  await LocalStorage.setItem(CONFIG_FILE_NAME, JSON.stringify(configs));
}
