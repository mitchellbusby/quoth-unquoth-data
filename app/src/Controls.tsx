import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { useState } from "react";
import { BusList, BusType } from "./buses";

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
  transition: "transform 400ms ease",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-m)",
}));

export const Controls = ({
  selectedBus,
  onSelectBus,
}: {
  selectedBus: BusType;
  onSelectBus: (busType: BusType) => void;
}) => {
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
        <div>
          Controls <button onClick={() => setHidden(true)}>Hide</button>
        </div>
        <div
          css={css`
            display: flex;
            gap: var(--space-xs);
          `}
        >
          <label htmlFor="bus-select">Bus icon:</label>
          <select
            id="bus-select"
            onChange={(event) => {
              onSelectBus(event.target.value as BusType);
            }}
            value={selectedBus}
          >
            {BusList.map((bus) => (
              <option value={bus.id}>{bus.label}</option>
            ))}
          </select>
        </div>
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
