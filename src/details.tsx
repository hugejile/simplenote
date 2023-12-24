import { Action, ActionPanel, Detail, Icon, useNavigation } from "@raycast/api";
import { ICreateNoteHandler, IDeleteNoteHandler, NoteContent } from "./types";
import { desensitize, getNoteByKey } from "./utils";
import { useEffect, useState } from "react";
import { Editor } from "./edit";

interface DetailType {
  title: string;
  isDesensitize?: boolean;
  handleSubmit: ICreateNoteHandler;
  handleDelete: IDeleteNoteHandler;
}

export function NoteDetails(props: DetailType) {
  const { pop, push } = useNavigation();
  const { title: key, isDesensitize } = props;
  // const { note: { value: oValue, key } = { value: "", key: "" }, isDesensitize } = props;

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
          <ActionPanel.Section>
            <Action.Paste content={note.value}></Action.Paste>
            <Action.CopyToClipboard content={note.value} concealed={true}></Action.CopyToClipboard>
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

          <ActionPanel.Section>
            <Action
              icon={Icon.Document}
              title="Edit Note"
              shortcut={{ key: "e", modifiers: ["cmd"] }}
              onAction={() =>
                push(<Editor note={note} handleSubmit={props.handleSubmit} handleDelete={props.handleDelete} />)
              }
            />
            {/* <Action
              icon={Icon.NewDocument}
              title="New"
              shortcut={{ key: "n", modifiers: ["cmd"] }}
              onAction={() => push(<Editor handleSubmit={props.handleSubmit} handleDelete={props.handleDelete} />)}
            /> */}
            <Action
              icon={Icon.DeleteDocument}
              title="Delete Note"
              shortcut={{ key: "d", modifiers: ["cmd", "shift"] }}
              onAction={() => {
                props.handleDelete(key);
                pop();
                if (!isDesensitize) pop();
              }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}
