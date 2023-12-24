import { ActionPanel, List, Action, useNavigation, Icon, Clipboard } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { NoteDetails } from "./details";
import { NoteContent, State } from "./types";
import { Editor } from "./edit";
import { getKeys as getNoteKeys, updateDateByKey as createOrUpdateNote, getNoteByKey, deleteNoteByKey } from "./utils";
import dayjs from "dayjs";
import { Configs } from "./configs";

export default function Index() {
  const [state, setState] = useState<State>({
    notes: [],
  });
  const { push, pop } = useNavigation();

  useEffect(() => {
    start();
    console.debug("PAGE MOUNT:\t", "Index");
  }, []);

  async function start() {
    const notes = await getNoteKeys();
    setState((previous) => ({ ...previous, notes }));
  }

  const handleSubmit = useCallback(
    async (note: NoteContent, oldKey?: string) => {
      await createOrUpdateNote(note, oldKey);
      start();
      pop();
    },
    [state.notes, setState],
  );

  const handleDelete = useCallback(
    async (key: string) => {
      await deleteNoteByKey(key);
      const newNotes = state.notes.filter((x) => x.key != key);
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
            title={note.key ?? "undefined"}
            subtitle={dayjs(note.createTime).format("YYYY-MM-DD HH:mm:ss")}
            actions={
              <ActionPanel>
                <ActionPanel.Section>
                  <Action
                    title="View Details"
                    icon={Icon.ArrowRight}
                    onAction={() =>
                      push(
                        <NoteDetails
                          title={note.key}
                          isDesensitize={true}
                          handleSubmit={handleSubmit}
                          handleDelete={handleDelete}
                        ></NoteDetails>,
                      )
                    }
                  />
                  <Action
                    title="Paste In Active App"
                    icon={Icon.CopyClipboard}
                    onAction={async () => {
                      const n = await getNoteByKey(note.key);
                      console.log("past note", n);
                      Clipboard.paste(n.value);
                    }}
                  />
                  {/* <Action.Paste content={note}></Action.Paste> */}
                  {/* <Action.CopyToClipboard content={note?.value}></Action.CopyToClipboard> */}
                </ActionPanel.Section>

                <ActionPanel.Section>
                  <Action
                    icon={Icon.NewDocument}
                    title="New"
                    shortcut={{ key: "n", modifiers: ["cmd"] }}
                    onAction={() => push(<Editor handleSubmit={handleSubmit} handleDelete={handleDelete} />)}
                  />
                  <Action icon={Icon.DeleteDocument} title="Delete Note" onAction={() => handleDelete(note.key)} />
                  <Action.Push
                    icon={Icon.Download}
                    shortcut={{ key: "e", modifiers: ["cmd", "shift"] }}
                    title="Export Notes"
                    target={<Configs />}
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
