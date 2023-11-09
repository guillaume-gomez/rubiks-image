import { minBy } from "lodash";
import { getContext, colorDistance, resizeImageCanvas, fromColorArrayToStringCSS } from "../tools";

interface Color {
  red: number;
  green: number;
  blue: number;
}

export const tileSizeDefault = 32;

interface RubickFace {
  name: string;
  color: Color;
}

interface RubickImageProps {
  tileSize?: number;
  hasBorder?: boolean;
  noise?: number;
}

const rubickFaces : RubickFace[] = [
  { name: "white", color: {red: 255, green: 255, blue:255} },
  { name: "green", color: {red: 124, green: 178, blue:87} },
  { name: "yellow", color: {red: 238, green: 207, blue:78} },
  { name: "orange", color: {red: 236, green: 112, blue:45} },
  { name: "red", color: {red: 189, green: 40, blue:39} },
  { name: "blue", color: {red: 44, green: 93, blue:166} }
];

export default function useRubickImage({ tileSize = tileSizeDefault, hasBorder = false, noise = 0.0 } : RubickImageProps) {
  function createCanvasBuffer(image: HTMLImageElement) : HTMLCanvasElement {
    const canvasBuffer = document.createElement("canvas");
    canvasBuffer.width = image.width;
    canvasBuffer.height = image.height;

    const context = getContext(canvasBuffer);
    context.drawImage(image, 0, 0, canvasBuffer.width, canvasBuffer.height);
    return canvasBuffer;
  }

  function renderSquare(context : CanvasRenderingContext2D, color: string, x: number, y: number) {
    context.fillStyle = color;

    if(hasBorder) {
      context.lineWidth = 2;
    }

    context.beginPath();
    context.rect(x, y, tileSize, tileSize);
    if(hasBorder) {
      context.stroke();
    }
    context.fill();
    context.closePath();
  }

  function generateImage(image: HTMLImageElement, canvasTarget: HTMLCanvasElement) {
    canvasTarget.width = image.width * tileSize;
    canvasTarget.height = image.height * tileSize;

    const canvasBuffer = createCanvasBuffer(image);
    const contextBuffer = getContext(canvasBuffer);
    const contextTarget = getContext(canvasTarget);

    console.log("(", canvasTarget.width, ", ", canvasTarget.height, ")");

     for(let y = 0; y < image.height; ++y) {
        for(let x = 0; x < image.width; ++x) {
          const color = fromColorToDominantRubikColor(fromPixelToColor(contextBuffer, x,y));
          renderSquare(contextTarget, color, x, y);
        }
      }
  }

  function optimizedGenerateImage(image: HTMLImageElement, canvasTarget: HTMLCanvasElement, expectedWidth: number, expectedHeight: number) {
      canvasTarget.width = expectedWidth;
      canvasTarget.height = expectedHeight;

      const canvasBuffer = createCanvasBuffer(image);

      const contextBuffer = getContext(canvasBuffer);
      const contextTarget = getContext(canvasTarget);
      resizeImageCanvas(canvasBuffer, canvasBuffer, expectedWidth, expectedHeight);

      console.log("( ", expectedWidth, ", ", expectedHeight, ")");

      for(let y = 0; y < canvasBuffer.height; y += tileSize) {
        for(let x = 0; x < canvasBuffer.width; x += tileSize) {
          const color = fromColorToDominantRubikColor(interpolateArea(contextBuffer, tileSize, x,y));
          renderSquare(contextTarget, color, x, y);
        }
      }
    }


  function fromPixelToColor(context: CanvasRenderingContext2D, x: number, y: number) : Color {
    const pixel = context.getImageData(x, y, 1, 1);
    const { data } = pixel;
    return { red: data[0], green: data[1], blue: data[2] };
  }

  function interpolateArea(context: CanvasRenderingContext2D, tileSize: number, x: number, y: number) : Color {
    const pixels = context.getImageData(x,y, tileSize, tileSize);
    const { data } = pixels;
    const numberOfPixels = tileSize * tileSize;
    let red = 0;
    let green = 0;
    let blue = 0;


    for (let i = 0; i < data.length; i += 4) {
      red += data[i];
      green += data[i + 1];
      blue += data[i + 2];
    }

    return { red: (red/numberOfPixels), green: (green/numberOfPixels), blue: (blue/numberOfPixels) };
  }


  function fromColorToDominantRubikColor(color: Color) : string {
    const comparaisonValues = rubickFaces.map(rubickFace => ({ ...rubickFace, value: colorDistance(color, rubickFace.color)}) );
    const foundPixel = minBy(comparaisonValues, 'value');
    if(!foundPixel) {
      throw `No sprite found for the pixel with the value ${color}`;
    }

    return fromColorArrayToStringCSS(foundPixel.color);
  }


  return { generateImage, optimizedGenerateImage };
}
