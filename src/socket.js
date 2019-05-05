import { useRef, useCallback, useEffect } from "react";

const command = (type, data) => JSON.stringify({ command: type, data });

export default function useSocket(token, onMessage) {
  const socket = useRef(null);
  useEffect(() => {
    // connect to the websocket
    const ws = new WebSocket("ws://localhost:1234/socket");

    // send the auth token
    ws.addEventListener("open", () => {
      ws.send(command("hello", { token }));

      // set a reference to the socket
      socket.current = ws;
    });

    // register a message listener
    ws.addEventListener("message", e => {
      const data = JSON.parse(e.data);

      // log the message
      console.log(data);

      // call the callback
      onMessage(data);
    });

    // cleanup
    return () => {
      // TODO: send disconnection event
      socket.current = null;
      try {
        ws.close();
      } catch (e) {}
    };
  }, []);

  // return a function that allows to send commands
  return useCallback(
    (type, data) => {
      console.log("trying to send");
      socket.current && socket.current.send(command(type, data));
    },
    [socket]
  );
}
