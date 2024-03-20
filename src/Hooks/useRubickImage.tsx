import { useState } from "react";
import { minBy, sample } from "lodash";
import { getOffscreenContext, colorDistance, resizeImageCanvas } from "../tools";
import { RubickFace } from "../types";
import { compressRubickCubeData } from "../compress";

interface Color {
  red: number;
  green: number;
  blue: number;
}

export const tileSizeDefault = 32;
type OptionType = "noise" | "tileSize";

interface RubickTile {
  name: string;
  color: Color;
  hexColor: string
}


interface RubickImageProps {
  initialTileSize?: number;
}

const RubickTiles : RubickTile[] = [
  { name: "white", color: {red: 255, green: 255, blue:255}, hexColor: "#FFFFFF" },
  { name: "green", color: {red: 124, green: 178, blue:87}, hexColor: "#7CCF57" },
  { name: "yellow", color: {red: 238, green: 207, blue:78}, hexColor: "#EECF4E" },
  { name: "orange", color: {red: 236, green: 112, blue:45}, hexColor: "#EC702D" },
  { name: "red", color: {red: 189, green: 40, blue:39}, hexColor: "#BD2827" },
  { name: "blue", color: {red: 44, green: 93, blue:166}, hexColor: "#2C5DA6" }
];

export default function useRubickImage({ initialTileSize = tileSizeDefault } : RubickImageProps) {
  const [noise, setNoise] = useState<number>(0);
  const [tileSize, setTileSize] = useState<number>(initialTileSize);
  const [rubickFaces, setRubickFaces] = useState<RubickFace[]>([]);

  function createCanvasBuffer(image: HTMLImageElement) : OffscreenCanvas {
    const canvasBuffer =  new OffscreenCanvas(image.width, image.height);

    const context = getOffscreenContext(canvasBuffer);
    context.drawImage(image, 0, 0, canvasBuffer.width, canvasBuffer.height);
    return canvasBuffer;
  }

  function optimizedGenerateImage(
    image: HTMLImageElement,
    expectedWidth: number,
    expectedHeight: number
  ) {
      const canvasBuffer = createCanvasBuffer(image);

      const contextBuffer = getOffscreenContext(canvasBuffer);
      resizeImageCanvas(canvasBuffer, canvasBuffer, expectedWidth, expectedHeight);

      let newRubicksPixels : RubickFace[] = []

      for(let y = 0; y < canvasBuffer.height; y += (3*tileSize)) {
        for(let x = 0; x < canvasBuffer.width; x += (3*tileSize)) {

          const color11 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x,y));
          const color12 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+tileSize,y));
          const color13 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+(2*tileSize),y));

          const color21 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x,y+tileSize));
          const color22 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+tileSize,y+tileSize));
          const color23 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+(2*tileSize),y+tileSize));

          const color31 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x,y+(2*tileSize)));
          const color32 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+tileSize,y+(2*tileSize)));
          const color33 = fromColorToDominantRubikColorWithRandom(interpolateArea(contextBuffer, tileSize, x+(2*tileSize),y+(2*tileSize)));

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
      console.log(compressRubickCubeData(newRubicksPixels, expectedWidth));
      setRubickFaces(newRubicksPixels);
  }

  function interpolateArea(context: OffscreenCanvasRenderingContext2D, tileSize: number, x: number, y: number) : Color {
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

    return foundPixel.hexColor;
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


  return { optimizedGenerateImage, setOption, noise, tileSize, rubickFaces };
}
