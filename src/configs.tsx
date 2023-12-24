import { ActionPanel, Form, Action, LocalStorage, showInFinder } from "@raycast/api";
import fs from "fs";
import { useEffect, useState } from "react";
import { DefaultConfig, SystemConfig } from "./types";
import { getConfig, saveSystemConfig } from "./utils";
import path from "path";
import dayjs from "dayjs";

type ConfigsType = {
  config: SystemConfig;
  isLoading: boolean;
};

export function Configs() {
  const [state, setState] = useState<ConfigsType>({ config: DefaultConfig, isLoading: true });

  useEffect(() => {
    console.debug("PAGE MOUNT:\t", "Configs");
    initConfig();
  }, []);

  async function initConfig() {
    const config = await getConfig();
    setState((previous) => ({ ...previous, config, isLoading: false }));
  }

  useEffect(() => {
    console.log(state.isLoading, JSON.stringify(state));
    if (state.isLoading) return;
    console.log("Saved", JSON.stringify(state.config));
    saveSystemConfig(state.config);
  }, [state.config]);

  return (
    <Form
      isLoading={state.isLoading}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title="Export To Disk"
            onSubmit={async (values) => {
              const folder = values.folders[0];
              if (!fs.existsSync(folder) || !fs.lstatSync(folder).isDirectory()) {
                return false;
              }

              const items = await LocalStorage.allItems<object>();
              const file = path.join(folder, dayjs().format("YYYYMMDDHHmmss") + ".txt");
              console.log(file, JSON.stringify(items));

              await fs.writeFileSync(file, JSON.stringify(items));
              showInFinder(file);
            }}
          />
        </ActionPanel>
      }
    >
      {!state.isLoading ? (
        <>
          <Form.FilePicker
            id="folders"
            title="Config Folder"
            value={[state.config.databaseCon]}
            allowMultipleSelection={false}
            onChange={(value) => {
              setState((previous) => ({ ...previous, config: { ...state.config, databaseCon: value[0] } }));
            }}
            canChooseDirectories
            canChooseFiles={false}
          />

          <Form.Checkbox
            id="desensitize"
            label="Desensitize Note Value"
            value={state.config.desensitize}
            onChange={(value) =>
              setState((previous) => ({ ...previous, config: { ...state.config, desensitize: value } }))
            }
            title="Desensitization"
          />
        </>
      ) : (
        <></>
      )}
    </Form>
  );
}

export default Configs;
