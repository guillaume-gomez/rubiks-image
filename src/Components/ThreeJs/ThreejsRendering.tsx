import React, { useRef , useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Stats } from '@react-three/drei';
import { RubickFace } from "../../types";
import RubickCube from "./RubickCube";
import Toggle from "../Toggle";

interface ThreejsRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
  hasBorder: boolean;
  toggleFullScreen: (target: EventTarget) => void;
}


const spaceBetweenRubick = 0.2;

function ThreejsRendering({ width, height, tileSize, rubickFaces, hasBorder, toggleFullScreen } : ThreejsRenderingProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hideOtherFaces, setHideOtherFaces] = useState<boolean>(false);

  if(rubickFaces.length === 0) {
    return <div></div>;
  }

  const numberOfRubickCubeWidth = width/(tileSize * 3);

  return (
    <div>
      <Toggle
        label="Hide other faces (improve performences)"
        value={hideOtherFaces}
        toggle={() => setHideOtherFaces(!hideOtherFaces)}
      />
      <div className="flex flex-col gap-5 w-full h-full">
        <Canvas
          camera={{ position: [0, 0.0, 1], fov: 35, far: 5 }}
          dpr={window.devicePixelRatio}
          //onDoubleClick={toggleFullscreen}
          ref={canvasRef}
          style={{width: "75%", height: "90%"}}
        >
          <color attach="background" args={['skyblue']} />
          <Stats/>
          <Stage
            intensity={0.5}
            preset="rembrandt"
            shadows={{ type: 'accumulative', color: 'skyblue', colorBlend: 2, opacity: 1 }}
            adjustCamera={1}
            environment="city">
            <group
              position={[
              0, 0, 0]}
            >
              {
                rubickFaces.map((rubickFace, index) => {

                    const x = index % numberOfRubickCubeWidth;
                    const y = Math.floor(index / numberOfRubickCubeWidth);
                    const topLeft = rubickFace[0];
                    return (
                      <RubickCube
                        position={[topLeft.x / tileSize + (x * spaceBetweenRubick), -((topLeft.y / tileSize) + (y * spaceBetweenRubick)), 0]}
                        tileSize={tileSize}
                        rubickFace={rubickFace}
                        hideOtherFaces={hideOtherFaces}
                      />
                    )
                  }
                )
              }

            </group>
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} makeDefault />
          </Stage>
        </Canvas>
      </div>
    </div>
  );
}

export default ThreejsRendering;