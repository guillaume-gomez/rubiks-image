import { useRef , useState, useEffect, Suspense } from 'react';
import { useFullscreen } from "rooks";
import { Canvas } from '@react-three/fiber';
import { CameraControls, Stats, GizmoHelper, GizmoViewport, Backdrop } from '@react-three/drei';
import { RubickFace } from "../../types";
import { useSpring, animated } from '@react-spring/three';
import Toggle from "../Toggle";
import RubickCubesInstanceMesh, { ExternalActionInterface } from "./RubickCubesInstanceMesh";
import CubesSingleLayerInstanceMesh from "./CubesSingleLayerInstanceMesh";
import { useDoubleTap } from 'use-double-tap';

interface ThreejsRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
}

function ThreejsRendering({ width, height, tileSize, rubickFaces } : ThreejsRenderingProps) {
  const cameraControlRef = useRef<CameraControls|null>(null);
  const containerCanvasRef = useRef<HTMLDivElement>(null);
  const [hideOtherFaces, setHideOtherFaces] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const [animationDuration] = useState<number>(10000);
  const { toggleFullscreen } = useFullscreen({ target: containerCanvasRef });
  const doubleTapEvent = useDoubleTap(() => {
      toggleFullscreen();
  });
  const ratio = Math.max(width, height)/tileSize;
  const [{ position, rotation }, apiGroup] = useSpring<any>(() =>({
    position: [-(width/2/tileSize), (height/2/tileSize), 0],
    rotation: [0, 0, 0],
    config: { mass: 5, tension: 500, friction: 150, precision: 0.0001 }
  }));
  const rubickCubeInstanceMeshActionsRef = useRef<ExternalActionInterface| null>(null);


  useEffect(() => {
    recenterCamera();
  }, [rubickFaces.length, cameraControlRef.current]);

  useEffect(() => {
    apiGroup.start({
      from: {
        position: [-(width/2/tileSize), (height/2/tileSize), 0],
      },
      to: {
        position: [-(width/2/tileSize), (height/2/tileSize), 0],
      }
    });
  }, [width, height, tileSize]);

  useEffect(() => {
    if(invert) {
      apiGroup.start({
        from: {
         position: [-(width/2/tileSize), (height/2/tileSize), 0],
          rotation: [0, 0, 0]
        },
        to: {
          position: [(width/2/tileSize), (height/2/tileSize), 0],
          rotation: [0, Math.PI, 0]
        }
      });
    } else {
      apiGroup.start({
        to: {
          position: [-(width/2/tileSize), (height/2/tileSize), 0],
          rotation: [0, 0, 0]
        },
        from: {
          position: [(width/2/tileSize), (height/2/tileSize), 0],
          rotation: [0, Math.PI, 0]
        }
      });
    }
  }, [invert])


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

  function resetAnimation() {
    if(rubickCubeInstanceMeshActionsRef && rubickCubeInstanceMeshActionsRef.current) {
      rubickCubeInstanceMeshActionsRef.current.reset();
    }
  }

  return (
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
        <div>
          <button
            className="btn btn-secondary btn-xs"
            onClick={resetAnimation}
          >
              Reset Animation
          </button>
        </div>
      }
      <div
        className="flex flex-col gap-5 w-full h-screen"
        ref={containerCanvasRef}
        {...doubleTapEvent}
      >
        <Canvas
          camera={{ position: [0, 0.0, ratio*2], fov: 35, far: 1000 }}
          dpr={window.devicePixelRatio}
        >
          <Suspense fallback={<span className="loading loading-dots loading-lg"></span>}>
            <color attach="background" args={['#c0d6e9']} />
            { import.meta.env.MODE === "development" ? <Stats/> : <></> }
            <ambientLight color={0x000000} intensity={0.2} />
            <directionalLight color={0xffffff} position={[-5,1, 0]} intensity={1.5} />
            <directionalLight color={0xffffff} position={[-5,1, -5]} intensity={1} />
            <directionalLight color={0xffffff} position={[ 5,0, 5 ]} intensity={3} />
            <Backdrop
              scale={[width,height/tileSize * 3, 50]}
              position={[0, -(height/2/tileSize) -5, -width/tileSize]}
              floor={10}
              segments={20}
              receiveShadow={true}
            >
              <meshStandardMaterial color="#FF0000" metalness={1.0} emissive={"#45A5FF"} flatShading={true} />
            </Backdrop>
            <animated.group
              rotation={rotation}
              position={position}
            >
              {
                hideOtherFaces ?
                <CubesSingleLayerInstanceMesh tileSize={tileSize} rubickFaces={rubickFaces} />
                : <RubickCubesInstanceMesh
                  tileSize={tileSize}
                  rubickFaces={rubickFaces}
                  width={width}
                  height={height}
                  animationType="one-by-one"
                  animationDuration={animationDuration}
                  ref={rubickCubeInstanceMeshActionsRef}
                />
              }
            </animated.group>
            <GizmoHelper alignment="bottom-right" margin={[50, 50]}>
              <GizmoViewport labelColor="white" axisHeadScale={1} />
            </GizmoHelper>
            <CameraControls
              minPolarAngle={0}
              maxPolarAngle={Math.PI / 1.9}
              minAzimuthAngle={-0.55}
              maxAzimuthAngle={0.55}
              makeDefault
              maxDistance={ratio*2.5}
              ref={cameraControlRef}
            />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

export default ThreejsRendering;