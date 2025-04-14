import { RefObject, useRef } from "react";


interface useRecordSceneParams {
	canvasRef: RefObject<HTMLCanvasElement>
  videoRef?: RefObject<HTMLVideoElement>
}

export default function useRecordScene ({canvasRef,  videoRef} : useRecordSceneParams) {
  const recordedBlobs = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder>();
  const stream = useRef<MediaStream>();
  const recording = useRef<boolean>(false)
  
  
	function startRecord() {
    if(!canvasRef.current || !mediaRecorder.current) {
      return;
    }
		recordedBlobs.current = [];
		try {
      stream.current = canvasRef.current.captureStream();
		  mediaRecorder.current = new MediaRecorder(stream.current, {mimeType: 'video/webm'});
		} catch (e0) {
      console.error('Unable to create MediaRecorder with options Object: ', e0);
    }

    mediaRecorder.current.onstop = handleStop;
    mediaRecorder.current.ondataavailable = handleDataAvailable;
    mediaRecorder.current.start(100); // collect 100ms of data
    recording.current = true;
	}

  function handleStop() {
    const superBuffer = new Blob(recordedBlobs.current, {type: 'video/webm'});
    if(videoRef && videoRef.current) {
    	videoRef.current.src = window.URL.createObjectURL(superBuffer);
    }
  }

  function stopRecord() {
    if(!mediaRecorder.current) {
      return;
    }
    mediaRecorder.current.stop();
    recording.current = false;
    if(videoRef && videoRef.current) {
    	videoRef.current.controls = true;
    }
  }

  function handleDataAvailable(event: BlobEvent) {
    if (event.data && event.data.size > 0) {
      recordedBlobs.current.push(event.data as Blob);
    }
  }


function download() {
  const blob = new Blob(recordedBlobs.current, {type: 'video/webm'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rubiks-images.webm';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    }, 100);
	}

  return { stopRecord, startRecord, download, isRecording: recording.current };
}