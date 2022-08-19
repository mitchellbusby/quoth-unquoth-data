import styled from "@emotion/styled";

const ControlsElement = styled.div({
  background: "white",
  width: "200px",
  height: "200px",
  position: "fixed",
  right: "var(--space-s)",
  bottom: "var(--space-s)",
  borderRadius: "var(--surface-border-radius)",
  boxShadow: "var(--shadow-elevation-medium)",
  padding: "var(--space-s)",
});

export const Controls = () => <ControlsElement>Controls</ControlsElement>;
