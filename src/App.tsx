import { useState, useEffect } from 'react';

import useImageSizes from "./Hooks/useImageSizes";
import useRubickImage from "./Hooks/useRubickImage";

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


const initialTileSize = 32;

function App() {
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<HTMLImageElement>();
  const [view3d, setView3d] = useState<boolean>(true);

  const {
    computePossibleSize,
    setPossibleSize,
    possibleWidth,
    possibleHeight,
    allowResize,
    setAllowResize,
    ratio,
    setRatio,
    bestProportion,
    setBestProportion,
    setTileSize
  } = useImageSizes({ initialTileSize });

  const {
    optimizedGenerateImage,
    setOption,
    hasBorder,
    noise,
    tileSize,
    rubickFaces
  } = useRubickImage({ initialTileSize });

  useEffect(() => {
    if(image) {
      computePossibleSize(image.width, image.height);
    }
  }, [image, allowResize, bestProportion, ratio, tileSize]);


  function uploadImage(newImage: HTMLImageElement) {
    setImage(newImage);
    setError("");
    setPossibleSize(newImage.width, newImage.height);
  }

  function generateImagesInImage() {
    if(!image) {
      setError("Error! Please upload an image");
      return;
    }
    optimizedGenerateImage(image, possibleWidth, possibleHeight);
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

  return (
    <div className="container mx-auto md:px-0 px-5">
      <div className="flex flex-col gap-4">
        <Header/>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col gap-3">
            <Card title="Upload your image">
              {
                error !== "" && <Error errorMessage={error} />
              }
              <InputFileWithPreview
                onChange={uploadImage}
                value={image}
              />
            </Card>
            <Card title="Image Settings">
              <div>
                <Range
                  label="tileSize"
                  value={tileSize}
                  max={128}
                  min={16}
                  step={8}
                  onChange={(value) => {
                    setOption("tileSize", value)
                    setTileSize(value);
                  }}
                />
                <Toggle
                  label="has border"
                  value={hasBorder}
                  toggle={() => setOption("hasBorder", !hasBorder)}
                />
                <Range
                  label="noise"
                  value={noise}
                  max={50}
                  onChange={(value) => setOption("noise", value)}
                />
              </div>
            </Card>
            <Card title="Image Size">
              <div>
                <div>
                  <Toggle
                    label="Allow resize (will impact the proportions)"
                    value={allowResize}
                    toggle={() => setAllowResize(!allowResize)}
                  />
                  <Toggle
                    label="Best proportion"
                    value={bestProportion}
                    toggle={() => setBestProportion(!bestProportion)}
                  />
                  <div>
                    <label>Ratio</label>
                    <input
                      disabled={bestProportion}
                      type="range"
                      min="3"
                      max={24}
                      step={3}
                      value={ratio}
                      onChange={(e) => setRatio(parseInt(e.target.value))}
                      className={`range ${bestProportion ? "range-error" : "range-primary"}`}
                      />
                    <span>{ratio}</span>
                  </div>
                </div>
                {renderPreview()}
              </div>
            </Card>
            <button
              className="btn btn-accent"
              onClick={generateImagesInImage}
            >
              Generate
            </button>
          </div>
          <div className="basis-3/4">
            <Card title="Result">
             <Toggle
                  label="3D views"
                  value={view3d}
                  toggle={() => setView3d(!view3d)}
                />
              { view3d ?
                <ThreeJsRendering
                  width={possibleWidth}
                  height={possibleHeight}
                  tileSize={tileSize}
                  hasBorder={hasBorder}
                  rubickFaces={rubickFaces}
                  toggleFullScreen={() => {}}
                />
                :
                <CanvasRendering
                  width={possibleWidth}
                  height={possibleHeight}
                  tileSize={tileSize}
                  hasBorder={hasBorder}
                  rubickFaces={rubickFaces}
                  toggleFullScreen={() => {}}
                />
              }
            </Card>
          </div>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default App
