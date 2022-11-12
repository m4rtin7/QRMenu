import React from "react";
import "./App.css";
import Menu from "./components/Menu";

function App() {
  return (
    <div className="App">
      <div style= {{margin: '20px'}}>
        <h2> Menu </h2>
      </div>
      <section>
        <Menu />
      </section>
    </div>
  );
}

export default App;
