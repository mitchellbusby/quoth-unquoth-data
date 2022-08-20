import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { AppStateContext } from "./AppState";
import { BusList, BusDistributionType } from "./buses";
import { Button } from "./components/Button";

const ControlsElement = styled.div(() => ({
  background: "white",
  width: "300px",
  height: "calc(100vh - 4 * var(--space-s))",
  position: "fixed",
  right: "var(--space-s)",
  top: "var(--space-s)",
  borderRadius: "var(--surface-border-radius)",
  boxShadow: "var(--shadow-elevation-medium)",
  padding: "var(--space-s)",
  transition: "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-m)",
}));

export const Controls = () => {
  const [hidden, setHidden] = useState(true);

  const [selectedBusDistribution, setSelectedBus] =
    useLocalStorage<BusDistributionType>(
      "busdistributionconfiguration",
      "standard"
    );

  const appState = useContext(AppStateContext);

  useEffect(() => {
    appState.busDistribution = selectedBusDistribution;
  }, [selectedBusDistribution]);

  const handleChangeBusDistribution = (newValue: BusDistributionType) => {
    setSelectedBus(newValue);
  };

  return (
    <>
      <ControlsElement
        css={
          hidden
            ? css`
                transform: translateX(324px);
              `
            : css`
                transform: none;
              `
        }
      >
        <div css={{ display: "flex" }}>
          Controls{" "}
          <Button
            onClick={() => setHidden(true)}
            size={"small"}
            css={{ marginLeft: "auto" }}
          >
            <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
          </Button>
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
              handleChangeBusDistribution(
                event.target.value as BusDistributionType
              );
            }}
            value={selectedBusDistribution}
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
            top: 8px;
            right: 8px;
          `}
        >
          <Button
            css={{
              padding: 16,
            }}
            onClick={() => {
              setHidden(false);
            }}
          >
            <FontAwesomeIcon
              icon={faWandMagicSparkles}
              size="lg"
            ></FontAwesomeIcon>
          </Button>
        </div>
      )}
    </>
  );
};
