import CircularSlider from "@fseehawer/react-circular-slider";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppStateContext } from "./AppState";
import { DateTime } from "luxon";
import { Button } from "./components/Button";
import { css } from "@emotion/react";

const Clock = () => {
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
      <div>
        <CircularSlider
          min={0}
          max={86400}
          onChange={(value: number) => {
            setTimeOfDay(value);
          }}
          dataIndex={timeOfDay}
          width={150}
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
                font-size: 24px;
              `}
            >
              {timeString}
            </div>
          }
        />
      </div>
    </div>
  );
};

export { Clock };
