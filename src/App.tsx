import { useRef, useState, useEffect } from 'react';

import useImageSizes from "./Hooks/useImageSizes";
import useRubickImage from "./Hooks/useRubickImage";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import Card from "./Components/Card";
import InputFileWithPreview from "./Components/InputFileWithPreview";
import Toggle from "./Components/Toggle";
import Range from "./Components/Range";
import Error from "./Components/Error";
import { resizeImageCanvas } from "./tools";


import './App.css';

type AlgorithmType = "optimized" | "biggestImage";

const initialTileSize = 32;

function App() {
  const [algorithmType, setAlgorithmType] = useState<AlgorithmType>("optimized");
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [image, setImage] = useState<HTMLImageElement>();
  const [loading, setLoading] = useState<boolean>(false);

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
    setTileSize
  } = useImageSizes({ initialTileSize });

  const {
    generateImage,
    optimizedGenerateImage,
    setOption,
    hasBorder,
    noise,
    tileSize,
    users
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
    setLoading(true);

    if(image && canvasFinal.current && canvasPreview.current) {
      setTimeout(() => {
        if(algorithmType === "optimized") {
          optimizedGenerateImage(image, canvasFinal.current, possibleWidth, possibleHeight).then(
            () => setLoading(false)
          );
        } else {
          generateImage(image, canvasFinal.current).then(
            () => setLoading(false)
          );
        }
        // generate preview
        resizeImageCanvas(canvasFinal.current, canvasPreview.current, canvasFinal.current.width, canvasFinal.current.height);

      }, [500])
    }
  }

  function renderPreview() {
    if(!image) {
      return <></>;
    }

    const width = algorithmType === "optimized" ? possibleWidth : (image.width * tileSize);
    const height = algorithmType === "optimized" ? possibleHeight : (image.width * tileSize);

    return (
      <div className="flex flex-row gap-3 w-full">
          <span>Width : {width}</span>
          <span>Height : {height}</span>
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
              <button
                  onClick={generateImagesInImage}
                  type="button"
                  disabled={loading}
                  className="btn btn-primary">
                  {
                    loading ?
                      <span className="loading loading-spinner loading-lg"></span> :
                      "Generate"
                  }
              </button>
              <ul>
              {
                users.map(user => <li>{user.name}</li>)
              }
              </ul>
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
                {renderPreview()}
              </div>
            </Card>
            <button
              className="btn btn-accent"
              onClick={generateImagesInImage}
            >
              {
                loading ?
                  <span className="loading loading-spinner loading-lg"></span> :
                  "Generate"
              }
            </button>
          </div>
          <div className="basis-3/4">
            <Card title="Result">
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
            </Card>
          </div>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default App
