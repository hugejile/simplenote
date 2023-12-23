import { Action, ActionPanel, Form } from "@raycast/api";
import { useState } from "react";
import { ICreateNoteHandler, NoteContent } from "./types";

export function Editor(props: { note?: NoteContent; handleSubmit: ICreateNoteHandler }) {
  const [keyError, setKeyError] = useState<string | undefined>();
  const [valueError, setValueError] = useState<string | undefined>();

  const { key, value, createTime } = props.note ?? {};

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
          <Action.SubmitForm title="Create Todo" onSubmit={props.handleSubmit} />
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
        onBlur={(event) => {
          if (event.target.value?.length == 0) {
            setValueError("The field should't be empty!");
          } else {
            dropKeyErrorIfNeeded();
          }
        }}
      />
      <Form.TextArea id="desc" title="Description" placeholder="Description" defaultValue={createTime?.toString()} />
    </Form>
  );
}
