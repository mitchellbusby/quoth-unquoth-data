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

  const [currentTab, setCurrentTab] = useState<
    "custom-routes" | "goodies" | "stats"
  >("custom-routes");

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
        <div
          css={{
            display: "flex",
            gap: 4,
          }}
        >
          <Button onClick={() => setCurrentTab("custom-routes")}>
            Custom routes
          </Button>
          <Button onClick={() => setCurrentTab("stats")}>Stats</Button>
          <Button onClick={() => setCurrentTab("goodies")}>Goodies</Button>
        </div>
        <hr
          css={{
            borderBottom: "1px solid #c6c6c6",
            borderTop: 0,
            width: "100%",
            margin: 0,
          }}
        />
        {currentTab === "custom-routes" && (
          <div>
            <CreateEditRoutes />
          </div>
        )}
        {currentTab === "goodies" && (
          <>
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
          </>
        )}
        {currentTab === "stats" && (
          <div
            css={{
              display: "grid",
              gap: 8,
            }}
          >
            <div>City statistics</div>
            <div
              css={{
                fontSize: 14,
                display: "grid",
                gap: 4,
              }}
            >
              <div>How many people couldn't get to their destination: XX</div>
              <div>Average speed of citizens: XX</div>
            </div>
          </div>
        )}
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
