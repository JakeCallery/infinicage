import "./style.css";
import Engine from "./engine/Engine.ts";

const step = (engine: Engine) => {
  console.log("Step");
  if (engine.isRunning) engine.pause();
  engine.update(performance.now(), { manualUpdate: true });
};

const run = (engine: Engine) => {
  console.log("Run");
  engine.update();
};

const engine: Engine = Engine.getInstance();

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div xmlns="http://www.w3.org/1999/html">
    <div>
      <canvas id="mainCanvas" class="mainCanvas" width="800px" height="600px">
        Super fun canvas
      </canvas>
    </div>
    <button id="stepButton"">Step</button>
    <button id="runButton"">Run</button>
  </div>
`;

document.onreadystatechange = async () => {
  console.log("Doc Ready State: ", document.readyState);
  if (document.readyState === "complete") {
    const stepButton = document.getElementById(
      "stepButton",
    ) as HTMLButtonElement;
    const runButton = document.getElementById("runButton") as HTMLButtonElement;

    engine.init(
      document.getElementById("mainCanvas") as HTMLCanvasElement,
      "nc.png",
      4,
    );
    stepButton.addEventListener("click", () => step(engine));
    runButton.addEventListener("click", () => run(engine));
  }
};
