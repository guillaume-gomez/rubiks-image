import { useState } from 'react';
import { pgcd } from "../tools";

interface useImageSizesProps {
  initialTileSize: number;
}

const MAX_CUBES = 5000;

function useImageSizes({ initialTileSize = 32 }: useImageSizesProps) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [bestProportion, setBestProportion] = useState<boolean>(true);
  const [tileSize, setTileSize] = useState<number>(initialTileSize);
  const [ratio, setRatio] = useState<number>(1);
  const [maxRatio, setMaxRatio] = useState<number>(3);

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
    return optimizedScaleBasic(imageWidthDivisibleByThree, imageHeightDivisibleByThree, tileSize, bestProportion);
  }

  function computePossibleSize(imageWidth: number, imageHeight: number) : [number, number] {
    const [possibleWidth, possibleHeight] = optimizedScale(imageWidth, imageHeight);
    setPossibleSize(possibleWidth, possibleHeight);

    if(!bestProportion) {
    // divide by ratio to isolate the maxRatio (this computation only works without bestProportion)
      const maxRatio = computeMaxRatio(possibleWidth/ ratio, possibleHeight/ratio);
      setMaxRatio(maxRatio);
      if(maxRatio === 3) {
        setRatio(3);
      }
    } else {
      setRatio(1);
    }
    return [possibleWidth, possibleHeight];
  }

  function computeMaxRatio(minWidthPixelSize: number, minHeightPixelSize: number) {
    const maxRatio = Math.ceil(
      Math.sqrt( (MAX_CUBES * tileSize * tileSize) / (minWidthPixelSize * minHeightPixelSize) )
    );

    if(maxRatio <= 3) {
      return 3;
    }

    const maxRatioDividedByThree = maxRatio - maxRatio % 3;
    return maxRatioDividedByThree;
  }

  return {
    computePossibleSize,
    setPossibleSize,
    possibleWidth: width,
    possibleHeight: height,
    ratio,
    setRatio,
    maxRatio,
    bestProportion,
    setBestProportion,
    tileSize,
    setTileSize
  }
}

export default useImageSizes;
