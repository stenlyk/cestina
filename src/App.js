import React from "react";
import ErrorBoundary from "./ErrorBoundary";
import Root, { version } from "./Root.js";
import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";

LogRocket.init("pocitejsamcz/pocitejsamcz");
setupLogRocketReact(LogRocket);

function App() {
  return (
    <div className="App container">
      <div className="row justify-content-center">
        <div className="col-auto">
          <img
            src={process.env.PUBLIC_URL + "/ic-logo.svg"}
            alt="počítej sám"
            className="logo"
          />
        </div>
      </div>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
      <div className="footer row">
        <div className="col">
          <a href="https://github.com/stenlyk/nasobilka/issues" taget="_blank">
            Našel jsi chybu?
          </a>
        </div>
        <div className="col text-right">ver {version}</div>
      </div>
    </div>
  );
}

export default App;
