import { useRef , useState, useEffect } from 'react';
import { useFullscreen } from "rooks";
import { Canvas } from '@react-three/fiber';
import { CameraControls, Stats, GizmoHelper, GizmoViewport, Backdrop, Plane, SpotLight } from '@react-three/drei';
import { RubickFace } from "../../types";
import Toggle from "../Toggle";
import RubickCubesInstanceMesh from "./RubickCubesInstanceMesh";
import CubesSingleLayerInstanceMesh from "./CubesSingleLayerInstanceMesh";

interface ThreejsRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
}

const intensity= 0.5;

function ThreejsRendering({ width, height, tileSize, rubickFaces } : ThreejsRenderingProps) {
  const cameraControlRef = useRef<CameraControls|null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hideOtherFaces, setHideOtherFaces] = useState<boolean>(false);
  const { toggleFullscreen } = useFullscreen({ target: canvasRef });
  const ratio = Math.max(width, height)/tileSize

  useEffect(() => {
    recenterCamera();
  }, [rubickFaces.length, cameraControlRef.current]);


  function recenterCamera() {
    if(cameraControlRef && cameraControlRef.current) {
      // position
      // target
      cameraControlRef.current.setLookAt(
            0, 0, ratio * 2,
            0,0, 0,
            true
          );
    }
  }

  console.log("ratio: ", ratio * 2.5)

  return (
    <>
      <Toggle
        label="Hide other faces (improve performances)"
        value={hideOtherFaces}
        toggle={() => setHideOtherFaces(!hideOtherFaces)}
      />
      <div className="flex flex-col gap-5 w-full h-full">
        <Canvas
          camera={{ position: [0, 0.0, 1], fov: 35, far: 1000 }}
          dpr={window.devicePixelRatio}
          onDoubleClick={toggleFullscreen}
          ref={canvasRef}
          style={{ width: "100%", height: "95%"}}
        >
          <color attach="background" args={['#c0d6e9']} />
          <Stats/>
          <ambientLight color={0x000000} intensity={0.2} />
          <directionalLight color={0xffffff} position={[-5,1, 0]} intensity={1.5} />
          <directionalLight color={0xffffff} position={[-5,1, -5]} intensity={1} />
          <directionalLight color={0xffffff} position={[ 5,0, 5 ]} intensity={3} />
          <Backdrop
            scale={[width,height/tileSize * 3, 50]}
            position={[0, -(height/2/tileSize) -5, -10]}
            floor={3}
            segments={20}
          >



            <meshStandardMaterial color="#FFFFFF" metalness={1.0} emissive={"#45A5FF"} flatShading={true} />
          </Backdrop>
          <group
            position={[
            -(width/2/tileSize), (height/2/tileSize), 0]}
          >
            {
              hideOtherFaces ?
              <CubesSingleLayerInstanceMesh tileSize={tileSize} rubickFaces={rubickFaces} />
              : <RubickCubesInstanceMesh tileSize={tileSize} rubickFaces={rubickFaces} />
            }
          </group>
          <GizmoHelper alignment="bottom-right" margin={[50, 50]}>
            <GizmoViewport labelColor="white" axisHeadScale={1} />
          </GizmoHelper>
          <CameraControls
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 1.9}
            minAzimuthAngle={-1}
            maxAzimuthAngle={1}
            makeDefault
            maxDistance={ratio*2.0}
            ref={cameraControlRef}
          />
        </Canvas>
      </div>
    </>
  );
}

export default ThreejsRendering;