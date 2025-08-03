import { useState, useEffect, useRef } from 'react';

import { isMobile } from 'react-device-detect';
import { AnimationProvider } from "../Reducers/generationReducer";

import useImageSizes from "../Hooks/useImageSizes";
import useRubickImage from "../Hooks/useRubickImage";

import Card from "../Components/Card";
import Error from "../Components/Error";
import CopyToClipboard from "../Components/CopyToClipboard";
import ThreeJsRendering from "../Components/ThreeJs/ThreeJsRendering";

import { useDoubleTap } from 'use-double-tap';
import { useFullscreen } from "rooks";


interface threeJsParams {
  tileSize: number;
  width: number;
  height: number;
}

const initialTileSize = 32;

const MAX_CUBES = 5000

interface PresetViewProps {
  path: string;
}

function PresetView({ path } : PresetViewProps) {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<HTMLImageElement>();
  // memoize for three js to avoid changes before generation
  const [threeJsParams, setThreeJsParams] = useState<threeJsParams>({ tileSize: initialTileSize, width: 0, height: 0});
  const goToFinalResultDivRef = useRef<HTMLDivElement>(null);
  const containerCanvasRef = useRef<HTMLDivElement>(null);
  const { toggleFullscreen } = useFullscreen({ target: containerCanvasRef });
  const doubleTapEvent = useDoubleTap(() => {
      toggleFullscreen();
  });

  const {
    computePossibleSize,
    possibleWidth,
    possibleHeight,
    setRatio,
    setBestProportion,
    setTileSize
  } = useImageSizes({ initialTileSize });

  const {
    optimizedGenerateImage,
    setOption,
    tileSize,
    rubickFaces
  } = useRubickImage({ initialTileSize });

  useEffect(() => {
   uploadImage();
  }, []);

  useEffect(() => {
    if(image) {
      generateImagesInImage();
    }
  }, [image]);

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
    newImage.src = path;
    newImage.onload = () => {
      setImage(newImage);
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
    }
    
  }

  function generateImagesInImage() {
    // update the params
    setThreeJsParams({tileSize, width: possibleWidth, height: possibleHeight});
    
    if(!image) {
      setError("Error! Please upload an image");
      return;
    }

    optimizedGenerateImage(image, possibleWidth, possibleHeight);
    
    if(goToFinalResultDivRef.current) {
      goToFinalResultDivRef.current.scrollIntoView({behavior: "smooth"});
    }
  }

  console.log(openModal)

  return (
    <div className="flex flex-col">
      <dialog id="my_modal_5" onCancel={() => setOpenModal(false)} className={`modal ${openModal && "modal-open"}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Did you enjoy ?</h3>
          <p className="py-4">Share with your friends</p>
          <CopyToClipboard initialLabel={"Copy"}/>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn" onClick={() => setOpenModal(false)}>Close</button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="w-full h-full">
        {
          error !== "" && <Error errorMessage={error} />
        }
        <Card title="Result">
            <div ref={goToFinalResultDivRef} className="w-full h-full flex flex-col gap-1">
              <AnimationProvider duration={30000}>
                <div
                  className="flex flex-col gap-5 w-full h-screen"
                  ref={containerCanvasRef}
                  onDoubleClick={toggleFullscreen}
                  {...doubleTapEvent}
                >
                  <ThreeJsRendering
                    width={threeJsParams.width}
                    height={threeJsParams.height}
                    tileSize={threeJsParams.tileSize}
                    rubickFaces={rubickFaces}
                    hideOtherFaces={false}
                    invert={false}
                    animationType={'wave'}
                    onFinishCallback={() => setOpenModal(true)}
                  />
                </div>
              </AnimationProvider>
              <p className="text-xs italic">Double click/tap on the canvas to go full screen</p>
            </div>
        </Card>
      </div>
    </div>     
  )
}

export default PresetView
