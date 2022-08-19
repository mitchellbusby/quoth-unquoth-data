import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { OpenLayersMap } from "./OpenLayersMap";

const App = () => {
  return (
    <div>
      <OpenLayersMap />
      <div
        style={{
          background: "white",
          width: "200px",
          height: "200px",
          position: "fixed",
          right: "var(--space-s)",
          bottom: "var(--space-s)",
          borderRadius: "var(--surface-border-radius)",
          boxShadow: "var(--shadow-elevation-medium)",
        }}
      >
        controls
      </div>
    </div>
  );
};

export default function mountApp(mountElement: HTMLElement) {
  ReactDOM.createRoot(mountElement).render(<App />);
}
