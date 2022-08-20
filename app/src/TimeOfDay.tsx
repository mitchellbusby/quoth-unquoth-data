import React from "react";

export function TimeOfDay({ seconds }: { seconds: number }) {
  var date = new Date(0);
  date.setSeconds(seconds);
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
      }}
    >
      {timeString}
    </div>
  );
}
