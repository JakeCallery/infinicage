export default class Engine {
  private static instance: Engine;

  private _prevTime: number = -1;
  private _rafId: number = -1;
  private _isRunning: boolean = false;

  private constructor() {
    this._manualUpdate = false;
  }

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  public init(canvas: HTMLCanvasElement) {
    console.log("Init canvas: ", canvas);
  }

  public pause() {
    console.log("Engine Paused");
    cancelAnimationFrame(this._rafId);
    this._isRunning = false;
  }
  public update(
    timeStamp: Number = -1,
    { manualUpdate = false }: { manualUpdate?: boolean } = {},
  ) {
    if (!manualUpdate) {
      this._rafId = requestAnimationFrame((ts) =>
        this.update(ts, { manualUpdate }),
      );
      this._isRunning = true;
    }

    this._prevTime = performance.now();
  }

  public get isRunning() {
    return this._isRunning;
  }
}
