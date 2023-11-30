import { useEffect } from "react";
import "./App.css";
import Firebase from "./Firebase";
import { run } from "./push-notification";

function App() {
  useEffect(() => {
    run();
  }, []);

  return (
    <div>
      <Firebase>
        <h1>Push Notifications with Firebase</h1>
      </Firebase>
    </div>
  );
}

export default App;
