import CircularSlider from "@fseehawer/react-circular-slider";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppStateContext } from "./AppState";
import { DateTime } from "luxon";
import { Button } from "./components/Button";
import { css } from "@emotion/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDay,
  faDownLeftAndUpRightToCenter,
  faPause,
  faPlay,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import { useLocalStorage } from "usehooks-ts";
import { days, DEFAULT_DAY, getNextDay } from "./timeConfiguration";
import { Select } from "./components/Select";

const breakpointForRadialClock = "768px";

/**
 * Start of day from UTC
 */
const START_OF_DAY_IN_MINUTES = 9 * 60 * 60;

const secondsInADay = 24 * 60 * 60;
const secondsInAWeek = 7 * secondsInADay;

let lastTick = Date.now();

const Clock = () => {
  const [clockScale, setClockScale] = useLocalStorage<"small" | "large">(
    "clockscale",
    "large"
  );
  const [clockSpeed, setClockSpeed] = useLocalStorage<
    "slow" | "medium" | "fast"
  >("clockspeed", "medium");

  const [pauseClock, setPauseClock] = useLocalStorage("clockpaused", false);

  useEffect(() => {
    // @ts-ignore
    window.setClockSpeed = setClockSpeed;
  }, []);

  const appState = useContext(AppStateContext);
  const [timeOfDay, setTimeOfDay] = useState<number>(START_OF_DAY_IN_MINUTES);
  const [dayOfWeek, setDayOfWeek] = useState<string>(DEFAULT_DAY);

  requestAnimationFrame(() => {
    if (!pauseClock) {
      setTimeOfDay((timeOfDay) => {
        const tick = Date.now();
        const nextTimeOfDay =
          timeOfDay + (tick - lastTick) / speedToValue(clockSpeed);
        lastTick = tick;

        const overflow = nextTimeOfDay % (24 * 60 * 60);

        if (overflow < timeOfDay) {
          setDayOfWeek(getNextDay(dayOfWeek));
        }

        return overflow;
      });
    }
  });

  useEffect(() => {
    appState.frameCount = timeOfDay;
  }, [timeOfDay]);

  useEffect(() => {
    appState.dayOfWeek = dayOfWeek;
  }, [dayOfWeek]);

  const timeString = useMemo(() => {
    const date = DateTime.fromSeconds(timeOfDay, { zone: "UTC" });

    return date.toFormat("hh:mm a");
  }, [timeOfDay]);

  return (
    <div
      css={{ position: "fixed", left: 32 + 8, top: 8, display: "flex", gap: 4 }}
    >
      <div
        css={{
          background: "white",
          padding: 32,
          borderRadius: 8,
          boxShadow: "var(--shadow-elevation-medium)",
          display: "grid",
          gap: "4px",
          position: "relative",
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
            bottom: 4,
            left: 4,
            padding: "3px 9px",
          }}
          size="small"
          onClick={() => {
            if (pauseClock) {
              lastTick = Date.now();
            }
            setPauseClock(!pauseClock);
          }}
        >
          <FontAwesomeIcon icon={pauseClock ? faPlay : faPause} />
        </Button>
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
      <div
        css={{
          background: "white",
          padding: 16,
          borderRadius: 8,
          boxShadow: "var(--shadow-elevation-medium)",
          height: "fit-content",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <label
          css={{
            fontSize: 14,
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}
          htmlFor="dayofweekselector"
        >
          <FontAwesomeIcon icon={faCalendarDay} />
          Day of week
        </label>
        <Select
          id="dayofweekselector"
          value={dayOfWeek}
          onChange={(event) => {
            setDayOfWeek(event.target.value);
          }}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

const speedToValue = (speed) =>
  ({
    slow: 30,
    medium: 16,
    fast: 8,
  }[speed]);

export { Clock };
