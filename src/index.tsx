import { ActionPanel, List, Action, LocalStorage, useNavigation, Icon } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { NoteDetails } from "./details";
import { NoteContent, State } from "./types";
import { Editor } from "./edit";

async function getItems(): Promise<NoteContent[]> {
  const defaultValues: NoteContent[] = [{ key: "hi", value: "welcome to use simple note." }];
  const item = await LocalStorage.getItem<string>("SIMPLE_NOTE");
  console.log(item);
  return JSON.parse(item ?? JSON.stringify(defaultValues)) as NoteContent[];
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
    async (note: NoteContent) => {
      const newNotes = [...state.notes, note];
      setState((previous) => ({ ...previous, notes: newNotes }));
      await LocalStorage.setItem("SIMPLE_NOTE", JSON.stringify(newNotes));
      pop();
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
            title={note.key}
            subtitle={note.createTime?.toString()}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title="View Details"
                    icon={Icon.ArrowRight}
                    onAction={() =>
                      push(<NoteDetails note={note} isDesensitize={true} handleSubmit={handleSubmit}></NoteDetails>)
                    }
                  />
                  <Action.Paste content={note.value}></Action.Paste>
                  <Action.CopyToClipboard content={note.value}></Action.CopyToClipboard>
                </ActionPanel.Section>

                <ActionPanel.Section>
                  <Action
                    icon={Icon.NewDocument}
                    title="New"
                    shortcut={{ key: "n", modifiers: ["cmd"] }}
                    onAction={() => push(<Editor handleSubmit={handleSubmit} />)}
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
