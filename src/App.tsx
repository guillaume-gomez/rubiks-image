import { useRef, useState, useEffect } from 'react';

import useImageSizes from "./Hooks/useImageSizes";
import useRubickImage from "./Hooks/useRubickImage";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import InputFileWithPreview from "./Components/InputFileWithPreview";
import Toggle from "./Components/Toggle";
import Range from "./Components/Range";
import { resizeImageCanvas } from "./tools";


import './App.css';


const tileSize = 32;
type AlgorithmType = "optimized" | "biggestImage";

function App() {
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>("optimized");
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement>();

  const canvasFinal = useRef<HTMLCanvasElement>(null);
  const canvasPreview = useRef<HTMLCanvasElement>(null);

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
  } = useImageSizes(tileSize);

  const { generateImage, optimizedGenerateImage, setOption, hasBorder, noise } = useRubickImage({ initialTileSize: tileSize });

  useEffect(() => {
    if(image) {
      computePossibleSize(image.width, image.height);
    }
  }, [image, allowResize, bestProportion, ratio])


  function uploadImage(newImage: HTMLImageElement) {
    setImage(newImage);
    //setError("");
    setPossibleSize(newImage.width, newImage.height);
  }

  function generateImagesInImage() {
    if(!image) {
      //setError("Error! Please upload an image");
      //moveTo("choose-image");
    }
    if(image && canvasFinal.current && canvasPreview.current) {
      if(algorithmType === "optimized") {
        optimizedGenerateImage(image, canvasFinal.current, possibleWidth, possibleHeight);
      } else {
        generateImage(image, canvasFinal.current);
      }
      // generate preview
      resizeImageCanvas(canvasFinal.current, canvasPreview.current, canvasFinal.current.width, canvasFinal.current.height);
      //moveTo("result");
    }
  }

    function renderPreview() {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-3">
          <span>Width : {possibleWidth}</span>
          <span>Height : {possibleHeight}</span>
        </div>
        <div className="overflow-auto">
          <canvas className="bg-accent w-full" style={{maxWidth: possibleWidth, maxHeight: possibleHeight}} />
        </div>
      </div>)
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-4">
        <Header/>
        <InputFileWithPreview
          onChange={uploadImage}
          value={image}
        />
        <button
          className="btn btn-accent"
          onClick={generateImagesInImage}>
            Generate
        </button>
        <div>
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
        <div>
          <select
            value={algorithmType}
            onChange={(event) => setAlgorithmType(event.target.value as AlgorithmType)}
            className="select select-primary w-full max-w-xs">
              <option key="0" disabled >Select the algorithm</option>
              <option key="1" value="optimized">Optimised</option>
              <option key="2" value="biggestImage"> Biggest Image</option>
          </select>
          <div>
            {
              algorithmType === "optimized" ?
                (
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
                        min="1"
                        max={20}
                        value={ratio}
                        onChange={(e) => setRatio(parseInt(e.target.value))}
                        className={`range ${bestProportion ? "range-error" : "range-primary"}`}
                        />
                      <span>{ratio}</span>
                    </div>

                  </div>
                ) :
                <></>
            }
          </div>
        </div>
        <Toggle
          label="Show real result"
          value={fullscreen}
          toggle={() => setFullscreen(!fullscreen)}
        />
        <span>The image could be wider than your screen. That is why we display the preview at first</span>
        <canvas className={ fullscreen ? "hidden" : "w-full"} ref={canvasPreview} />
        <div className="w-full relative overflow-x-scroll" style={{ minHeight: "400px" }} >
          <canvas className={ fullscreen ? "absolute" : "absolute hidden"} ref={canvasFinal} style={{ overflow: 'scroll'}}/>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default App
