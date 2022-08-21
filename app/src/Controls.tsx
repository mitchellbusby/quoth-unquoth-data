import { css } from "@emotion/react";
import styled from "@emotion/styled";
import {
  faSliders,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useEffect, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useLocalStorage } from "usehooks-ts";
import { AppStateContext } from "./AppState";
import { BusList, BusDistributionType } from "./buses";
import { Button } from "./components/Button";
import { Select } from "./components/Select";
import { ClassNames } from "@emotion/react";
import { CreateEditRoutes } from "./CreateEditRoutes";

const ControlsElement = styled.div(() => ({
  background: "white",
  width: "300px",
  height: "calc(100vh - 4 * var(--space-s))",
  position: "fixed",
  right: "var(--space-s)",
  top: "var(--space-s)",
  borderRadius: "var(--surface-border-radius)",
  boxShadow: "var(--shadow-elevation-medium)",
  padding: "var(--space-m)",
  transition: "transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1);",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-m)",
}));

export const Controls = () => {
  const [hidden, setHidden] = useLocalStorage("controlshidden", false);

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
                transform: translateX(calc(332px + 8px));
              `
            : css`
                transform: none;
              `
        }
      >
        <div css={{ display: "flex", alignItems: "center" }}>
          <div css={{ fontSize: 24, fontWeight: 500 }}>Controls</div>
          <Button
            onClick={() => setHidden(true)}
            size={"small"}
            css={{ marginLeft: "auto", padding: "6px 12px" }}
          >
            <FontAwesomeIcon icon={faXmark}></FontAwesomeIcon>
          </Button>
        </div>
        <div>
          <CreateEditRoutes />
        </div>
        <div>Goodies</div>
        <div
          css={css`
            display: flex;
            gap: var(--space-xs);
          `}
        >
          <label htmlFor="bus-select">Bus icon:</label>
          <Select
            id="bus-select"
            onChange={(event) => {
              handleChangeBusDistribution(
                event.target.value as BusDistributionType
              );
            }}
            value={selectedBusDistribution}
          >
            {BusList.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.label}
              </option>
            ))}
          </Select>
        </div>
      </ControlsElement>
      <ClassNames>
        {({ css }) => (
          <CSSTransition
            in={hidden}
            mountOnEnter
            unmountOnExit
            timeout={200}
            classNames={{
              enterActive: css({
                transform: "none",
                opacity: 1,
                transition: "all 200ms",
              }),
              enter: css({
                transform: "scale(0.5)",
                opacity: 0,
              }),
              exit: css({
                transform: "none",
                opacity: 1,
              }),
              exitActive: css({
                transform: "scale(0.5)",
                opacity: 0,
                transition: "all 200ms",
              }),
            }}
          >
            <div
              css={css`
                position: fixed;
                top: 8px;
                right: 8px;
                z-index: 10000;
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
                <FontAwesomeIcon icon={faSliders} size="lg"></FontAwesomeIcon>
              </Button>
            </div>
          </CSSTransition>
        )}
      </ClassNames>
    </>
  );
};
