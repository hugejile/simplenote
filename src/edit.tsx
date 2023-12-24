import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";
import { ICreateNoteHandler, IDeleteNoteHandler, NoteContent } from "./types";

export function Editor(props: {
  note?: NoteContent;
  handleSubmit: ICreateNoteHandler;
  handleDelete: IDeleteNoteHandler;
}) {
  const [keyError, setKeyError] = useState<string | undefined>();
  const [valueError, setValueError] = useState<string | undefined>();
  const { key, value } = props.note ?? {};

  const { pop } = useNavigation();

  useEffect(() => {
    console.debug("PAGE MOUNT:\t", "Edit");
  }, []);

  function dropKeyErrorIfNeeded() {
    if (keyError && keyError.length > 0) {
      setKeyError(undefined);
    }
  }

  function dropValueErrorIfNeeded() {
    if (valueError && valueError.length > 0) {
      setValueError(undefined);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={key ? "Update Note" : "Create Note"}
            onSubmit={(input) => {
              props.handleSubmit(input as NoteContent, key);
              pop();
            }}
          />
        </ActionPanel>
      }
    >
      <Form.TextField
        id="key"
        title="Key"
        defaultValue={key}
        placeholder="Enter your key"
        error={keyError}
        onChange={dropKeyErrorIfNeeded}
        autoFocus={!key}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setKeyError("The field should't be empty!");
          } else {
            dropKeyErrorIfNeeded();
          }
        }}
      />
      <Form.TextArea
        id="value"
        title="Value"
        error={valueError}
        onChange={dropValueErrorIfNeeded}
        defaultValue={value}
        placeholder="Enter your value"
        autoFocus={!!key}
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setValueError("The field should't be empty!");
          } else {
            dropKeyErrorIfNeeded();
          }
        }}
      />
    </Form>
  );
}
