import { useContext, useEffect, useMemo, useState } from "react";
import { AppStateContext } from "./AppState";
import { DateTime, Duration } from "luxon";
import { Button } from "./components/Button";

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

    return date.toFormat("HH:mm a");
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
      <div>Time of day</div>
      <div>{timeString}</div>
      <div
        css={{
          display: "flex",
          gap: "4px",
        }}
      >
        <Button onClick={makeHandleTimeTravelClick(-10 * 60)}>-10m</Button>
        <Button onClick={makeHandleTimeTravelClick(10 * 60)}>+10m</Button>
      </div>
    </div>
  );
};

export { Clock };
