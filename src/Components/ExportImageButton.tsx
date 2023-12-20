import { useRef, RefObject } from "react";
import { format as formatFns } from "date-fns";

interface ExportImageButton {
    canvasRef: RefObject<HTMLCanvasElement>;
}

function ExportImageButton({canvasRef} : ExportImageButton) {
    const anchorRef = useRef<HTMLAnchorElement>(null);

    function isCanvasBlank() : boolean {
      if(!canvasRef.current) {
        return true;
      }

      if(canvasRef.current.width === 0 || canvasRef.current.height === 0) {
        return true;
      }

      const context = canvasRef.current.getContext('2d');
      if (!context) {
        return true;
      }


      const pixelBuffer = new Uint32Array(
        context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height).data.buffer
      );
      return !pixelBuffer.some(color => color !== 0);
    }

    function saveImage() {
      if(canvasRef.current && anchorRef.current) {

        const format = "jpeg";
        const dataURL = canvasRef.current.toDataURL(`image/${format}`);
        const dateString = formatFns(new Date(), "dd-MM-yyyy-hh-mm-ssss");
        (anchorRef.current as any).download = `${dateString}-rubick-image.${format}`;
        anchorRef.current.href =  dataURL.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
      }

    }

    return (
        <a
        ref={anchorRef}
        className={`btn btn-primary ${isCanvasBlank() ? "btn-disabled" : "" }`}
        onClick={ () => saveImage()}
        >
            Save 📸
        </a>
    )
}

export default ExportImageButton;