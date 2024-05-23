import { useState, useEffect, useRef } from 'react';

import { isMobile } from 'react-device-detect';

import useImageSizes from "./Hooks/useImageSizes";
import useRubickImage from "./Hooks/useRubickImage";
import useImageContrast from "./Hooks/useImageContrast";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Card from "./Components/Card";
import SubCard from "./Components/SubCard";
import CustomSettingsCard from "./Components/CustomSettingsCard";
import InputFileWithPreview from "./Components/InputFileWithPreview";
import Toggle from "./Components/Toggle";
import Range from "./Components/Range";
import Error from "./Components/Error";
import CanvasRendering from "./Components/CanvasRendering";
import ThreeJsRendering from "./Components/ThreeJs/ThreejsRendering";
import {  useGenerationDispatch } from "./Reducers/generationReducer";

import logo from '/logo.svg';
import './App.css';

interface threeJsParams {
  tileSize: number;
  width: number;
  height: number;
}

const initialTileSize = 32;

const MAX_CUBES = 5000

function App() {
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<HTMLImageElement>();
  const [view3d, setView3d] = useState<boolean>(true);
  const [chooseContrastedImage, setChooseContrastedImage] = useState<boolean>(true);
  // memoize for three js to avoid changes before generation
  const [threeJsParams, setThreeJsParams] = useState<threeJsParams>({ tileSize: initialTileSize, width: 0, height: 0});
  const maxCubes = isMobile ? MAX_CUBES/2 : MAX_CUBES;
  const dispatchGeneration = useGenerationDispatch();


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
    if(image && refOutput.current) {
      computeImage(image, refOutput.current);
    }
  }, [image]);

  // if tilesize change, need to recompute the best sizes
  useEffect(() => {
    if(image && refOutput.current) {
      computePossibleSize(image.width, image.height, isMobile)
    }
  }, [tileSize, bestProportion, ratio])


  function uploadImage(newImage: HTMLImageElement) {
    setImage(newImage);

    console.log("newImage ", newImage.width, ": ", newImage.height)

    const [width, height] = computePossibleSize(newImage.width, newImage.height, isMobile);
    findBestTileSize(width, height, isMobile);
    //console.log(width, " ", height);

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

  function generateImagesInImage() {
    // update the params
    setThreeJsParams({tileSize, width: possibleWidth, height: possibleHeight});
    if(!image) {
      setError("Error! Please upload an image");
      return;
    }

    if(!chooseContrastedImage) {
      optimizedGenerateImage(image, possibleWidth, possibleHeight);
      return
    }

    if(!contrastedImage) {
      setError("Contrasted image is not fully generated");
      return;
    }

    optimizedGenerateImage(contrastedImage, possibleWidth, possibleHeight);
    dispatchGeneration({type: "start"});
  }



  function isImageFullyUploaded() : boolean {
    if(chooseContrastedImage) {
      return !!contrastedImage;
    }

    return !!image;
  }

  function findBestTileSize(width: number, height: number, isMobile: boolean) {
    const threshold = isMobile ? MAX_CUBES/2 : MAX_CUBES;
    const absoluteX = Math.sqrt((width*height)/threshold);
    const naturalX = Math.ceil(absoluteX);

    const bestTileSize = (naturalX <= 8) ? 8 : (naturalX + 8) - (naturalX % 8);
    setTileSize(bestTileSize);
    setOption("tileSize", bestTileSize);
  }

  function renderPreview() {
    if(!image) {
      return <></>;
    }

    const width =  possibleWidth;
    const height = possibleHeight;

    return (
      <div className="flex flex-row gap-3 w-full">
        <div className="tooltip flex flex-row items-center gap-1" data-tip={`${width} pixels`}>
          <span className="font-semibold">Width:</span>
          <span className="italic">
            {width/tileSize} cubes
          </span>
          <img src={logo} width='16px' alt="rubick's cubes"/>
        </div>
        <div className="tooltip flex flex-row items-center gap-1" data-tip={`${height} pixels`}>
          <span className="font-semibold">Height:</span>
          <span className="italic">
            {height/tileSize} cubes
          </span>
          <img src={logo} width='16px' alt="rubick's cubes"/>
        </div>
      </div>
    )
  }

  function renderGenerateButton() {
    const button = (
      <button
        className="btn btn-accent w-full"
        disabled={!isImageFullyUploaded()}
        onClick={generateImagesInImage}
      >
        Generate
      </button>
    );

    if(!isImageFullyUploaded()) {
      return (<div className="tooltip tooltip-error" data-tip="Upload an image first !">{button}</div>)
    }

    return button;
  }

  return (
    <div className="container mx-auto md:px-0 px-5">
      <div className="flex flex-col gap-4 h-screen">
        <Header/>
        <div className="flex flex-col xl:flex-row gap-6 basis-full">
          <div className="xl:w-3/12">
            <Card title="Settings">
                <div className="flex flex-col gap-3">
                  <SubCard title="Upload your image">
                    {
                      error !== "" && <Error errorMessage={error} />
                    }
                    <InputFileWithPreview
                      onChange={uploadImage}
                      value={image}
                    />
                    <canvas ref={refOutput} style={{display: "none"}} />
                  </SubCard>
                  

                  <CustomSettingsCard>
                    <div className="bg-base-100 p-2 border border-white">
                      <h3 className="italic text-lg">Rendering</h3>
                      <div>
                        <Range
                          label="Noise"
                          value={noise}
                          max={50}
                          onChange={(value) => setOption("noise", value)}
                        />
                        <Toggle
                            label="Add constract"
                            value={chooseContrastedImage}
                            toggle={() => {
                              setChooseContrastedImage(!chooseContrastedImage);
                            }}
                          />
                      </div>
                    </div>

                    <div className="bg-base-100 p-2 border border-white">
                      <h3 className="italic text-lg">Size</h3>
                      <div>
                        <Range
                          label="TileSize"
                          value={tileSize}
                          max={128}
                          min={8}
                          step={8}
                          onChange={(value) => {
                            setOption("tileSize", value);
                            setTileSize(value);

                            if(value < (image?.width||0) && value < (image?.height||0)) {
                              setError("");
                            }
                          }}
                        />
                        <div className="flex flex-row gap-2 items-center">
                          <Toggle
                            label="Best proportion"
                            value={bestProportion}
                            toggle={() => {
                              setBestProportion(!bestProportion);
                            }}
                          />
                          <div className="w-full">
                          <Range
                            label="Ratio"
                            value={ratio}
                            max={maxRatio}
                            min={3}
                            step={3}
                            disabled={bestProportion}
                            onChange={(value) => setRatio(value)}
                          />
                          </div>
                        </div>
                      </div>
                    </div>
                    {
                          ((possibleWidth/tileSize) * (possibleHeight/tileSize)) > maxCubes ?
                            <div role="alert" className="alert alert-warning">
                              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                              <span>Warning: The number of cubes can be too much in 3D</span>
                            </div>
                           : <></>
                        }
                        {renderPreview()}
                  </CustomSettingsCard>

                  {renderGenerateButton()}
                </div>
              </Card>
          </div>

          <div className="xl:w-9/12 w-full h-full">
            <Card title="Result">
              <SubCard title={
                <Toggle
                    label="3D views"
                    value={view3d}
                    toggle={() => setView3d(!view3d)}
                  />
                }>
                { view3d ?
                  <>
                  <ThreeJsRendering
                    width={threeJsParams.width}
                    height={threeJsParams.height}
                    tileSize={threeJsParams.tileSize}
                    rubickFaces={rubickFaces}
                  />
                  <p className="text-xs italic">Double click/tap on the canvas to go full screen</p>
                  </>
                  :
                  <CanvasRendering
                    width={possibleWidth}
                    height={possibleHeight}
                    tileSize={tileSize}
                    rubickFaces={rubickFaces}
                  />
                }
              </SubCard>
            </Card>
          </div>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default App
