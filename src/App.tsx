import { useState, useEffect, useRef } from 'react';

import useImageSizes from "./Hooks/useImageSizes";
import useRubickImage from "./Hooks/useRubickImage";
import useImageContrast from "./Hooks/useImageContrast";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Card from "./Components/Card";
import InputFileWithPreview from "./Components/InputFileWithPreview";
import Toggle from "./Components/Toggle";
import Range from "./Components/Range";
import Error from "./Components/Error";
import CanvasRendering from "./Components/CanvasRendering";
import ThreeJsRendering from "./Components/ThreeJs/ThreejsRendering";

import logo from '/logo.svg';
import './App.css';

interface threeJsParams {
  tileSize: number;
  width: number;
  height: number;
}

const initialTileSize = 32;

function App() {
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<HTMLImageElement>();
  const [view3d, setView3d] = useState<boolean>(true);
  const [chooseContrastedImage, setChooseContrastedImage] = useState<boolean>(true);
  // memoize for three js to avoid changes before generation
  const [threeJsParams, setThreeJsParams] = useState<threeJsParams>({ tileSize: initialTileSize, width: 0, height: 0});

  const {
    computePossibleSize,
    setPossibleSize,
    possibleWidth,
    possibleHeight,
    ratio,
    setRatio,
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
    if(image) {
      computePossibleSize(image.width, image.height);
    }
  }, [image, bestProportion, ratio, tileSize]);


  useEffect(() => {
    if(image && refOutput.current) {
      computeImage(image, refOutput.current);
    }
  }, [image])


  function uploadImage(newImage: HTMLImageElement) {
    setImage(newImage);

    setPossibleSize(newImage.width, newImage.height);
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
  }

  function isImageFullyUploaded() : boolean {
    if(chooseContrastedImage) {
      return !!contrastedImage;
    }

    return !!image;
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
    const button =
              <button
                className="btn btn-accent w-full"
                disabled={!isImageFullyUploaded()}
                onClick={generateImagesInImage}
              >
                Generate
              </button>

    if(!isImageFullyUploaded()) {
      return (<div className="tooltip tooltip-error" data-tip="Upload an image first !">{button}</div>)
    }

    return button;
  }

  return (
    <div className="container mx-auto md:px-0 px-5">
      <div className="flex flex-col gap-4 h-screen">
        <Header/>
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex flex-col gap-3">
            <Card title="Upload your image">
              {
                error !== "" && <Error errorMessage={error} />
              }
              <InputFileWithPreview
                onChange={uploadImage}
                value={image}
              />
              <canvas ref={refOutput} style={{display: "none"}} />
            </Card>
            <Card title="Image Settings">
              <div>
                <Range
                  label="TileSize"
                  value={tileSize}
                  max={128}
                  min={16}
                  step={8}
                  onChange={(value) => {
                    setOption("tileSize", value);
                    setTileSize(value);

                    if(value < (image?.width||0) && value < (image?.height||0)) {
                      setError("");
                    }
                  }}
                />
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
            </Card>
            <Card title="Image Size">
              <div>
                <div>
                  <Toggle
                    label="Best proportion"
                    value={bestProportion}
                    toggle={() => {
                      setBestProportion(!bestProportion);
                      setRatio(1);
                    }}
                  />
                  <div>
                    <label>Ratio</label>
                    <input
                      disabled={bestProportion}
                      type="range"
                      min={3}
                      max={9}
                      step={3}
                      value={ratio}
                      onChange={(e) => setRatio(parseInt(e.target.value))}
                      className={`range ${bestProportion ? "range-error" : "range-primary"}`}
                      />
                    <span>{ratio}</span>
                  </div>
                </div>
                {
                  ((possibleWidth/tileSize) * (possibleHeight/tileSize)) > 5000 ?
                    <div role="alert" className="alert alert-warning">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      <span>Warning: The number of cubes can be too much in 3D</span>
                    </div>
                   : <></>
                }
                {renderPreview()}
              </div>
            </Card>
            {renderGenerateButton()}
          </div>
          <div className="md:basis-3/4">
            <Card title="Result">
             <Toggle
                  label="3D views"
                  value={view3d}
                  toggle={() => setView3d(!view3d)}
                />
              <div style={{ width: "100%", height: "65vh" }}>
                { view3d ?
                  <ThreeJsRendering
                    width={threeJsParams.width}
                    height={threeJsParams.height}
                    tileSize={threeJsParams.tileSize}
                    rubickFaces={rubickFaces}
                  />
                  :
                  <CanvasRendering
                    width={possibleWidth}
                    height={possibleHeight}
                    tileSize={tileSize}
                    rubickFaces={rubickFaces}
                  />
                }
              </div>
            </Card>
          </div>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default App
