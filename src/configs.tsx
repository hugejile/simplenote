import {
  ActionPanel,
  Form,
  Action,
  LocalStorage,
  showInFinder,
  showToast,
  Toast,
  Alert,
  confirmAlert,
  Icon,
} from "@raycast/api";
import fs from "fs";
import { useEffect, useState } from "react";
import { DefaultConfig, Sort, SystemConfig } from "./types";
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
              const file1 = path.join(folder, "SimpleNote.bak");
              const file2 = path.join(folder, "SimpleNote" + dayjs().format("YYYYMMDDHHmmss") + ".bak");

              const str = Buffer.from(JSON.stringify(items), "utf-8");
              fs.writeFileSync(file1, str);
              fs.writeFileSync(file2, str);
              showInFinder(file1);
            }}
          />
          <Action.SubmitForm
            title="Import From"
            onSubmit={async (values) => {
              const folder = values.folders[0];
              const file1 = path.join(folder, "SimpleNote.bak");

              if (!fs.existsSync(file1)) {
                showToast({ title: "SimpleNote.bak not exist", style: Toast.Style.Failure });
                return false;
              }

              const options: Alert.Options = {
                title: "Import",
                message: "Are you sure import notes? This action will override your notes and configs",
                primaryAction: {
                  title: "Import",
                  onAction: async () => {
                    const buff = fs.readFileSync(file1);
                    const notes = JSON.parse(buff.toString("utf-8"));
                    Object.keys(notes).forEach((x) => {
                      LocalStorage.setItem(x, notes[x]);
                    });

                    initConfig();
                    showToast({ title: "Import success" });
                  },
                },
              };
              await confirmAlert(options);
            }}
          />
        </ActionPanel>
      }
    >
      {!state.isLoading ? (
        <>
          <Form.FilePicker
            id="folders"
            title="Data Folder"
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
            label="View Note value is desensitized by default"
            value={state.config.desensitize}
            onChange={(value) =>
              setState((previous) => ({ ...previous, config: { ...state.config, desensitize: value } }))
            }
            title="Desensitization"
          />

          <Form.Dropdown
            id="sort"
            value={state.config.sort}
            title="Note Sorting"
            onChange={(value: string) => {
              // console.log("sort", value, Sort[value as keyof typeof Sort]);
              setState((previous) => ({
                ...previous,
                config: { ...state.config, sort: value as Sort },
              }));
            }}
          >
            {Object.keys(Sort).map((x) => (
              <Form.Dropdown.Item
                key={x}
                value={Sort[x as keyof typeof Sort]}
                title={Sort[x as keyof typeof Sort]}
                icon={Icon.Circle}
              />
            ))}
          </Form.Dropdown>
        </>
      ) : (
        <></>
      )}
    </Form>
  );
}

export default Configs;
