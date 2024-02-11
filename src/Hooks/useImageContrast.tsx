import { useState } from "react";
import { fill } from "lodash";
import convert from "color-convert";
import { getOffscreenContext } from "../tools";


function useImageContrast() {
  const [contrastedImage, setcontrastedImage] = useState<HTMLImageElement>();

  function positionToDataIndex(x: number, y: number, width: number) : number {
    // data is arranged as [R, G, B, A, R, G, B, A, ...]
    return (y * width + x) * 4;
  }

  function cumulativeDistributionFunction(contextInput: OffscreenCanvasRenderingContext2D, width: number, height: number) : [number[], number[][]] {
      let frequencies = fill(Array(101), 0);
      const dataHSV = [];

      const { data } = contextInput.getImageData(
          0,
          0,
          width,
          height
        );

      for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
          const index = positionToDataIndex(x, y, width);
          const red = data[index];
          const green = data[index + 1];
          const blue = data[index + 2];

          const [hue, saturation, value] = convert.rgb.hsv(red, green, blue);
          dataHSV.push([hue, saturation, value]);

          const intensity = value;
          if(frequencies.includes(intensity)) {
              frequencies[intensity] += 1;
          } else {
              frequencies[intensity] = 1;
          }
        }
      }

      const intensityFrequencies = [...frequencies].sort();

      let cummulativeSum = 0;

      const cdf = intensityFrequencies.map((intensityFrequency) => {
          cummulativeSum += intensityFrequency;
          return cummulativeSum;
      });

      /*
      Now we need to normalize the CDF to fit between a range of [0, 255]
      We use the values in the CDF to change the intensity of pixels in the original image so we need our intensity values to be normalized to [0,255]
      */
      const minCDF = cdf[0]
      const maxCDF = cdf[cdf.length - 1];

      const normalizedCDF = cdf.map(value => {
          /* Reminder: We need to multiply by 255 as normalization gives us a value between 0 and 1*/
          return ((value - minCDF) * 100) / (maxCDF - minCDF);
      });

      return [normalizedCDF, dataHSV];
  }

  function createCanvasBuffer(image: HTMLImageElement) : OffscreenCanvas {
    const canvasBuffer =  new OffscreenCanvas(image.width, image.height);

    const context = getOffscreenContext(canvasBuffer);
    context.drawImage(image, 0, 0, canvasBuffer.width, canvasBuffer.height);
    return canvasBuffer;
  }

  function histogramEqualization(
      image: HTMLImageElement,
      canvasOutput: HTMLCanvasElement
  ) : string {

      const { width, height } = image;
      const canvasBuffer = createCanvasBuffer(image);
      const contextBuffer = getOffscreenContext(canvasBuffer);

      const [normalizedCDF, dataHSV] = cumulativeDistributionFunction(contextBuffer, width, height);

      const imageData = contextBuffer.getImageData(0, 0, width, height);
      for(let x=0; x < width; x++) {
          for(let y=0; y < height; y++) {
              const index = positionToDataIndex(x,y, width);
              const [hue, saturation, value] = dataHSV[(x * height + y)];
              const intensityNormalized = normalizedCDF[value];
              const [red, green, blue] = convert.hsv.rgb([hue, saturation, Math.floor(value + intensityNormalized)]);
              imageData.data[index] = red //* intensityNormalized;
              imageData.data[index + 1] = green //* intensityNormalized;
              imageData.data[index + 2] = blue //* intensityNormalized;
              imageData.data[index + 3] = imageData.data[index + 3] //* intensityNormalized;
          }
      }
      canvasOutput.width = width;
      canvasOutput.height = height;
      const contextOutput = canvasOutput.getContext("2d");
      if(!contextOutput) {
          throw new Error("Cannot find context 2d");
      }
      contextOutput.putImageData(imageData, 0, 0);

      return canvasOutput.toDataURL();
  }

  function loadImage(base64Image: string): Promise<HTMLImageElement> {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
          resolve(img);
        }
        img.onerror = e => {
          reject(e);
        }
    });
  }

  async function computeImage(image: HTMLImageElement, refOutput : HTMLCanvasElement) {
    const base64Image = histogramEqualization(image, refOutput);
    const newcontrastedImage = await loadImage(base64Image);
    setcontrastedImage(newcontrastedImage);
  }


  return {
    contrastedImage,
    computeImage
  }
}

export default useImageContrast;
