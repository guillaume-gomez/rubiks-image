import { RefObject } from "react";
import useRecordScene from "../Hooks/useRecordScene";
import PlaySVG from "../CustomSVG/play.svg";
import StopSVG from "../CustomSVG/stop.svg";
import SaveSVG from "../CustomSVG/save.svg";

interface RecordSceneProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

function RecordScene({ canvasRef }: RecordSceneProps) {
  const { stopRecord, startRecord, download, isRecording } = useRecordScene({ canvasRef });

	return (
			<div className="join">
				<button
					className={`btn-sm btn btn-outline join-item ${isRecording ? 'btn-accent' : 'btn-primary'} `}
					onClick={ !isRecording ? startRecord : stopRecord }
				>
					{ isRecording ? "Stop" : "Record" }
					{ isRecording ? <StopSVG  /> : <PlaySVG /> }
				</button>
	      <button
	      	className="btn-sm btn btn-outline join-item btn-secondary"
	      	disabled={isRecording}
	      	onClick={download}
	      >
	      	Save
	      	<SaveSVG />
	      </button>
	     </div>
	)
}

export default RecordScene; 