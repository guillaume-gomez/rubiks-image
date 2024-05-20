import { useRef, RefObject } from "react";
import { format as formatFns } from "date-fns";

interface SaveImageButtonProps {
  label?: string;
  disabled?: boolean
  filename: string;
  canvasRef: RefObject<HTMLCanvasElement>;

}

function SaveImageButton({ label, filename, canvasRef,  disabled = false } : SaveImageButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);

  function saveImage() {
    if(canvasRef.current && anchorRef.current) {

      const format = "jpeg";
      const dataURL = canvasRef.current.toDataURL(`image/${format}`);
      const dateString = formatFns(new Date(), "dd-MM-yyyy-hh-mm");
      (anchorRef.current as any).download = `${filename}-${dateString}.${format}`;
      anchorRef.current.href = dataURL.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    }
  }

  return (
    <div className="flex gap-1" data-tip="Allow multiple download if you want to save more than one image">
       <a
        ref={anchorRef}
        className={`btn btn-primary ${disabled ? "btn-disabled" : "" }`}
        onClick={ () => saveImage()}
      >
        {label}
      </a>
      <div className="dropdown dropdown-end">
        <div tabIndex={0} role="button" className="text-info">
          <svg tabIndex={0} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-4 h-4 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div tabIndex={0} className="card compact dropdown-content z-[1] shadow bg-base-100 rounded-box w-64">
          <div tabIndex={0} className="card-body">
            <h2 className="card-title">Download did not start ? </h2>
            <p>Allow
              <a className="link px-1" href="https://www.howtogeek.com/428416/how-to-enabledisable-multiple-file-downloads-in-chrome/">multiple downloads</a>
              on your browser if you want to save more than one image.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SaveImageButton;