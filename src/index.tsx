import { ActionPanel, List, Action, useNavigation, Icon, Clipboard } from "@raycast/api";
import { useCallback, useEffect, useState } from "react";
import { NoteDetails } from "./details";
import { DefaultConfig, NoteContent, NoteIndex, SystemConfig } from "./types";
import { Editor } from "./edit";
import { getKeys as getNoteKeys, getNoteByKey, deleteNoteByKey, getConfig } from "./utils";
import dayjs from "dayjs";
import { Configs } from "./configs";

export type State = {
  notes: NoteIndex[];
  config: SystemConfig;
  isLoading: boolean;
};

export default function Index() {
  const [state, setState] = useState<State>({
    notes: [],
    config: DefaultConfig,
    isLoading: true,
  });
  const { push, pop } = useNavigation();

  useEffect(() => {
    start();
    console.debug("PAGE MOUNT:\t", "Index");
  }, []);

  async function start() {
    setState((previous) => ({ ...previous, isLoading: true }));
    const notes = await getNoteKeys();
    const config = await getConfig();
    setState((previous) => ({ ...previous, notes, config, isLoading: false }));
  }

  const afterSubmit = useCallback(
    async (note: NoteContent, oldKey?: string) => {
      console.debug(note, oldKey);
      start();
      pop();
    },
    [state.notes, setState],
  );

  // const handleDelete = useCallback(
  //   async (key: string) => {
  //     await deleteNoteByKey(key);
  //     const newNotes = state.notes.filter((x) => x.key != key);
  //     setState((previous) => ({ ...previous, notes: newNotes }));
  //   },
  //   [state.notes, setState],
  // );

  return (
    <List isLoading={state.isLoading}>
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
                          isDesensitize={state.config.desensitize}
                          afterSubmit={afterSubmit}
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
                    onAction={() => push(<Editor afterSubmit={afterSubmit} />)}
                  />
                  <Action
                    icon={Icon.DeleteDocument}
                    title="Delete Note"
                    shortcut={{ key: "d", modifiers: ["cmd"] }}
                    onAction={async () => {
                      await deleteNoteByKey(note.key);
                      start();
                    }}
                  />
                  <Action.Push
                    icon={Icon.Cog}
                    shortcut={{ key: "e", modifiers: ["cmd", "shift"] }}
                    title="Configs"
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

export { Index };
