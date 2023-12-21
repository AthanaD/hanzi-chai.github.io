import { Button, Cascader, Flex, Form, Input, Space, Typography } from "antd";
import { DeleteButton, KeyList, Select } from "./Utils";
import { Config } from "~/lib/config";
import { useAtom, useAtomValue, configFormAtom } from "~/atoms";
import {
  autoSelectLengthAtom,
  autoSelectPatternAtom,
  maxLengthAtom,
  selectKeysAtom,
  shortCodeSchemesAtom,
  wordRulesAtom,
} from "~/atoms/encoder";
import { printableAscii } from "~/lib/utils";
import { useState } from "react";
import Root from "./Root";

const defaultRules: NonNullable<Config["encoder"]["rules"]> = [
  { length_equal: 2, formula: "AaAbBaBb" },
  { length_equal: 3, formula: "AaBaCaCb" },
  { length_in_range: [4, 10], formula: "AaBaCaZa" },
];

const EncoderRules = () => {
  const [maxLength, setMaxLength] = useAtom(maxLengthAtom);
  const [autoSelectLength, setAutoSelectLength] = useAtom(autoSelectLengthAtom);
  const [autoSelectPattern, setAutoSelectPattern] = useAtom(
    autoSelectPatternAtom,
  );
  const [selectKeys, setSelectKeys] = useAtom(selectKeysAtom);
  const [wordRules, setWordRules] = useAtom(wordRulesAtom);
  const [shortCodeSchemes, setShortCodeSchemes] = useAtom(shortCodeSchemesAtom);
  const wordLengthArray = [...Array(9).keys()].map((x) => ({
    label: x + 2,
    value: x + 2,
  }));
  const currentSelectKeys = selectKeys ?? [];
  const currentWordRules = wordRules ?? defaultRules;
  const currentShortCodeSchemes = shortCodeSchemes ?? [];
  const { alphabet } = useAtomValue(configFormAtom);
  const allowedSelectKeys = printableAscii.filter((x) => !alphabet.includes(x));
  return (
    <>
      <Typography.Title level={3}>编码特性</Typography.Title>
      <Flex gap="middle" justify="center">
        <Form.Item label="最大码长">
          <Select
            value={maxLength}
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => ({
              label: x.toString(),
              value: x,
            }))}
            onChange={setMaxLength}
          />
        </Form.Item>
        <Form.Item label="顶屏码长">
          <Select
            value={autoSelectLength}
            options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
              .map((x) => ({
                label: x.toString(),
                value: x as number | undefined,
              }))
              .concat([{ label: "不自动顶屏", value: undefined }])}
            onChange={setAutoSelectLength}
          />
        </Form.Item>
        <Form.Item label="顶屏模式">
          <Input
            value={autoSelectPattern}
            onChange={(e) => setAutoSelectPattern(e.target.value)}
          />
        </Form.Item>
      </Flex>
      <Form.Item label="选择键">
        <KeyList
          keys={currentSelectKeys}
          setKeys={setSelectKeys}
          allKeys={allowedSelectKeys}
        />
      </Form.Item>
      <Typography.Title level={3}>简码</Typography.Title>
      <Flex vertical align="center">
        {currentShortCodeSchemes.map((scheme, index) => {
          return (
            <Flex key={index} gap="middle">
              <Form.Item label="规则">
                <Select
                  value={scheme.prefix}
                  options={[1, 2, 3, 4].map((x) => ({
                    label: `前 ${x} 码`,
                    value: x,
                  }))}
                  onChange={(value) => {
                    setShortCodeSchemes(
                      currentShortCodeSchemes.map((s, i) =>
                        i === index ? { ...s, prefix: value } : s,
                      ),
                    );
                  }}
                />
              </Form.Item>
              <Form.Item label="数量">
                <Select
                  value={scheme.count ?? 1}
                  options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((x) => ({
                    label: `${x} 重`,
                    value: x,
                  }))}
                  onChange={(value) => {
                    setShortCodeSchemes(
                      currentShortCodeSchemes.map((s, i) =>
                        i === index ? { ...s, count: value } : s,
                      ),
                    );
                  }}
                />
              </Form.Item>
              <DeleteButton
                onClick={() => {
                  setShortCodeSchemes(
                    currentShortCodeSchemes.filter((_, i) => i !== index),
                  );
                }}
              />
            </Flex>
          );
        })}
        <Space>
          <Button
            onClick={() =>
              setShortCodeSchemes(currentShortCodeSchemes.concat({ prefix: 2 }))
            }
          >
            添加简码规则
          </Button>
        </Space>
      </Flex>
      <Typography.Title level={3}>构词</Typography.Title>
      <Flex vertical align="center">
        {currentWordRules.map((rule, index) => {
          return (
            <Flex key={index} gap="middle" justify="center">
              {"length_equal" in rule ? (
                <Form.Item label="长度等于">
                  <Select
                    style={{ width: 96 }}
                    value={rule.length_equal}
                    options={wordLengthArray}
                    onChange={(value) => {
                      setWordRules(
                        currentWordRules.map((r, i) =>
                          i === index ? { ...rule, length_equal: value } : r,
                        ),
                      );
                    }}
                  />
                </Form.Item>
              ) : (
                <Form.Item label="长度范围">
                  <Cascader
                    style={{ width: 96 }}
                    value={rule.length_in_range}
                    options={wordLengthArray
                      .slice(0, wordLengthArray.length - 1)
                      .map((x) => ({
                        ...x,
                        children: wordLengthArray.filter(
                          (y) => y.value > x.value,
                        ),
                      }))}
                    onChange={(value) => {
                      setWordRules(
                        currentWordRules.map((r, i) =>
                          i === index
                            ? {
                                ...rule,
                                length_in_range: value as [number, number],
                              }
                            : r,
                        ),
                      );
                    }}
                  />
                </Form.Item>
              )}
              <Form.Item label="规则">
                <Input
                  value={rule.formula}
                  onChange={(e) => {
                    setWordRules(
                      currentWordRules.map((r, i) =>
                        i === index ? { ...rule, formula: e.target.value } : r,
                      ),
                    );
                  }}
                />
              </Form.Item>
              <DeleteButton
                onClick={() => {
                  setWordRules(currentWordRules.filter((_, i) => i !== index));
                }}
              />
            </Flex>
          );
        })}
        <Space>
          <Button
            onClick={() =>
              setWordRules(currentWordRules.concat(defaultRules[0]!))
            }
          >
            添加规则
          </Button>
          <Button
            onClick={() =>
              setWordRules(currentWordRules.concat(defaultRules[2]!))
            }
          >
            添加规则（范围）
          </Button>
        </Space>
      </Flex>
    </>
  );
};

export default EncoderRules;
