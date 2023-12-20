import { useState } from 'react';
import { minBy } from "lodash";
import { pgcd } from "../tools";

interface useImageSizesProps {
  initialTileSize: number;
}

function useImageSizes({ initialTileSize = 32 }: useImageSizesProps) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [allowResize, setAllowResize] = useState<boolean>(false);
  const [bestProportion, setBestProportion] = useState<boolean>(true);
  const [tileSize, setTileSize] = useState<number>(initialTileSize);
  const [ratio, setRatio] = useState<number>(1);

  function setPossibleSize(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }

  function makeItDivibleByThreeAndTileSize(number: number) : number {
    return Math.round(number/(3 * tileSize))*(3 * tileSize);
  }

  function optimizedScaleBasic(imageWidth: number, imageHeight: number, tileSize: number, bestProportion: boolean) : [number, number] {
    const pgcdBetweenWidthAndHeight = pgcd(imageWidth, imageHeight);
    const minWidth = imageWidth/pgcdBetweenWidthAndHeight;
    const minHeight = imageHeight/pgcdBetweenWidthAndHeight;

    const minWidthPixelSize = minWidth * tileSize;
    const minHeightPixelSize = minHeight * tileSize;

    if(bestProportion) {
      // this ratio is the same on the width and height
      const newRatioImage = Math.ceil(imageWidth/minWidthPixelSize);
      const expectedWidth =  minWidthPixelSize * newRatioImage;
      const expectedHeight = minHeightPixelSize * newRatioImage;

      return [expectedWidth, expectedHeight];
    } else {
      return [minWidthPixelSize * ratio, minHeightPixelSize * ratio];
    }
  }

  function optimizedScale(imageWidth: number, imageHeight: number, allowResize: boolean) : [number, number] {
    const imageWidthDivisibleByThree = makeItDivibleByThreeAndTileSize(imageWidth);
    const imageHeightDivisibleByThree = makeItDivibleByThreeAndTileSize(imageHeight);
    console.log(imageWidth, "-> ", imageWidthDivisibleByThree);
    console.log(imageHeight, "-> ", imageHeightDivisibleByThree);
    if(allowResize) {
        return findBestCombinaisonTruncatedBy(imageWidthDivisibleByThree, imageHeightDivisibleByThree);
    } else {
      return optimizedScaleBasic(imageWidthDivisibleByThree, imageHeightDivisibleByThree, tileSize, bestProportion);
    }
  }

  function computePossibleSize(imageWidth: number, imageHeight: number) {
    const [possibleWidth, possibleHeight] = optimizedScale(imageWidth, imageHeight, allowResize);
    setPossibleSize(possibleWidth, possibleHeight);
  }

  function findBestCombinaisonTruncatedBy(imageWidth: number, imageHeight: number) : [number, number] {
    let combinaisons = [];
    for(let truncate = 1; truncate <= 20; truncate++) {
      const truncatedWidth = imageWidth + (imageWidth % truncate);
      const truncatedHeight = imageHeight + (imageHeight % truncate);
      const combinaison = optimizedScaleBasic(truncatedWidth, truncatedHeight, tileSize, bestProportion);
      combinaisons.push(combinaison);
    }
    const bestCombinaison = minBy(combinaisons, (combinaison: [number, number]) => combinaison[0] * combinaison[1]);
    if(!bestCombinaison) {
      return [imageWidth, imageHeight];
    }
    return bestCombinaison;
  }

  return {
    computePossibleSize,
    setPossibleSize,
    possibleWidth: width,
    possibleHeight: height,
    allowResize,
    setAllowResize,
    ratio,
    setRatio,
    bestProportion,
    setBestProportion,
    tileSize,
    setTileSize
  }
}

export default useImageSizes;
