import {
  Condition,
  Config,
  ElementCache,
  ElementResult,
  TotalCache,
  TotalResult,
} from "./config";
import { getPhonetic } from "./pinyin";
import { getRoot } from "./root";

export const table: Record<
  Condition["operator"],
  (target?: string, value?: string) => boolean
> = {
  是: (t, v) => t === v,
  不是: (t, v) => t !== v,
  有: (t) => t !== undefined,
  没有: (t) => t === undefined,
};

const satisfy = (condition: Condition, data: ElementResult) => {
  const { label, operator, value } = condition;
  const target = data[label];
  const fn = table[operator];
  return fn(target, value);
};

const compile = (encoder: Config["encoder"], elements: Config["elements"]) => {
  const elementReverseLookup = {} as Record<
    string,
    Record<string, string> | undefined
  >;
  for (const { nodes, mapping } of elements) {
    for (const node of nodes) {
      elementReverseLookup[node] = mapping;
    }
  }
  return (data: TotalResult) => {
    let node: string | null = "s0";
    const codes = [] as string[];
    while (node) {
      if (node.startsWith("s")) {
        const index = parseInt(node.slice(1));
        const { label, next, length } = encoder.sources[index];
        if (node !== "s0") {
          const element = data[label]!;
          const mapping = elementReverseLookup[label];
          const elementcode =
            mapping === undefined ? element : mapping[element];
          codes.push(elementcode.slice(0, length || 1));
        }
        node = next;
      } else {
        const index = parseInt(node.slice(1));
        const condition = encoder.conditions[index];
        if (satisfy(condition, data)) {
          node = condition.positive;
        } else {
          node = condition.negative;
        }
      }
    }
    return codes.join("");
  };
};

export const getCache = (
  list: string[],
  elements: Config["elements"],
  data: Config["data"],
) => {
  const cache = elements.map((config) => {
    switch (config.type) {
      case "字根":
        return getRoot(list, data, config);
      case "字音":
        return getPhonetic(list, data, config);
    }
  });
  return Object.fromEntries(
    list.map((char) => {
      const ers = cache.map((a) => a[char]);
      return [
        char,
        ers.reduce(
          (prev, curr) =>
            prev.map((x) => curr.map((y) => Object.assign({}, x, y))).flat(),
          [{ char }],
        ),
      ];
    }),
  ) as TotalCache;
};

const encode = (
  encoder: Config["encoder"],
  elements: Config["elements"],
  characters: string[],
  cache: TotalCache,
) => {
  const func = compile(encoder, elements);
  const result = Object.fromEntries(
    characters.map((char) => [char, cache[char].map(func)]),
  );
  return result;
};

export default encode;
