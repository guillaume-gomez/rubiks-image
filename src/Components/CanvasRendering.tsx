import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';


interface CanvasRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  toggleFullScreen: (target: EventTarget) => void;
}

export interface ExternalActionInterface {
  getImage: () => string |null ;
}

const CanvasRendering = forwardRef<ExternalActionInterface, CanvasRenderingProps>(({width, height, tileSize, toggleFullScreen}, ref) => {
  const refCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if(refCanvas.current) {
      const context = refCanvas.current.getContext("2d");
      if(context) {
        renderBorder(context, width, height);
      }
    }
  }, [refCanvas, rects]);

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

  return (
    <canvas
      ref={refCanvas}
      width={width}
      height={height}
      style={{background:"#797979"}}
      onDoubleClick={(event) => toggleFullScreen(event.target)}
    />
  );
});

export default CanvasRendering;
