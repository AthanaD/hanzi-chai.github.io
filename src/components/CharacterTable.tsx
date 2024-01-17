import React, { useContext, useRef, useState } from "react";
import { isPUA, unicodeBlock } from "~/lib/utils";
import {
  Checkbox,
  Flex,
  FloatButton,
  Layout,
  Space,
  Tour,
  Typography,
} from "antd";
import type { ColumnType, ColumnsType } from "antd/es/table";
import Table from "antd/es/table";
import {
  allRepertoireAtom,
  customGlyphAtom,
  customReadingsAtom,
  displayAtom,
  primitiveRepertoireAtom,
  sequenceAtom,
  useAddAtom,
  useAtomValue,
  userRepertoireAtom,
  userTagsAtom,
} from "~/atoms";
import type { PrimitveCharacter } from "~/lib/data";
import {
  Add,
  Create,
  Delete,
  Mutate,
  QuickPatchAmbiguous,
  RemoteContext,
} from "~/components/Action";
import ComponentForm from "./ComponentForm";
import CompoundForm from "./CompoundForm";
import { remoteUpdate } from "~/lib/api";
import { DeleteButton, PlusButton, errorFeedback } from "./Utils";
import Root from "./Element";
import * as O from "optics-ts/standalone";
import CharacterQuery, {
  CharacterFilter,
  makeCharacterFilter,
} from "./CharacterQuery";
import TagPicker from "./TagPicker";
import { findGlyphIndex } from "~/lib/repertoire";
import { TourProps } from "antd/lib";
import { QuestionCircleOutlined } from "@ant-design/icons";

type Column = ColumnType<PrimitveCharacter>;

