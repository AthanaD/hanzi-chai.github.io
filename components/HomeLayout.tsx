import {
  Button,
  Dropdown,
  Flex,
  Layout,
  List,
  MenuProps,
  Typography,
} from "antd";
import { Config } from "../lib/config";
import { useEffect, useState } from "react";
import defaultConfig from "../templates/default.yaml";
import xingyin from "../templates/xingyin.yaml";
import { Link } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { useImmer } from "use-immer";

const items: MenuProps["items"] = [
  {
    label: "默认模板",
    key: "default",
  },
  {
    label: "形音码模板",
    key: "xingyin",
  },
  {
    label: "形码模板",
    key: "xingma",
    disabled: true,
  },
  {
    label: "二笔模板",
    key: "erbi",
    disabled: true,
  },
];

const configMap = new Map<string, Config>([
  ["default", defaultConfig as Config],
  ["xingyin", xingyin as Config],
]);

const HomeLayout = () => {
  const [configs, setConfigs] = useImmer(() =>
    Object.fromEntries(
      Object.entries(localStorage).map(([key, value]) => {
        const data = JSON.parse(value) as Config;
        return [key, data];
      }),
    ),
  );

  useEffect(() => {
    Object.entries(configs).forEach(([id, config]) => {
      localStorage.setItem(id, JSON.stringify(config));
    });
    Object.keys(localStorage)
      .filter((x) => !configs[x])
      .forEach((id) => localStorage.removeItem(id));
  }, [configs]);

  return (
    <Layout style={{ height: "100%" }}>
      <Layout.Sider width={320} theme="light">
        <Flex
          vertical
          justify="space-evenly"
          style={{ height: "100%", padding: "0 32px" }}
        >
          <List
            itemLayout="horizontal"
            dataSource={Object.entries(configs)}
            renderItem={([id, { info }]) => {
              return (
                <List.Item
                  actions={[
                    <Link to={id}>编辑</Link>,
                    <a
                      onClick={() =>
                        setConfigs((configs) => {
                          delete configs[id];
                        })
                      }
                    >
                      删除
                    </a>,
                  ]}
                >
                  <List.Item.Meta
                    title={info.name}
                    description={info.description}
                  />
                </List.Item>
              );
            }}
          />
          <Flex justify="center">
            <Dropdown
              placement="bottom"
              menu={{
                items,
                onClick: (e) => {
                  setConfigs((configs) => {
                    configs[uuid()] = configMap.get(e.key)!;
                  });
                },
              }}
            >
              <Button type="primary">新建</Button>
            </Dropdown>
          </Flex>
        </Flex>
      </Layout.Sider>
      <Layout>
        <Flex
          component={Layout.Content}
          vertical
          justify="center"
          align="center"
          gap="large"
        >
          <img alt="favicon" src="/favicon.ico" />
          <Typography.Title>汉字自动拆分系统 v{APP_VERSION}</Typography.Title>
        </Flex>
        <Flex component={Layout.Footer} justify="center">
          © 汉字自动拆分开发团队 2019 - {new Date().getFullYear()}
        </Flex>
      </Layout>
    </Layout>
  );
};

export default HomeLayout;
