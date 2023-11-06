import { useState } from 'react';
import { minBy } from "lodash";
import { pgcd } from "../tools";

function useImageSizes(dominantImageSize: number) {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [allowResize, setAllowResize] = useState<boolean>(false);
  const [bestProportion, setBestProportion] = useState<boolean>(true);
  const [ratio, setRatio] = useState<number>(1);

  function setPossibleSize(width: number, height: number) {
    setWidth(width);
    setHeight(height);
  }

  function optimizedScaleBasic(imageWidth: number, imageHeight: number, dominantImageSize: number, bestProportion: boolean) : [number, number] {
    const pgcdBetweenWidthAndHeight = pgcd(imageWidth, imageHeight);
    const minWidth = imageWidth/pgcdBetweenWidthAndHeight;
    const minHeight = imageHeight/pgcdBetweenWidthAndHeight;

    const minWidthPixelSize = minWidth * dominantImageSize;
    const minHeightPixelSize = minHeight * dominantImageSize;

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
    if(allowResize) {
        return findBestCombinaisonTruncatedBy(imageWidth, imageHeight);
    } else {
      return optimizedScaleBasic(imageWidth, imageHeight, dominantImageSize, bestProportion);
    }
  }

  function computePossibleSize(imageWidth: number, imageHeight: number) {
    const [possibleWidth, possibleHeight] = optimizedScale(imageWidth, imageHeight, allowResize);
    setPossibleSize(possibleWidth, possibleHeight);
  }

  function findBestCombinaisonTruncatedBy(imageWidth: number, imageHeight: number) : [number, number] {
    let combinaisons = [];
    for(let truncate = 2; truncate <= 12; truncate++) {
      const truncatedWidth = imageWidth + (imageWidth % truncate);
      const truncatedHeight = imageHeight + (imageHeight % truncate);
      const combinaison = optimizedScaleBasic(truncatedWidth, truncatedHeight, dominantImageSize, bestProportion);
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
  }
}

export default useImageSizes;