const CharacterTable = () => {
  const allRepertoire = useAtomValue(allRepertoireAtom);
  const userRepertoire = useAtomValue(userRepertoireAtom);
  const addUser = useAddAtom(userRepertoireAtom);
  const userTags = useAtomValue(userTagsAtom);
  const customGlyph = useAtomValue(customGlyphAtom);
  const addCustomGlyph = useAddAtom(customGlyphAtom);
  const customReadings = useAtomValue(customReadingsAtom);
  const sequenceMap = useAtomValue(sequenceAtom);
  const [page, setPage] = useState(1);
  const [filterProps, setFilterProps] = useState<CharacterFilter>({});
  const display = useAtomValue(displayAtom);
  const getLength = (a: string) => sequenceMap.get(a)?.length ?? Infinity;
  const remote = useContext(RemoteContext);
  const add = useAddAtom(primitiveRepertoireAtom);
  const filter = makeCharacterFilter(filterProps, allRepertoire, sequenceMap);
  const isUserCharacter = (a: string) =>
    -Number(userRepertoire[a] !== undefined);

  const dataSource = Object.entries(allRepertoire)
    .sort(([a], [b]) => getLength(a) - getLength(b))
    .sort(([a], [b]) => isUserCharacter(a) - isUserCharacter(b))
    .filter(([x]) => filter(x))
    .map(([, glyph]) => glyph);

  const unicodeColumn: Column = {
    title: "Unicode",
    dataIndex: "unicode",
    render: (_, { unicode, name }) => {
      const char = String.fromCodePoint(unicode);
      const hex = unicode.toString(16).toUpperCase();
      return (isPUA(char) ? name : char) + ` (${hex})`;
    },
    filters: [
      { text: "CJK 基本集", value: "cjk" },
      { text: "CJK 扩展集 A", value: "cjk-a" },
      { text: "非成字", value: "pua" },
    ],
    onFilter: (value, record) => {
      return unicodeBlock(record.unicode) === value;
    },
    sorter: (a, b) => a.unicode - b.unicode,
    sortDirections: ["ascend", "descend"],
    width: 128,
  };

  const tygfColumn: Column = {
    title: "通用规范",
    dataIndex: "tygf",
    width: 96,
    render: (_, record) => {
      return <Checkbox checked={record.tygf === 1} />;
    },
    filters: [
      { text: "是", value: 1 },
      { text: "否", value: 0 },
    ],
    onFilter: (value, record) => value === record.tygf,
  };

  const gb2312: Column = {
    title: "GB 2312",
    dataIndex: "gb2312",
    render: (_, record) => {
      return <Checkbox checked={record.gb2312} />;
    },
    width: 96,
    filters: [
      { text: "是", value: true },
      { text: "否", value: false },
    ],
    onFilter: (value, record) => value === record.gb2312,
  };

  const readings: Column = {
    title: "系统字音",
    dataIndex: "readings",
    render: (_, record) => {
      return (
        <Space>
          {record.readings.map((reading, index) => (
            <Root key={index}>{reading}</Root>
          ))}
        </Space>
      );
    },
    width: 128,
  };

  const gf0014: Column = {
    title: "GF0014",
    dataIndex: "gf0014_id",
    width: 128,
    filters: [{ text: "只看非空", value: 1 }],
    onFilter: (_, record) => record.gf0014_id !== null,
    sorter: (a, b) => Number(a.gf0014_id) - Number(b.gf0014_id),
  };

  const glyphs: Column = {
    title: "系统字形",
    render: (_, character) => {
      const { glyphs, unicode } = character;
      const char = String.fromCodePoint(unicode);
      const inlineUpdate = async (newCharacter: PrimitveCharacter) => {
        if (userRepertoire[char] !== undefined) {
          addUser(char, newCharacter);
          return true;
        }
        console.log(newCharacter);
        const res = await remoteUpdate(newCharacter);
        if (!errorFeedback(res)) {
          add(char, newCharacter);
        }
        return true;
      };
      const selectedIndex = findGlyphIndex(glyphs, userTags);
      return (
        <Flex gap="small">
          {glyphs.map((x, i) => {
            const lens = O.compose("glyphs", O.at(i));
            const primary = i === selectedIndex;
            return (
              <Space key={i}>
                {x.type === "compound" ? (
                  <CompoundForm
                    key={i}
                    title={`${x.operator} ${x.operandList
                      .map(display)
                      .join(" ")}`}
                    initialValues={x}
                    onFinish={(values) => {
                      const newGlyphs = O.set(
                        O.compose("glyphs", O.appendTo),
                        values,
                        O.remove(lens, character),
                      );
                      return inlineUpdate(newGlyphs);
                    }}
                    primary={primary}
                    readonly={!remote && userRepertoire[char] === undefined}
                  />
                ) : (
                  <ComponentForm
                    key={i}
                    title={`部件`}
                    initialValues={x}
                    current={String.fromCodePoint(unicode)}
                    onFinish={(values) => {
                      const newGlyphs = O.set(
                        O.compose("glyphs", O.appendTo),
                        values,
                        O.remove(lens, character),
                      );
                      return inlineUpdate(newGlyphs);
                    }}
                    primary={primary}
                    readonly={!remote && userRepertoire[char] === undefined}
                  />
                )}
                {remote || userRepertoire[char] !== undefined ? (
                  <DeleteButton
                    onClick={() => inlineUpdate(O.remove(lens, character))}
                  />
                ) : null}
              </Space>
            );
          })}
        </Flex>
      );
    },
    width: 256,
    sorter: (a, b) => {
      const [as, bs] = [JSON.stringify(a.glyphs), JSON.stringify(b.glyphs)];
      return as.localeCompare(bs);
    },
    sortDirections: ["ascend", "descend"],
  };

  const customGlyphColumn: Column = {
    title: "自定义字形",
    render: (_, character) => {
      const { unicode } = character;
      const char = String.fromCodePoint(unicode);
      const customized = customGlyph[char];
      if (customized === undefined) return null;
      return (
        <Flex gap="small">
          {customized.type === "compound" ? (
            <CompoundForm
              title={
                customized.operator +
                customized.operandList.map(display).join(" ")
              }
              initialValues={customized}
              onFinish={async (values) => {
                addCustomGlyph(char, values);
                return true;
              }}
              primary
            />
          ) : (
            <ComponentForm
              title={`部件`}
              initialValues={customized}
              current={String.fromCodePoint(unicode)}
              onFinish={async (values) => {
                addCustomGlyph(char, values);
                return true;
              }}
              primary
            />
          )}
        </Flex>
      );
    },
    width: 192,
    sorter: (a, b) => {
      const [as, bs] = [JSON.stringify(a.glyphs), JSON.stringify(b.glyphs)];
      return as.localeCompare(bs);
    },
    sortDirections: ["ascend", "descend"],
  };

  const ambiguous: Column = {
    title: "分部歧义",
    dataIndex: "ambiguous",
    render: (_, record) => {
      return <QuickPatchAmbiguous checked={record.ambiguous} record={record} />;
    },
    filters: [
      { text: "只看有歧义", value: 1 },
      { text: "只看无歧义", value: 0 },
    ],
    onFilter: (value, record) => Number(record.ambiguous) === value,
    width: 96,
  };

  const operations: Column = {
    title: "操作",
    key: "option",
    render: (_, record) => (
      <Space>
        <Add character={record} />
        <Mutate unicode={record.unicode} />
        <Delete unicode={record.unicode} />
      </Space>
    ),
    filters: [
      { text: "已编辑", value: 1 },
      { text: "未编辑", value: 0 },
    ],
    onFilter: (value, record) => {
      const char = String.fromCodePoint(record.unicode);
      const customized =
        userRepertoire[char] !== undefined ||
        customGlyph[char] !== undefined ||
        customReadings[char] !== undefined;
      return value === 1 ? customized : !customized;
    },
  };

  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);

  const [open, setOpen] = useState<boolean>(false);

  const steps: TourProps["steps"] = [
    {
      title: "自定义",
      description:
        "这里存放了汉字编码所需要的字音和字形数据。一个字可能会有零个、一个或多个字音和字形表示，默认情况下所有的字音表示都会用于生成编码，但是字形表示中只有第一个会参与编码。对于字形，如果系统中的第一个不是您想要的，您可以通过点击「自定义」来选择系统中的其他字形用于编码，或者自己创建一个部件或者复合体表示。",
      target: () => ref1.current,
    },
    {
      title: "批量自定义",
      description:
        "除此之外，您还可以在下方的「通过标签来批量选择字形」中选择一系列标签，被标签选中的系统字形会优先参与编码（例如，若您选择标签「行框」，则所有如街、衔、衡等的汉字都会选择［⿻ 行 ？］的分部方式，而不是原本排在第一位的左中右分部方式）。被选中的字形会以框选的方式突出显示。",
      target: () => ref2.current,
    },
    {
      title: "新建",
      description:
        "最后，您还可以通过点击「新建」来添加系统中没有的字或者您需要的特殊字根。新加的条目位于表格的最上方。若这个字或字根不属于 CJK 基本集或者 CJK 扩展 A，则您需要输入它的别名，系统会给它安排一个 0xF000 开头的 PUA 码位存放。",
      target: () => ref3.current,
    },
  ];

  const adminColumns = [
    unicodeColumn,
    readings,
    glyphs,
    gf0014,
    ambiguous,
    operations,
  ];
  const userColumns = [
    unicodeColumn,
    readings,
    glyphs,
    customGlyphColumn,
    operations,
  ];
  const columns: ColumnsType<PrimitveCharacter> = remote
    ? adminColumns
    : userColumns;
  return (
    <Flex
      component={Layout.Content}
      style={{ overflowY: "scroll" }}
      vertical
      align="center"
    >
      <CharacterQuery setFilter={setFilterProps} />
      <Flex
        gap="large"
        style={{ alignSelf: "stretch", paddingInline: "32px" }}
        ref={ref2}
      >
        <TagPicker />
        <div style={{ flex: 1 }} />
        <Create onCreate={(char) => {}} ref={ref3} />
      </Flex>
      <div ref={ref1}>
        <Table<PrimitveCharacter>
          dataSource={dataSource}
          columns={columns}
          size="small"
          rowKey="unicode"
          pagination={{
            pageSize: 50,
            current: page,
          }}
          onChange={(pagination) => {
            const current = pagination.current;
            current && setPage(current);
          }}
          style={{
            maxWidth: "1920px",
          }}
        />
        <Tour open={open} onClose={() => setOpen(false)} steps={steps} />
        <FloatButton
          icon={<QuestionCircleOutlined />}
          type="primary"
          style={{ right: 64 }}
          onClick={() => setOpen(true)}
        />
      </div>
    </Flex>
  );
};

export default CharacterTable;
