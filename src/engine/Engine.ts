export default class Engine {
  private static instance: Engine;

  private _canvasWidth: number = 0;
  private _canvasHeight: number = 0;
  // private _startTime: number = document.timeline.currentTime;
  private _rafId: number = -1;
  private _isRunning: boolean = false;
  private _image: HTMLImageElement | undefined;
  private _imageBitmap: ImageBitmap | undefined;
  private _srcImageData: ImageData | undefined;
  private _mainCtx: CanvasRenderingContext2D | undefined | null;

  private _buffers: ImageData[] | undefined;
  private _numBuffers: number = 0;

  private _activeBuffIndex = 0;
  private _mouseX: number = -1;
  private _mouseY: number = -1;

  private _cursorOffsetX: number = 0;
  private _cursorOffsetY: number = 0;

  private constructor() {}

  public static getInstance(): Engine {
    if (!Engine.instance) {
      Engine.instance = new Engine();
    }

    return Engine.instance;
  }

  public init(canvas: HTMLCanvasElement, imagePath: string, numBuffers = 4) {
    console.log(`Init canvas: ${canvas.width} x ${canvas.height}`);

    this._numBuffers = numBuffers;
    this._canvasWidth = canvas.width;
    this._canvasHeight = canvas.height;

    if (this._mouseX === -1 && this._mouseY === -1) {
      this._mouseX = this._canvasWidth / 2;
      this._mouseY = this._canvasHeight / 2;
    }

    canvas.addEventListener("mousemove", (evt) => {
      const rect = (evt.target as HTMLCanvasElement).getBoundingClientRect();
      this._mouseX = Math.floor(evt.clientX - rect.left);
      this._mouseY = Math.floor(evt.clientY - rect.top);
    });

    this._mainCtx = canvas.getContext("2d");

    this._buffers = Array.from({ length: numBuffers }, () => {
      const a = new Uint8ClampedArray(
        this._canvasWidth * this._canvasHeight * 4,
      );
      return new ImageData(a, this._canvasWidth, this._canvasHeight);
    });

    this._image = new Image();
    this._image.addEventListener("load", async () => {
      console.log("Image Loaded");
      if (this._image) {
        this._cursorOffsetX = Math.round(this._image.width / 2);
        this._cursorOffsetY = Math.round(this._image.height / 2);
        this._imageBitmap = await createImageBitmap(this._image);
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this._imageBitmap.width;
        tempCanvas.height = this._imageBitmap.height;
        const tempCtx = tempCanvas.getContext("2d");
        tempCtx!.drawImage(this._imageBitmap, 0, 0);
        this._srcImageData = tempCtx!.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height,
        );
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
    _prevTimestamp: Number = -1,
    { manualUpdate = false }: { manualUpdate?: boolean } = {},
  ) {
    if (!manualUpdate) {
      this._rafId = requestAnimationFrame((ts) =>
        this.update(ts, { manualUpdate }),
      );
      this._isRunning = true;
    }

    if (this._buffers && this._srcImageData) {
      const activeBuffer = this._buffers[this._activeBuffIndex];
      const activeData = activeBuffer.data;
      const srcData = this._srcImageData.data;
      const srcWidth = this._srcImageData.width;
      const srcHeight = this._srcImageData.height;
      const dstWidth = this._canvasWidth;

      let xOff = Math.round(this._mouseX) - this._cursorOffsetX;
      let yOff = Math.round(this._mouseY) - this._cursorOffsetY;

      if (xOff < 0) xOff = 0;
      if (xOff + this._srcImageData.width > this._canvasWidth)
        xOff = this._canvasWidth - this._srcImageData.width;

      if (yOff < 0) yOff = 0;
      if (yOff + this._srcImageData.height > this._canvasHeight)
        yOff = this._canvasHeight - this._srcImageData.height;

      //Copy cage pix into array
      for (let y = 0; y < srcHeight; y++) {
        for (let x = 0; x < srcWidth; x++) {
          //TODO: Blend partially transparent pixels
          if (srcData[y * srcWidth * 4 + x * 4 + 3] !== 0) {
            activeData[(y + yOff) * dstWidth * 4 + (x + xOff) * 4] =
              srcData[y * srcWidth * 4 + x * 4];
            activeData[(y + yOff) * dstWidth * 4 + (x + xOff) * 4 + 1] =
              srcData[y * srcWidth * 4 + x * 4 + 1];
            activeData[(y + yOff) * dstWidth * 4 + (x + xOff) * 4 + 2] =
              srcData[y * srcWidth * 4 + x * 4 + 2];
            activeData[(y + yOff) * dstWidth * 4 + (x + xOff) * 4 + 3] =
              srcData[y * srcWidth * 4 + x * 4 + 3];
          }
        }
      }
      this._mainCtx?.putImageData(activeBuffer, 0, 0);
      this._activeBuffIndex = (this._activeBuffIndex + 1) % this._numBuffers;
    }
  }

  public get isRunning() {
    return this._isRunning;
  }
}
