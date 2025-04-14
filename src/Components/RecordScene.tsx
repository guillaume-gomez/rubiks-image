import { useRef,  RefObject } from "react";
import useRecordScene from "../Hooks/useRecordScene";

interface RecordSceneProps {
  canvasRef: RefObject<HTMLCanvasElement>;
}

function RecordScene({ canvasRef }: RecordSceneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stopRecord, startRecord, download, isRecording } = useRecordScene({ canvasRef, videoRef });

	return (<div>
			<button
				className={`btn btn-outline btn-primary btn-sm ${isRecording ? 'btn-disabled' : '' }`}
				onClick={startRecord}
			>
				Start Record
			</button>
			<button
				className={`btn btn-outline btn-accent btn-sm ${isRecording ? '' : 'btn-disabled'}`}
				onClick={stopRecord}
			>
				Stop Record
			</button>
      <button
      	className={`btn btn-sm btn-outline ${isRecording ? 'btn-disabled' : ''}`}
      	onClick={download}
      >
      	Save
      </button>
      <video ref={videoRef} style={{ width: 200, height: 100}}/>
		</div>
	)

}

export default RecordScene; 