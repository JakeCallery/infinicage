import "./style.css";
import Engine from "./engine/Engine.ts";

const step = (evt: MouseEvent, engine: Engine) => {
  console.log("Step");
  if (engine.isRunning) engine.pause();
  engine.update(performance.now(), { manualUpdate: true });
};

const run = (evt: MouseEvent, engine: Engine) => {
  console.log("Run");
  engine.update();
};

const engine: Engine = Engine.getInstance();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div xmlns="http://www.w3.org/1999/html">
    <canvas id="mainCanvas" height="200px" width="200px">
      Super fun canvas
    </canvas>
    <button id="stepButton"">Step</button>
    <button id="runButton"">Run</button>
  </div>
`;

document.onreadystatechange = () => {
  console.log("Doc Ready State: ", document.readyState);
  if (document.readyState === "complete") {
    const stepButton = document.getElementById(
      "stepButton",
    ) as HTMLButtonElement;
    const runButton = document.getElementById("runButton") as HTMLButtonElement;

    engine.init(document.getElementById("mainCanvas") as HTMLCanvasElement);
    stepButton.addEventListener("click", (evt) => step(evt, engine));
    runButton.addEventListener("click", (evt) => run(evt, engine));
  }
};
