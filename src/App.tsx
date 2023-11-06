import { useRef, useState, useEffect } from 'react';

import useImageSizes from "./Hooks/useImageSizes";
import useRubickImage from "./Hooks/useRubickImage";

import Header from "./Components/Header";
import Footer from "./Components/Footer";
import InputFileWithPreview from "./Components/InputFileWithPreview";
import Toggle from "./Components/Toggle";
import { resizeImageCanvas, fromColorArrayToStringCSS } from "./tools";


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

  const { generateImage, optimizedGenerateImage } = useRubickImage({ tileSize });

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


  return (
    <div className="container">
      <Header/>
      <InputFileWithPreview
        onChange={uploadImage}
        value={image}
      />
      <button
        className="btn btn-primary"
        onClick={generateImagesInImage}>
          Generate
      </button>
      <Toggle
        label="Show real result"
        value={fullscreen}
        toggle={() => setFullscreen(!fullscreen)}
      />
      <span>The image could be wider than your screen. That is why we display the preview at first</span>
      <canvas className={ fullscreen ? "hidden" : "w-full"} ref={canvasPreview} />
      <div className="w-full relative overflow-x-scroll" style={{ minHeight: "400px" }} >
        <canvas className={ fullscreen ? "absolute" : " absolute hidden"} ref={canvasFinal} style={{ overflow: 'scroll'}}/>
      </div>
      <Footer/>
    </div>
  )
}

export default App
