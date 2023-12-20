import { useRef , useState, useEffect } from 'react';
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
  hasBorder: boolean;
  toggleFullScreen: (target: EventTarget) => void;
}

function ThreejsRendering({ width, height, tileSize, rubickFaces, hasBorder, toggleFullScreen } : ThreejsRenderingProps) {
  const cameraControlRef = useRef<CameraControls|null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hideOtherFaces, setHideOtherFaces] = useState<boolean>(false);


  useEffect(() => {
    if(cameraControlRef && cameraControlRef.current) {
      cameraControlRef.current.dollyTo(height/tileSize * 2 , true);
    }
  }, [])

  useEffect(() => {
    if(cameraControlRef && cameraControlRef.current) {
      recenterCamera();
    }
  }, [rubickFaces.length, cameraControlRef]);


  function recenterCamera() {
    if(cameraControlRef.current) {
      // position
      // target
      cameraControlRef.current.setLookAt(
            0, 0, height/tileSize * 2,
            0,0, 0,
            true
          );
    }
  }

  return (
    <div>
      <Toggle
        label="Hide other faces (improve performances)"
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
          <color attach="background" args={['#0f1216']} />
          <Stats/>
          <ambientLight args={[0xffffff]} intensity={0.5} position={[0, 0.5, 0.5]} />
          <directionalLight position={[-2,0, 0]} intensity={0.50} />
          <directionalLight position={[ 2,0, 0]} intensity={0.50} />
          <directionalLight color={0xffffff}  position={[ 0,0, 5]} intensity={0.5} />
          {/*<SpotLight
            distance={100}
            angle={1}
            attenuation={5}
            anglePower={Math.PI/2}
            position={[0,0,15]}
         />*/}
          <Backdrop
            scale={[100,100,25]}
            position={[0, -(height/2/tileSize) -5, -10]}
            floor={3} // Stretches the floor segment, 0.25 by default
            segments={20} // Mesh-resolution, 20 by default
          >
            <meshStandardMaterial color="#FFFFFF" metalness={1.0} emissive={"#45A5FF"} flatShading={true} />
          </Backdrop>
          {/*<Plane args={[200, 200]} rotation-x={-Math.PI/2} />*/}

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
            <CameraControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.9} makeDefault  maxDistance={250} ref={cameraControlRef} />
        </Canvas>
      </div>
    </div>
  );
}

export default ThreejsRendering;