import { useState, useEffect, useRef } from 'react';

import { isMobile } from 'react-device-detect';

import useImageSizes from "../Hooks/useImageSizes";
import useRubickImage from "../Hooks/useRubickImage";
import useImageContrast from "../Hooks/useImageContrast";

import Card from "../Components/Card";
import SubCard from "../Components/SubCard";
import CustomSettingsCard from "../Components/CustomSettingsCard";
import InputFileWithPreview from "../Components/InputFileWithPreview";
import Toggle from "../Components/Toggle";
import Range from "../Components/Range";
import Error from "../Components/Error";
import CanvasRendering from "../Components/CanvasRendering";
import ThreeJsRendering from "../Components/ThreeJs/ThreejsRendering";


import logo from '/logo.svg';
import eiffel from "/Tour_Eiffel_Wikimedia_Commons.jpg";


interface threeJsParams {
  tileSize: number;
  width: number;
  height: number;
}

const initialTileSize = 32;

const MAX_CUBES = 5000

function PresetView() {
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<HTMLImageElement>();
  const [chooseContrastedImage, setChooseContrastedImage] = useState<boolean>(false);
  // memoize for three js to avoid changes before generation
  const [threeJsParams, setThreeJsParams] = useState<threeJsParams>({ tileSize: initialTileSize, width: 0, height: 0});
  const maxCubes = isMobile ? MAX_CUBES/2 : MAX_CUBES;
  const goToFinalResultDivRef = useRef<HTMLDivElement>(null)


  const {
    computePossibleSize,
    possibleWidth,
    possibleHeight,
    ratio,
    setRatio,
    maxRatio,
    bestProportion,
    setBestProportion,
    setTileSize
  } = useImageSizes({ initialTileSize });

  const {
    optimizedGenerateImage,
    setOption,
    noise,
    tileSize,
    rubickFaces
  } = useRubickImage({ initialTileSize });

  const { contrastedImage, computeImage } = useImageContrast();


  const refOutput = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
   uploadImage()
  }, []);

  function findBestTileSize(width: number, height: number, isMobile: boolean) {
    const threshold = isMobile ? MAX_CUBES/2 : MAX_CUBES;
    const absoluteX = Math.sqrt((width*height)/threshold);
    const naturalX = Math.ceil(absoluteX);

    const bestTileSize = (naturalX <= 8) ? 8 : (naturalX + 8) - (naturalX % 8);
    setTileSize(bestTileSize);
    setOption("tileSize", bestTileSize);
  }

  function uploadImage() {
    const newImage = new Image();
    newImage.src = eiffel;
    newImage.onload = () => {
      //setImage(newImage);
      console.log("newImage ", newImage.width, ": ", newImage.height)

      const [width, height] = computePossibleSize(newImage.width, newImage.height, isMobile);
      findBestTileSize(width, height, isMobile);
      console.log(width, " ", height);

      setBestProportion(true);
      setRatio(1);

      if(newImage.width === 0) {
        setError("Error! The image has 0 pixels as width");
      } else if(newImage.height === 0) {
        setError("Error! The image has 0 pixels as height");
      } else if(newImage.width < tileSize || newImage.height < tileSize) {
        setError("Error! The image has a dimension below the tileSize");
      }
      else {
        setError("");
      }



      console.log("fhjdhfjd")

      generateImagesInImage(newImage);
    }
    
  }

  function generateImagesInImage(newImage : HTMLImageElement) {
    // update the params
    setThreeJsParams({tileSize, width: possibleWidth, height: possibleHeight});
    if(!newImage) {
      setError("Error! Please upload an image");
      return;
    }

    if(!chooseContrastedImage) {
      console.log("fdjkfjdfjd", possibleWidth, possibleHeight)
      optimizedGenerateImage(image, possibleWidth, possibleHeight);
      return
    }

    if(!contrastedImage) {
      setError("Contrasted image is not fully generated");
      return;
    }

    optimizedGenerateImage(contrastedImage, possibleWidth, possibleHeight);
    if(goToFinalResultDivRef.current) {
      goToFinalResultDivRef.current.scrollIntoView({behavior: "smooth"});
    }
  }

  return (
    <div className="flex flex-col">
      <div className="w-full h-full">
         {
                  error !== "" && <Error errorMessage={error} />
                }
        <Card title="Result">
          <ThreeJsRendering
            width={threeJsParams.width}
            height={threeJsParams.height}
            tileSize={threeJsParams.tileSize}
            rubickFaces={rubickFaces}
          />
          <p className="text-xs italic">Double click/tap on the canvas to go full screen</p>
        </Card>
      </div>
    </div>     
  )
}

export default PresetView
