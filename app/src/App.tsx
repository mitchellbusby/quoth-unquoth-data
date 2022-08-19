import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { OpenLayersMap } from "./OpenLayersMap";
import { css } from "@emotion/react";
import styled from "@emotion/styled";

const Controls = styled.div({
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

const App = () => {
  return (
    <div>
      <OpenLayersMap />
      <Controls>Controls</Controls>
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
