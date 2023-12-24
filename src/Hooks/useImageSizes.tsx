import { useState } from 'react';
import { pgcd } from "../tools";

interface useImageSizesProps {
  initialTileSize: number;
}

function useImageSizes({ initialTileSize = 32 }: useImageSizesProps) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
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

  function optimizedScale(imageWidth: number, imageHeight: number) : [number, number] {
    const imageWidthDivisibleByThree = makeItDivibleByThreeAndTileSize(imageWidth);
    const imageHeightDivisibleByThree = makeItDivibleByThreeAndTileSize(imageHeight);
    console.log(imageWidth, "-> ", imageWidthDivisibleByThree);
    console.log(imageHeight, "-> ", imageHeightDivisibleByThree);
    return optimizedScaleBasic(imageWidthDivisibleByThree, imageHeightDivisibleByThree, tileSize, bestProportion);
  }

  function computePossibleSize(imageWidth: number, imageHeight: number) {
    const [possibleWidth, possibleHeight] = optimizedScale(imageWidth, imageHeight);
    setPossibleSize(possibleWidth, possibleHeight);
  }

  return {
    computePossibleSize,
    setPossibleSize,
    possibleWidth: width,
    possibleHeight: height,
    ratio,
    setRatio,
    bestProportion,
    setBestProportion,
    tileSize,
    setTileSize
  }
}

export default useImageSizes;
