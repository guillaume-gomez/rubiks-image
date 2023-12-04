import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RubickFace } from "../types";
import Toggle from "./Toggle";
import { resizeImageCanvas } from "../tools";


interface CanvasRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
  hasBorder: boolean;
  toggleFullScreen: (target: EventTarget) => void;
}

export interface ExternalActionInterface {
  getImage: () => string |null ;
}

const CanvasRendering = forwardRef<ExternalActionInterface, CanvasRenderingProps>(({
  width,
  height,
  tileSize,
  rubickFaces,
  hasBorder,
  toggleFullScreen}, ref) => {
  const [displayPreview, setDisplayPreview] = useState<boolean>(true);
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const canvasPreview = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if(refCanvas.current
        && refCanvas.current.width > 0
        && refCanvas.current.height > 0
        && canvasPreview.current
      ) {
      const context = refCanvas.current.getContext("2d");
      if(!context) {
        return;
      }

      renderRubickFaces(context, rubickFaces)
      if(hasBorder) {
        renderBorder(context, width, height);
      }
      // generate preview
      resizeImageCanvas(refCanvas.current, canvasPreview.current, refCanvas.current.width, refCanvas.current.height);
    }
  }, [refCanvas, canvasPreview, rubickFaces, hasBorder, tileSize]);

  useImperativeHandle(ref, () => ({
    getImage() {
      if(refCanvas.current) {
        return refCanvas.current.toDataURL('image/png');
      }
      return null;
    }

  }));

  function renderBorder(context: CanvasRenderingContext2D, width: number, height: number) {
    context.fillStyle = "black";
    context.lineWidth = 2;
    for(let x=0; x < width; x += tileSize) {
      for(let y=0; y < height; y+= tileSize) {
        context.strokeRect(x, y, tileSize, tileSize);
      }
    }

    context.lineWidth = 4;
    for(let x=0; x < width; x += 3*tileSize) {
      for(let y=0; y < height; y+= 3*tileSize) {
        context.strokeRect(x, y, tileSize*3, tileSize*3);
      }
    }
  }

  function renderRubickFaces(context: CanvasRenderingContext2D, rubickFaces: RubickFace[]) {
    rubickFaces.forEach(rubickFace => renderRubickFace(context, rubickFace));
  }

  function renderRubickFace(context: CanvasRenderingContext2D, rubickFace: RubickFace) {
    rubickFace.forEach(({x, y, color}) => renderSquare(context, color, x, y))
  }

  function renderSquare(context : CanvasRenderingContext2D, color: string, x: number, y: number) {
    context.fillStyle = color;
    context.fillRect(x,y, tileSize, tileSize);
  }

  return (
    <div>
      <Toggle
        label="Show real result"
        value={displayPreview}
        toggle={() => setDisplayPreview(!displayPreview)}
      />
      <span>The image could be wider than your screen. That is why we display the preview at first</span>
      <canvas className={ displayPreview ? "w-full" : "hidden"} ref={canvasPreview} />
      <div className="w-full relative overflow-x-scroll" style={{ minHeight: "400px" }} >
        <canvas
          className={ displayPreview ? "absolute hidden" : "absolute"}
          ref={refCanvas}
          width={width}
          height={height}
          style={{background:"#797979", overflow: 'scroll'}}
          onDoubleClick={(event) => toggleFullScreen(event.target)}
        />
      </div>
    </div>
  );
});

export default CanvasRendering;
