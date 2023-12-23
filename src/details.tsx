import { Action, ActionPanel, Detail, Icon, useNavigation } from "@raycast/api";
import { ICreateNoteHandler, IDeleteNoteHandler, NoteContent } from "./types";
import { desensitize } from "./utils";
import { useEffect } from "react";
import { Editor } from "./edit";

interface NewType {
  note: NoteContent;
  isDesensitize?: boolean;
  handleSubmit: ICreateNoteHandler;
  handleDelete: IDeleteNoteHandler;
}

export function NoteDetails(props: NewType) {
  const { pop, push } = useNavigation();
  const { note: { value: oValue, key } = { value: "", key: "" }, isDesensitize } = props;

  const value = isDesensitize ? desensitize(oValue) : oValue;

  useEffect(() => {
    console.log("Detail", oValue);
  }, []);

  return (
    <Detail
      navigationTitle={key}
      markdown={value}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <Action.Paste content={oValue}></Action.Paste>
            <Action.CopyToClipboard content={oValue}></Action.CopyToClipboard>
            {/* {isDesensitize ? <NoteDetails {...props} isDesensitize={!isDesensitize}></NoteDetails> : <></>} */}
            <Action
              title={isDesensitize ? "View Original Value" : "View Desensitize Value"}
              icon={isDesensitize ? Icon.Eye : Icon.EyeDisabled}
              shortcut={{ key: "v", modifiers: ["cmd"] }}
              onAction={() => {
                if (isDesensitize) push(<NoteDetails {...props} isDesensitize={false}></NoteDetails>);
                else {
                  pop();
                }
              }}
            />
          </ActionPanel.Section>

          <ActionPanel.Section>
            <Action
              icon={Icon.Document}
              title="Edit Note"
              shortcut={{ key: "e", modifiers: ["cmd"] }}
              onAction={() =>
                push(<Editor note={props.note} handleSubmit={props.handleSubmit} handleDelete={props.handleDelete} />)
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
