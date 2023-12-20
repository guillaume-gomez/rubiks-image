import { useState, useEffect } from "react";
import { minBy, sample } from "lodash";
import { getOffscreenContext, colorDistance, resizeImageCanvas } from "../tools";
import { RubickFace } from "../types";


import worker from '../webWorker/app.worker';
import WebWorker from '../webWorker/webWorker';
import { fetchUsers } from '../webWorker/userService';


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
  const [hasBorder, setBorder] = useState<boolean>(false);
  const [noise, setNoise] = useState<number>(0);
  const [tileSize, setTileSize] = useState<number>(initialTileSize);
  const [rubickFaces, setRubickFaces] = useState<RubickFace[]>([]);
  const webWorker = new WebWorker(worker);

  useEffect(() => {
        return () => {
            webWorker.terminate();
        }
    }, []
  );

function createCanvasBuffer(image: HTMLImageElement) : OffscreenCanvas {
    const canvasBuffer =  new OffscreenCanvas(image.width, image.height);

    const context = getOffscreenContext(canvasBuffer);
    context.drawImage(image, 0, 0, canvasBuffer.width, canvasBuffer.height);
    return canvasBuffer;
  }

  async function optimizedGenerateImage(
    image: HTMLImageElement,
    expectedWidth: number,
    expectedHeight: number
  ) {
      return new Promise((resolve) => {
        const canvasBuffer = createCanvasBuffer(image);

        const contextBuffer = getOffscreenContext(canvasBuffer);
        resizeImageCanvas(canvasBuffer, canvasBuffer, expectedWidth, expectedHeight);

        webWorker.postMessage({
          imageData: contextBuffer.getImageData(0,0, canvasBuffer.width, canvasBuffer.height),
          width: expectedWidth,
          height: expectedHeight,
          tileSize,
          noise
        });

        webWorker.addEventListener('message', (event) => {
            const newRubicksPixels = event.data;
            setRubickFaces(newRubicksPixels);
            resolve();
        });
      })
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

  return { optimizedGenerateImage, setOption, hasBorder, noise, tileSize, rubickFaces };
}
