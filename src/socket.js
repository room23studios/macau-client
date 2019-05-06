import { useRef, useState, useCallback, useEffect } from "react";

export const SocketState = Object.freeze({
  CONNECTING: Symbol("connecting"),
  OPEN: Symbol("open"),
  CLOSED: Symbol("closed"),
  RECONNECTING: Symbol("reconnecting")
});

export default function useSocket(addr, { onMessage, onError }) {
  const socket = useRef(null);
  const [connectionState, setConnectionState] = useState(
    SocketState.CONNECTING
  );

  // First reconnect attempt happens after 100ms, next after 1000, etc.
  // TODO: make configurable
  const reconnectTimeouts = [100, 1000, 5000, 10000, null];

  // Keep track of reconnect attempts.
  const [tries, setTries] = useState(0);

  // This effect will run on the first render and whenever the connection
  // attempt count increases (which we then use to trigger reconnects after the
  // timeout)
  useEffect(() => {
    // connect to the websocket
    console.log("Connecting...");
    const ws = new WebSocket(addr);

    ws.addEventListener("open", e => {
      socket.current = ws;
      console.log("Connected.");
      setConnectionState(SocketState.OPEN);
    });

    ws.addEventListener("message", e => {
      onMessage && onMessage(e.data);
    });

    ws.addEventListener("error", e => {
      onError && onError(e);
    });

    ws.addEventListener("close", e => {
      socket.current = null;
      setConnectionState(SocketState.CLOSED);

      // TODO: don't reconnect when closed by the clanup function?
      const timeout = reconnectTimeouts[tries];
      if (timeout == null) return;

      console.log("Trying to reconnect in", timeout, "seconds.");

      setTimeout(() => {
        setConnectionState(SocketState.RECONNECTING);

        // updating this value will cause the effect to rerun because it is in
        // its dependency array
        setTries(tries => tries + 1);
      }, timeout);
    });

    // cleanup
    return () => {
      // We don't need to setConnectionState(SocketState.CLOSED) because the onclose callback will be fired anyway.
      socket.current = null;
      try {
        ws.close();
      } catch (e) {}
    };
  }, [tries]);

  // return a function that allows to send messages
  const send = useCallback(
    data => {
      socket.current && socket.current.send(data);
    },
    [socket]
  );

  return [send, connectionState];
}
