import { Button, Flex, notification } from "antd";
import { configAtom, useAtom, validateConfig } from "~/atoms";
import { examples, exportYAML } from "~/lib";

export default function ConfigManager() {
  const [config, setConfig] = useAtom(configAtom);
  const { source } = config;
  return (
    <Flex wrap="wrap" gap="small" justify="center">
      <Button onClick={() => validateConfig(config)}>校验</Button>
      <Button onClick={() => exportYAML(config, config.info?.name ?? "config")}>
        导出
      </Button>
      {source && (
        <Button onClick={() => setConfig(examples[source])}>重置</Button>
      )}
    </Flex>
  );
}
