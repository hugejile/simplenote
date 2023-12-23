import { ActionPanel, List, Action, LocalStorage, useNavigation, Icon } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { NoteDetails } from "./details";
import { NoteContent, State, formatNote } from "./types";
import { Editor } from "./edit";

async function getItems(): Promise<NoteContent[]> {
  const item = await LocalStorage.getItem<string>("SIMPLE_NOTE");
  console.log(item);
  const value = JSON.parse(item ?? "[]") as NoteContent[];
  const notes = value.filter((x) => x.key);
  if (notes.length > 0) return notes;
  else return [{ key: "Create Your First Note", value: "welcome to use simple note." }];
}

export default function Index() {
  const [state, setState] = useState<State>({
    notes: [],
  });
  const { push, pop } = useNavigation();

  useEffect(() => {
    start();
    console.log("NOTE INDEX");
  }, []);

  async function start() {
    const notes = await getItems();
    setState((previous) => ({ ...previous, notes }));
  }

  const handleSubmit = useCallback(
    async (note: NoteContent, oldKey?: string) => {
      if (!oldKey) oldKey = note.key;
      const existNote = state.notes.find((x) => x.key == oldKey);
      if (existNote) {
        existNote.key = note.key;
        existNote.value = note.value;
        await LocalStorage.setItem("SIMPLE_NOTE", JSON.stringify(state.notes));
        setState((previous) => ({ ...previous, notes: state.notes }));
      } else {
        const newNotes = [...state.notes, note];
        setState((previous) => ({ ...previous, notes: newNotes }));
        await LocalStorage.setItem("SIMPLE_NOTE", JSON.stringify(newNotes));
      }
      pop();
    },
    [state.notes, setState],
  );

  const handleDelete = useCallback(
    async (key: string) => {
      const newNotes = state.notes.filter((x) => x.key != key);
      await LocalStorage.setItem("SIMPLE_NOTE", JSON.stringify(newNotes));
      setState((previous) => ({ ...previous, notes: newNotes }));
    },
    [state.notes, setState],
  );

  return (
    <List>
      {state.notes.map((note, index) => {
        return (
          <List.Item
            icon={Icon.BlankDocument}
            key={index}
            title={note?.key ?? "undefined"}
            subtitle={note?.createTime?.toString()}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title="View Details"
                    icon={Icon.ArrowRight}
                    onAction={() =>
                      push(
                        <NoteDetails
                          note={formatNote(note)}
                          isDesensitize={true}
                          handleSubmit={handleSubmit}
                          handleDelete={handleDelete}
                        ></NoteDetails>,
                      )
                    }
                  />
                  <Action.Paste content={note?.value}></Action.Paste>
                  <Action.CopyToClipboard content={note?.value}></Action.CopyToClipboard>
                </ActionPanel.Section>

                <ActionPanel.Section>
                  <Action
                    icon={Icon.NewDocument}
                    title="New"
                    shortcut={{ key: "n", modifiers: ["cmd"] }}
                    onAction={() => push(<Editor handleSubmit={handleSubmit} handleDelete={handleDelete} />)}
                  />
                  <Action
                    icon={Icon.DeleteDocument}
                    title="Delete Note"
                    shortcut={{ key: "d", modifiers: ["cmd", "shift"] }}
                    onAction={() => handleDelete(note?.key)}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
