import CircularSlider from "@fseehawer/react-circular-slider";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppStateContext } from "./AppState";
import { DateTime } from "luxon";
import { Button } from "./components/Button";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownLeftAndUpRightToCenter,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { useLocalStorage } from "usehooks-ts";

const breakpointForRadialClock = "768px";

const Clock = () => {
  const [clockScale, setClockScale] = useLocalStorage<"small" | "large">(
    "clockscale",
    "large"
  );
  const appState = useContext(AppStateContext);
  const [timeOfDay, setTimeOfDay] = useState<number>(0);

  requestAnimationFrame(() => {
    setTimeOfDay((timeOfDay) => (timeOfDay + 1) % (24 * 60 * 60));
  });

  useEffect(() => {
    appState.frameCount = timeOfDay;
  }, [timeOfDay]);

  const timeString = useMemo(() => {
    const date = DateTime.fromSeconds(timeOfDay, { zone: "UTC" });

    return date.toFormat("hh:mm a");
  }, [timeOfDay]);

  const makeHandleTimeTravelClick = (delta: number) => () => {
    setTimeOfDay(timeOfDay + delta);
  };

  return (
    <div
      css={{
        background: "white",
        position: "fixed",
        left: 32 + 8,
        top: 8,
        padding: 32,
        borderRadius: 8,
        boxShadow: "var(--shadow-elevation-medium)",
        display: "grid",
        gap: "4px",
      }}
    >
      <div
        css={{
          [`@media (max-width: ${breakpointForRadialClock})`]: {
            display: "none",
          },
        }}
      >
        <CircularSlider
          min={0}
          max={86400}
          onChange={(value: number) => {
            setTimeOfDay(value);
          }}
          dataIndex={timeOfDay}
          key={clockScale}
          width={clockScale === "small" ? 150 : undefined}
          renderLabelValue={
            <div
              css={css`
                position: absolute;
                top: 0px;
                left: 0px;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: rgb(39, 43, 119);
                user-select: none;
                z-index: 1;
                font-size: ${clockScale === "small" ? 24 : 48}px;
              `}
            >
              {timeString}
            </div>
          }
        />
      </div>
      <div
        css={{
          [`@media (min-width: ${breakpointForRadialClock})`]: {
            display: "none",
          },
        }}
      >
        <div>Current time</div>
        <div>{timeString}</div>
      </div>
      <Button
        css={{
          position: "absolute",
          bottom: "4px",
          right: "4px",
          [`@media (max-width: ${breakpointForRadialClock})`]: {
            display: "none",
          },
        }}
        size="small"
        onClick={() => {
          setClockScale(clockScale === "small" ? "large" : "small");
        }}
      >
        <FontAwesomeIcon
          icon={
            clockScale === "small"
              ? faUpRightAndDownLeftFromCenter
              : faDownLeftAndUpRightToCenter
          }
        />
      </Button>
    </div>
  );
};

export { Clock };
