export default class Engine {
  private static instance: Engine;

  private _startTime: number = document.timeline.currentTime;
  private _rafId: number = -1;
  private _isRunning: boolean = false;
  private _isImageLoaded: boolean = false;
  private _image: HTMLImageElement | undefined;
  private _imageBitmap: ImageBitmap | undefined;
  private _imageData: ImageData | undefined;
  private _ctx: CanvasRenderingContext2D | undefined | null;

  private canvasDataList: ImageData[];

  private constructor() {}

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  public init(canvas: HTMLCanvasElement, imagePath: string) {
    console.log("Init canvas: ", canvas);

    this._ctx = canvas.getContext("2d");

    this._image = new Image();
    this._image.addEventListener("load", async () => {
      this._isImageLoaded = true;
      console.log("Image Loaded");
      if (this._image) {
        this._imageBitmap = await createImageBitmap(this._image);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this._imageBitmap.width;
        tempCanvas.height = this._imageBitmap.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx!.drawImage(this._imageBitmap, 0, 0);
        this._imageData = tempCtx!.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        );
        console.log("Image Data: ", this._imageData);
      }
    });

    this._image.src = imagePath;
  }

  public pause() {
    console.log("Engine Paused");
    cancelAnimationFrame(this._rafId);
    this._isRunning = false;
  }
  public update(
    prevTimestamp: Number = -1,
    { manualUpdate = false }: { manualUpdate?: boolean } = {},
  ) {
    if (!manualUpdate) {
      this._rafId = requestAnimationFrame((ts) =>
        this.update(ts, { manualUpdate }),
      );
      this._isRunning = true;
    }

    if (this._ctx && this._imageBitmap && this._imageData) {
      this._ctx.putImageData(this._imageData, 0, 0);
    }
  }

  public get isRunning() {
    return this._isRunning;
  }
}
