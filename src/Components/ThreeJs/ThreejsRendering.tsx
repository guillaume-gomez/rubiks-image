import { useRef , useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Stats } from '@react-three/drei';
import { RubickFace } from "../../types";
import Toggle from "../Toggle";
import CubesInstanceMesh from "./CubesInstanceMesh";

interface ThreejsRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
  hasBorder: boolean;
  toggleFullScreen: (target: EventTarget) => void;
}


const spaceBetweenRubick = 0.1;

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
          camera={{ position: [0, 0.0, 1], fov: 35, far: 300 }}
          dpr={window.devicePixelRatio}
          //onDoubleClick={toggleFullscreen}
          ref={canvasRef}
          style={{width: "75%", height: "90%"}}
        >
          <color attach="background" args={['skyblue']} />
          <Stats/>
          <ambientLight args={[0xffffff]} intensity={0.5} position={[0, 0.5, 0.5]} />
          <directionalLight position={[0, 0, 5]} intensity={0.5} />
            <group
              position={[
              0, 0, 0]}
            >
              <CubesInstanceMesh width={width} height={height} tileSize={tileSize} rubickFaces={rubickFaces} />

            </group>
            <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} makeDefault  maxDistance={250} />
        </Canvas>
      </div>
    </div>
  );
}

export default ThreejsRendering;