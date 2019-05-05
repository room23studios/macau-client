import "./index.css";

import React from "react";
import { render } from "react-dom";

import App from "./App";

const token = document.getElementById("app").dataset.token;

render(<App token={token} />, document.querySelector("#app"));
