import styled from "styled-components";

const FontView = ({ reference }: { reference: string }) => (
  <SVG
    id="fontsvg"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width="100%"
    viewBox="0 0 1000 1000"
  >
    <path d={reference} transform="matrix(1,0,0,-1,0,850)" />
  </SVG>
);

const processPath = ({ start, curveList }: Stroke) =>
  "M" +
  start.join(" ") +
  curveList
    .map(({ command, parameterList }) => command + parameterList.join(" "))
    .join("");

const StrokesView = ({ glyph }: { glyph: Stroke[] }) => (
  <SVG
    id="datasvg"
    xmlns="http://www.w3.org/2000/svg"
    version="1.1"
    width="100%"
    viewBox="0 0 100 100"
  >
    {glyph.map((stroke, index) => (
      <path
        key={index}
        d={processPath(stroke)}
        stroke="red"
        strokeWidth="1"
        fill="none"
      />
    ))}
  </SVG>
);

const SVG = styled.svg`
  position: absolute;
`

export default function ComponentView({ component }: { component: Component }) {
  return (
    <Wrapper>
      <h2>查看 SVG</h2>
      { component ? <Overlay>
        <FontView reference={component.shape[0].reference} />
        <StrokesView glyph={component.shape[0].glyph} />
      </Overlay> : <Overlay />}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  text-align: center;
  width: 42%;
  position: relative;
`;

const Overlay = styled.div`
  border: 1px solid black;
  aspect-ratio: 1;
`