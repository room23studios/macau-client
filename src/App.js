import "./App.css";

import React, { useReducer, useEffect } from "react";
import useSocket, { SocketState } from "./socket.js";

const command = (type, data) => JSON.stringify({ command: type, data });

function reducer(state, { command, data }) {
  switch (command) {
    case "hello":
      return { ...state, connected: true };
  }
}

function App({ token }) {
  const [state, dispatch] = useReducer(reducer, { connected: false });

  const onMessage = msg => dispatch(JSON.parse(msg));

  const [sendMessage, connectionState] = useSocket(
    "ws://localhost:1234/socket",
    { onMessage }
  );

  useEffect(() => {
    if (connectionState != SocketState.OPEN) return;
    sendMessage(command("hello", { token }));
  }, [connectionState, token]);

  return (
    <div className="App">
      connected: {connectionState == SocketState.OPEN ? "yes" : "no"}{" "}
      connected2: {state.connected ? "y" : "n"}
      {connectionState == SocketState.OPEN && (
        <a
          href="#"
          onClick={() => sendMessage(command("ping", { payload: "kek" }))}
        >
          [send a ping]
        </a>
      )}
    </div>
  );
}

export default App;
