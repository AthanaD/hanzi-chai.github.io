import type { Draw } from "./data";

/**
 * GF2001-2001 给出的笔画分类规范，将 31 种笔画分为 5 类
 * 类别用数字表示
 * 在本系统中，出于字根认同的考虑，在撇中分出了平撇、捺中分出了平捺、点中分出了平点
 * 所以比 GF2001-2001 中的分类多了 3 种，一共 34 种
 */
export const classifier = {
  横: 1,
  提: 1,
  竖: 2,
  竖钩: 2,
  撇: 3,
  平撇: 3,
  点: 4,
  平点: 4,
  捺: 4,
  平捺: 4,
  横钩: 5,
  横撇: 5,
  横折: 5,
  横折钩: 5,
  横斜钩: 5,
  横折提: 5,
  横折折: 5,
  横折弯: 5,
  横撇弯钩: 5,
  横折弯钩: 5,
  横折折撇: 5,
  横折折折: 5,
  横折折折钩: 5,
  竖提: 5,
  竖折: 5,
  竖弯: 5,
  竖弯钩: 5,
  竖折撇: 5,
  竖折折钩: 5,
  竖折折: 5,
  撇点: 5,
  撇折: 5,
  弯钩: 5,
  斜钩: 5,
};

/**
 * 给定方案配置文件中的不完整的分类器，将其与默认的分类器合并
 * 得到一个完整的分类器
 */
export const mergeClassifier = (
  partialClassifier?: Record<Feature, number>,
) => {
  return { ...classifier, ...(partialClassifier ?? {}) };
};

export type Feature = keyof typeof classifier;

export type Classifier = typeof classifier;

/**
 * 特定类型的笔画在数据库中的表示所包含的 SVG 命令的类别和数量是固定的
 * 比如，横折折折钩的表示一定是 h v h v，不会有其他可能性
 * 另外，平撇、平点、平捺的命令是 z，这个不是规范的 SVG 命令，只是为了和撇、点、捺的 c 区分
 * z 和 c 的实际效果是一样的
 */
export const schema: Record<Feature, Draw["command"][]> = {
  横: ["h"],
  提: ["h"],
  竖: ["v"],
  竖钩: ["v"],
  撇: ["c"],
  平撇: ["z"],
  点: ["c"],
  平点: ["z"],
  捺: ["c"],
  平捺: ["z"],
  横钩: ["h"],
  横撇: ["h", "c"],
  横折: ["h", "v"],
  横折钩: ["h", "v"],
  横斜钩: ["h", "c"],
  横折提: ["h", "v", "h"],
  横折折: ["h", "v", "h"],
  横折弯: ["h", "v", "h"],
  横撇弯钩: ["h", "c", "v"],
  横折弯钩: ["h", "v", "h"],
  横折折撇: ["h", "v", "h", "c"],
  横折折折: ["h", "v", "h", "v"],
  横折折折钩: ["h", "v", "h", "v"],
  竖提: ["v", "h"],
  竖折: ["v", "h"],
  竖弯: ["v", "h"],
  竖弯钩: ["v", "h"],
  竖折撇: ["v", "h", "c"],
  竖折折钩: ["v", "h", "v"],
  竖折折: ["v", "h", "v"],
  撇点: ["c", "c"],
  撇折: ["c", "h"],
  弯钩: ["v"],
  斜钩: ["c"],
};
