import { focusAtom } from "jotai-optics";
import { encoderAtom } from ".";
import { ShortCodeRule, ShortCodeScheme, WordRule } from "~/lib";

export const maxLengthAtom = focusAtom(encoderAtom, (o) =>
  o.prop("max_length"),
);

export const autoSelectLengthAtom = focusAtom(encoderAtom, (o) =>
  o.prop("auto_select_length"),
);

export const autoSelectPatternAtom = focusAtom(encoderAtom, (o) =>
  o.prop("auto_select_pattern"),
);

export const selectKeysAtom = focusAtom(encoderAtom, (o) =>
  o.prop("select_keys").valueOr([] as string[]),
);

export const shortCodeConfigAtom = focusAtom(encoderAtom, (o) =>
  o.prop("short_code").valueOr([] as ShortCodeRule[]),
);

export const wordRulesAtom = focusAtom(encoderAtom, (o) =>
  o.prop("rules").valueOr([] as WordRule[]),
);

export const priorityShortCodesAtom = focusAtom(encoderAtom, (o) =>
  o.prop("priority_short_codes").valueOr([] as [string, string, number][]),
);

export const sourcesAtom = focusAtom(encoderAtom, (o) => o.prop("sources"));

export const conditionsAtom = focusAtom(encoderAtom, (o) =>
  o.prop("conditions"),
);
