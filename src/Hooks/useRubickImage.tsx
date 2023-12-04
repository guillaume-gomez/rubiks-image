import { useState } from "react";
import { minBy, sample } from "lodash";
import { getContext, colorDistance, resizeImageCanvas, fromColorArrayToStringCSS } from "../tools";
import { RubickFace } from "../types";

interface Color {
  red: number;
  green: number;
  blue: number;
}

export const tileSizeDefault = 32;
type OptionType = "hasBorder" | "noise" | "tileSize";

interface RubickTile {
  name: string;
  color: Color;
}


interface RubickImageProps {
  initialTileSize?: number;
}

const RubickTiles : RubickTile[] = [
  { name: "white", color: {red: 255, green: 255, blue:255} },
  { name: "green", color: {red: 124, green: 178, blue:87} },
  { name: "yellow", color: {red: 238, green: 207, blue:78} },
  { name: "orange", color: {red: 236, green: 112, blue:45} },
  { name: "red", color: {red: 189, green: 40, blue:39} },
  { name: "blue", color: {red: 44, green: 93, blue:166} }
];

export default function useRubickImage({ initialTileSize = tileSizeDefault } : RubickImageProps) {
  const [hasBorder, setBorder] = useState<boolean>(false);
  const [noise, setNoise] = useState<number>(0);
  const [tileSize, setTileSize] = useState<number>(initialTileSize);
  const [rubickFaces, setRubickFaces] = useState<RubickFace[]>([]);

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
    context.fillRect(x,y, tileSize, tileSize);
  }

  function optimizedGenerateImage(
    image: HTMLImageElement,
    canvasTarget: HTMLCanvasElement,
    expectedWidth: number,
    expectedHeight: number
  ) {
      canvasTarget.width = expectedWidth;
      canvasTarget.height = expectedHeight;

      const canvasBuffer = createCanvasBuffer(image);

      const contextBuffer = getContext(canvasBuffer);
      const contextTarget = getContext(canvasTarget);
      resizeImageCanvas(canvasBuffer, canvasBuffer, expectedWidth, expectedHeight);

      let newRubicksPixels : RubickFace[] = []

      for(let y = 0; y < canvasBuffer.height; y += (3*tileSize)) {
        for(let x = 0; x < canvasBuffer.width; x += (3*tileSize)) {

          const color11 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x,y));
          renderSquare(contextTarget, color11, x, y);
          const color12 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+tileSize,y));
          renderSquare(contextTarget, color12, x+tileSize, y);
          const color13 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+(2*tileSize),y));
          renderSquare(contextTarget, color13, x+(2*tileSize), y);

          const color21 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x,y+tileSize));
          renderSquare(contextTarget, color21, x, y+tileSize);
          const color22 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+tileSize,y+tileSize));
          renderSquare(contextTarget, color22, x+tileSize, y+tileSize);
          const color23 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+(2*tileSize),y+tileSize));
          renderSquare(contextTarget, color23, x+(2*tileSize), y+tileSize);

          const color31 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x,y+(2*tileSize)));
          renderSquare(contextTarget, color31, x, y+(2*tileSize));
          const color32 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+tileSize,y+(2*tileSize)));
          renderSquare(contextTarget, color32, x+tileSize, y+(2*tileSize));
          const color33 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+(2*tileSize),y+(2*tileSize)));
          renderSquare(contextTarget, color33, x+(2*tileSize), y+(2*tileSize));

          const rubickFace : RubickFace = [
            {
              color: color11, x, y
            },
            {
              color: color12, x: (x+tileSize), y
            },
            {
              color: color13, x: (x+(2*tileSize)), y
            },
            {
              color: color21, x, y: (y+tileSize)
            },
            {
              color: color22, x: (x+tileSize), y: (y+tileSize)
            },
            {
              color: color23, x: (x+(2*tileSize)), y: (y+tileSize)
            },
            {
              color: color31, x, y: (y+(2*tileSize))
            },
            {
              color: color32, x: (x+tileSize), y: (y+(2*tileSize))
            },
            {
              color: color33, x: (x+(2*tileSize)), y: (y+(2*tileSize))
            }
          ];
          newRubicksPixels.push(rubickFace);
        }
      }
      if(hasBorder) {
        renderBorder(contextTarget, expectedWidth, expectedHeight);
      }
      setRubickFaces(newRubicksPixels);
  }

  function renderBorder(context: CanvasRenderingContext2D, width: number, height: number) {
    context.fillStyle = "black";
    context.lineWidth = 2;
    for(let x=0; x < width; x += tileSize) {
      for(let y=0; y < height; y+= tileSize) {
        context.strokeRect(x, y, tileSize, tileSize);
      }
    }

    context.lineWidth = 4;
    for(let x=0; x < width; x += 3*tileSize) {
      for(let y=0; y < height; y+= 3*tileSize) {
        context.strokeRect(x, y, tileSize*3, tileSize*3);
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
    const comparaisonValues = RubickTiles.map(RubickTile => ({ ...RubickTile, value: colorDistance(color, RubickTile.color)}) );
    const foundPixel = minBy(comparaisonValues, 'value');
    if(!foundPixel) {
      throw `No sprite found for the pixel with the value ${color}`;
    }

    return fromColorArrayToStringCSS(foundPixel.color);
  }

  function fromColorToDominantRubikColorWithRandom(color: Color) : string {

    if(Math.random() < (noise)/100) {
      const pickedColor = sample(RubickTiles);
      return fromColorToDominantRubikColor(pickedColor!.color);
    }

    return fromColorToDominantRubikColor(color);
  }

  function setOption(optionName: OptionType, value: unknown) {
    switch(optionName) {
      case "hasBorder": {
        setBorder(value as boolean);
        break;
      }
      case "noise": {
        setNoise(value as number);
        break;
      }
      case "tileSize": {
        setTileSize(value as number);
        break;
      }

      default:
        return;
    }
  }


  return { generateImage, optimizedGenerateImage, setOption, hasBorder, noise, tileSize, rubickFaces };
}
