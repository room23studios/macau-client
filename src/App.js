import "./App.css";

import React, { useEffect, useReducer } from "react";
import useSocket from "./socket.js";

function reducer(state, { command, data }) {
  switch (command) {
    case "hello":
      return { ...state, connected: true };
  }
}

function App({ token }) {
  const [state, dispatch] = useReducer(reducer, { connected: false });
  const send = useSocket(token, dispatch);

  return (
    <div className="App">
      connected: {state.connected ? "yes" : "no"}{" "}
      {state.connected && (
        <a href="#" onClick={() => send("ping", { payload: "kek" })}>
          [send a ping]
        </a>
      )}
    </div>
  );
}

export default App;
