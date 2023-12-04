import { Color } from "./types";

export function pgcd(a: number, b: number) : number {
    a = Math.abs(a);
    b = Math.abs(b);
    if (b > a) {
       let tmp = a;
       a = b;
       b = tmp;
    }

    while (true) {
      if (b === 0) {
        return a;
      }
      a %= b;
      if (a === 0) {
        return b;
      }
      b %= a;
    }
}

export function getContext(canvas:  HTMLCanvasElement) : CanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if(!context) {
      throw new Error("cannot find the context 2d for the canvas");
  }
  return context;
}

export function getOffscreenContext(canvas:  OffscreenCanvas) : OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext("2d");
  if(!context) {
      throw new Error("cannot find the context 2d for the canvas");
  }
  return context;
}

export function colorDistance(color1: Color, color2: Color) : number {
  const redDiff = (color2.red - color1.red);
  const greenDiff = (color2.green - color1.green);
  const blueDiff = (color2.blue - color1.blue);
  return (redDiff * redDiff) + (greenDiff * greenDiff) + (blueDiff * blueDiff);
}

export function resizeImageCanvas(originCanvas: HTMLCanvasElement, targetCanvas: HTMLCanvasElement, expectedWidth: number, expectedHeight: number) {
  // resize to 50%
  const canvasBuffer =  new OffscreenCanvas(originCanvas.width * 0.5,  originCanvas.height * 0.5);
  const contextBuffer = getOffscreenContext(canvasBuffer);

  // resize image
  contextBuffer.drawImage(originCanvas, 0, 0, canvasBuffer.width, canvasBuffer.height);
  contextBuffer.drawImage(canvasBuffer, 0, 0, canvasBuffer.width * 0.5, canvasBuffer.height * 0.5);

  const contextTarget = getContext(targetCanvas);

  targetCanvas.width = expectedWidth;
  targetCanvas.height = expectedHeight;

  contextTarget.drawImage(
    canvasBuffer,
    0,
    0,
    canvasBuffer.width * 0.5,
    canvasBuffer.height * 0.5,
    0,
    0,
    expectedWidth,
    expectedHeight
  );
}



export function fromColorArrayToStringCSS(color: Color) : string {
  return `rgb(${color.red}, ${color.green}, ${color.blue})`;
}
