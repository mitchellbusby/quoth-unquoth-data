import { useContext, useEffect, useState } from "react";
import { AppStateContext } from "./AppState";

const Clock = () => {
  const appState = useContext(AppStateContext);
  const [timeOfDay, setTimeOfDay] = useState<number>(0);

  requestAnimationFrame(() => {
    setTimeOfDay((timeOfDay) => (timeOfDay + 1) % (24 * 60 * 60));
  });

  useEffect(() => {
    appState.frameCount = timeOfDay;
  }, [timeOfDay]);

  var date = new Date(0);
  date.setSeconds(timeOfDay);
  var timeString = date.toISOString().substr(11, 5);
  return (
    <div
      css={{
        background: "white",
        position: "fixed",
        left: 32,
        top: 32,
        padding: 32,
        borderRadius: 8,
        boxShadow: "var(--shadow-elevation-medium)",
      }}
    >
      {timeString}
    </div>
  );
};

export { Clock };
