import { useRef , useState } from 'react';
import { useFullscreen } from "rooks";
import { RubickFace } from "../../types";
import Toggle from "../Toggle";
import Select from "../Select";
import  { ExternalActionInterface } from "./RubickCubesInstanceMesh";
import ProgressButton from "../ProgressButton";
import { useDoubleTap } from 'use-double-tap';
import { AnimationProvider } from "../../Reducers/generationReducer";
import RecordScene from "../RecordScene";
import ThreejsRendering from "./ThreeJsRendering";


interface ThreejsRenderingManagerProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
}

type AnimationType = 'wave'| 'inverted-wave'| 'one-by-one'|'random';


function ThreejsRenderingManager({ width, height, tileSize, rubickFaces } : ThreejsRenderingManagerProps) {
  const containerCanvasRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hideOtherFaces, setHideOtherFaces] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const [animationType, setAnimationType] = useState<AnimationType>("wave");
  const { toggleFullscreen } = useFullscreen({ target: containerCanvasRef });
  const doubleTapEvent = useDoubleTap(() => {
      toggleFullscreen();
  });
  const rubickCubeInstanceMeshActionsRef = useRef<ExternalActionInterface| null>(null);

  function resetAnimation() {
    if(rubickCubeInstanceMeshActionsRef && rubickCubeInstanceMeshActionsRef.current) {
      rubickCubeInstanceMeshActionsRef.current.reset();
    }
  }

  return (
    <AnimationProvider>
      <>
        <Toggle
          label="Hide other faces (improve performances)"
          value={hideOtherFaces}
          toggle={() => setHideOtherFaces(!hideOtherFaces)}
        />
        <Toggle
          label="Invert"
          value={invert}
          toggle={() => setInvert(!invert)}
        />
        { !hideOtherFaces &&
          <div className="flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2 items-center justify-between">  
              <Select
                label={"Animation type"}
                value={animationType}
                onChange={(newAnimationType) => setAnimationType(newAnimationType as AnimationType)}
                options={[
                  { value: "wave", label: "Wave"},
                  { value: "inverted-wave", label: "Inverted Wave"},
                  { value: "one-by-one", label: "One by one"},
                  { value: "random", label: "Random"},
                ]}
              />
              <RecordScene canvasRef={canvasRef} />
            </div>
            <ProgressButton
              label="Reset Animation"
              onClick={resetAnimation}
            />
          </div>
        }
        <div
          className="flex flex-col gap-5 w-full h-screen"
          ref={containerCanvasRef}
          onDoubleClick={toggleFullscreen}
          {...doubleTapEvent}
        >
          <ThreejsRendering
            width={width}
            height={height}
            tileSize={tileSize}
            rubickFaces={rubickFaces}
            hideOtherFaces={hideOtherFaces}
            invert={invert}
            animationType={animationType}
          />
        </div>
      </>
    </AnimationProvider>
  );
}

export default ThreejsRenderingManager;
