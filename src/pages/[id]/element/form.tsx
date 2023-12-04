import Mapping from "~/components/Mapping";
import { Typography } from "antd";
import { useState } from "react";
import { useClassifier, useDisplay, useForm } from "~/components/contants";
import { EditorColumn, EditorRow } from "~/components/Utils";
import ElementPicker from "~/components/ElementPicker";
import { getSequence } from "~/lib/component";
import StrokeSearch from "~/components/StrokeSearch";
import { useChaifenTitle } from "~/lib/hooks";
import classifier from "~/lib/classifier";

const formElementTypes = ["字根", "笔画", "二笔"] as const;
type FormElementTypes = (typeof formElementTypes)[number];

export default function RootElementConfig() {
  useChaifenTitle("字形元素");
  const [sequence, setSequence] = useState("");
  const customizedClassifier = useClassifier();
  const allStrokes = Array.from(new Set(Object.values(customizedClassifier)))
    .sort()
    .map(String);
  const allErbi = allStrokes.map((x) => allStrokes.map((y) => x + y)).flat();
  const display = useDisplay();
  const form = useForm();
  const content = Object.keys(form)
    .filter((x) => {
      const thisSequence = getSequence(form, classifier, x);
      return thisSequence.length > 1 && thisSequence.startsWith(sequence);
    })
    .sort(
      (x, y) =>
        getSequence(form, classifier, x).length -
        getSequence(form, classifier, y).length,
    );

  const contentMap = {
    字根: content,
    笔画: allStrokes,
    二笔: allErbi,
  } as Record<FormElementTypes, string[]>;
  return (
    <EditorRow>
      <EditorColumn span={8}>
        <Typography.Title level={2}>来源</Typography.Title>
        <StrokeSearch sequence={sequence} setSequence={setSequence} />
        <ElementPicker<FormElementTypes>
          types={formElementTypes}
          defaultType="字根"
          contentMap={contentMap}
          specialRendering={(x) => display(x)}
        />
      </EditorColumn>
      <EditorColumn span={16}>
        <Typography.Title level={2}>键盘映射</Typography.Title>
        <Mapping />
      </EditorColumn>
    </EditorRow>
  );
}
