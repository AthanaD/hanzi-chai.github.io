import { useState, memo, useCallback } from "react";
import {
  useSetAtom,
  useAtomValue,
  analysisAtom,
  displayAtom,
  useAddAtom,
  customizeAtom,
  useRemoveAtom,
} from "~/atoms";
import { Button, Flex, Popover } from "antd";
import {
  DeleteButton,
  ItemSelect,
  MinusButton,
  PlusButton,
  ElementSelect,
  ElementSelectProps,
} from "./Utils";
import Char from "./Char";

function RootSelectPopover(props: ElementSelectProps) {
  const display = useAtomValue(displayAtom);
  const [open, setOpen] = useState(false);
  return (
    <Popover
      open={open}
      onOpenChange={(v) => setOpen(v)}
      trigger="hover"
      content={
        <ElementSelect
          {...props}
          onChange={(v) => {
            props.onChange(v);
            setOpen(false);
          }}
        />
      }
    >
      <Button type="dashed" color="blue">
        {display(props.char!)}
      </Button>
    </Popover>
  );
}

const EachSequence = ({
  component,
  sequencejoin,
  display,
}: {
  component: string;
  sequencejoin: string;
  display: Function;
}) => {
  const sequence = sequencejoin.split(" ");
  const addCustomization = useAddAtom(customizeAtom);
  const removeCustomization = useRemoveAtom(customizeAtom);

  return (
    <Flex justify="space-between" key={component}>
      <Char>{display(component)}</Char>
      <Flex gap="small">
        {sequence.map((x, i) => (
          <RootSelectPopover
            key={i}
            char={x}
            onlyRootsAndStrokes
            onChange={(s) =>
              addCustomization(
                component,
                sequence.map((y, j) => (i === j ? s : y)),
              )
            }
          />
        ))}
        <PlusButton
          onClick={() => addCustomization(component, sequence.concat("1"))}
        />
        <MinusButton
          onClick={() =>
            addCustomization(component, sequence.slice(0, sequence.length - 1))
          }
        />
        <DeleteButton onClick={() => removeCustomization(component)} />
      </Flex>
    </Flex>
  );
};

const MemoEachSequence = memo(EachSequence);

const AnalysisCustomizer = () => {
  const customize = useAtomValue(analysisAtom)?.customize ?? {};
  const display = useAtomValue(displayAtom);
  const [newCustomization, setNew] = useState<string | undefined>(undefined);
  const addCustomization = useAddAtom(customizeAtom);
  return (
    <>
      {Object.entries(customize).map(([component, sequence]) => (
        <MemoEachSequence
          component={component}
          sequencejoin={sequence.join(" ")}
          key={String(component)}
          display={display}
        />
      ))}
      <Flex justify="center" gap="large">
        <ItemSelect
          value={newCustomization}
          onChange={setNew}
          customFilter={([_, glyph]) => {
            return glyph.default_type === "component";
          }}
        />
        <Button
          type="primary"
          onClick={() => addCustomization(newCustomization!, ["1"])}
          disabled={newCustomization === undefined}
        >
          添加自定义
        </Button>
      </Flex>
    </>
  );
};

export default AnalysisCustomizer;
