import { Action, ActionPanel, Detail, Icon, useNavigation } from "@raycast/api";
import { ICreateNoteHandler, NoteContent } from "./types";
import { deleteNoteByKey, desensitize, getNoteByKey } from "./utils";
import { useEffect, useState } from "react";
import { Editor } from "./edit";

interface DetailType {
  title: string;
  isDesensitize?: boolean;
  afterSubmit: ICreateNoteHandler;
}

export function NoteDetails(props: DetailType) {
  const { pop, push } = useNavigation();
  const { title: key, isDesensitize } = props;

  const [note, setNote] = useState<NoteContent>({ key: "", value: "" });
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    getNote(key);
    console.debug("PAGE MOUNT:\t", "Details");
  }, []);

  async function getNote(key: string) {
    const note = await getNoteByKey(key);
    setNote(note);
    setValue(isDesensitize ? desensitize(note.value) : note.value);
  }

  return (
    <Detail
      navigationTitle={key}
      markdown={value}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Value">
            <Action.Paste content={note.value}></Action.Paste>
            <Action.CopyToClipboard content={note.value} concealed={true}></Action.CopyToClipboard>
          </ActionPanel.Section>

          <ActionPanel.Section title="Key">
            <Action.Paste content={note.key} shortcut={{ key: "enter", modifiers: ["cmd", "shift"] }}></Action.Paste>
          </ActionPanel.Section>

          <ActionPanel.Section>
            <Action
              title={isDesensitize ? "View Original Value" : "View Desensitize Value"}
              icon={isDesensitize ? Icon.Eye : Icon.EyeDisabled}
              shortcut={{ key: "v", modifiers: ["cmd"] }}
              onAction={() => {
                pop();
                setTimeout(() => push(<NoteDetails {...props} isDesensitize={!isDesensitize}></NoteDetails>), 1);
              }}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Edit">
            <Action
              icon={Icon.Document}
              title="Edit Note"
              shortcut={{ key: "e", modifiers: ["cmd"] }}
              onAction={() => push(<Editor note={note} afterSubmit={props.afterSubmit} />)}
            />
            <Action
              icon={Icon.DeleteDocument}
              title="Delete Note"
              shortcut={{ key: "d", modifiers: ["cmd"] }}
              onAction={async () => {
                await deleteNoteByKey(key);
                props.afterSubmit?.(note);
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
