import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useState } from "react";

const ControlsElement = styled.div(() => ({
  background: "white",
  width: "200px",
  height: "200px",
  position: "fixed",
  right: "var(--space-s)",
  bottom: "var(--space-s)",
  borderRadius: "var(--surface-border-radius)",
  boxShadow: "var(--shadow-elevation-medium)",
  padding: "var(--space-s)",
  transition: "all 400ms ease",
}));

export const Controls = () => {
  const [hidden, setHidden] = useState(false);
  return (
    <>
      <ControlsElement
        css={
          hidden
            ? css`
                transform: translateX(300px);
              `
            : css`
                transform: none;
              `
        }
      >
        Controls <button onClick={() => setHidden(true)}>Hide</button>
      </ControlsElement>
      {hidden && (
        <div
          css={css`
            position: fixed;
            bottom: 8px;
            right: 8px;
          `}
        >
          <button
            onClick={() => {
              setHidden(false);
            }}
          >
            {"Show"}
          </button>
        </div>
      )}
    </>
  );
};
