import { useRef , useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, Stats, GizmoHelper, GizmoViewport, Backdrop } from '@react-three/drei';
import { RubickFace } from "../../types";
import { useSpring, animated } from '@react-spring/three';
import { InstancedMesh, Vector3 } from 'three';
import RubickCubesInstanceMesh, { ExternalActionInterface } from "./RubickCubesInstanceMesh";
import CubesSingleLayerInstanceMesh from "./CubesSingleLayerInstanceMesh";

// duplicated from ThreeJsRenderingManager
type AnimationType = 'wave'| 'inverted-wave'| 'one-by-one'|'random';

interface ThreejsRenderingProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
  hideOtherFaces: boolean;
  invert: boolean;
  animationType: AnimationType;
  onFinishCallback? : () => void;
  onStartCallback? : () => void;
}



function ThreejsRendering({ 
  width,
  height,
  tileSize,
  rubickFaces,
  hideOtherFaces,
  invert,
  animationType
} : ThreejsRenderingProps) {
  const cameraControlRef = useRef<CameraControls|null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maxDistance, setMaxDistance] = useState<number>(500);
  const [{ position, rotation }, apiGroup] = useSpring<any>(() =>({
    from : {position: [0,0, 0], rotation: [0, 0, 0] },
    config: { mass: 5, tension: 500, friction: 150, precision: 0.0001 }
  }));
  const rubickCubeInstanceMeshActionsRef = useRef<ExternalActionInterface| null>(null);

  useEffect(() => {
    if(invert) {
      apiGroup.start({
        to: {
          position: [(width/tileSize),0, 0],
          rotation: [0, Math.PI, 0]
        }
      });
    } else {
      apiGroup.start({
        to: {
          position: [0, 0, 0],
          rotation: [0, 0, 0]
        },
      });
    }
  }, [invert]);

  async function onStart(mesh : InstancedMesh) {
    if(cameraControlRef.current) {
      apiGroup.start({
        to: {
          position: [0, 0, 0],
          rotation: [0, - Math.PI/6, 0]
        },
      });

      cameraControlRef.current.maxDistance = 500;
      await cameraControlRef.current.setLookAt(
        0, 0, 1,
        0,0, 0,
        false
      );

      await cameraControlRef.current.fitToBox(mesh, true,
        { paddingLeft: 10, paddingRight: 10, paddingBottom: 10, paddingTop: 10 }
      );

      let distanceCamera = new Vector3();
      cameraControlRef.current.getPosition(distanceCamera, false);
      setMaxDistance(distanceCamera.z + 5.0);
    
      if(onStartCallback) {
        onStartCallback();
      }

    }
  }

  function onFinish() {
    apiGroup.start({
      to: {
        position: [0, 0, 0],
        rotation: [0, 0, 0]
      },
    });

    if(onFinishCallback) {
      onFinishCallback();
    }
  }

  function resetAnimation() {
    if(rubickCubeInstanceMeshActionsRef && rubickCubeInstanceMeshActionsRef.current) {
      rubickCubeInstanceMeshActionsRef.current.reset();
    }
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 35, far: 1000 }}
      dpr={window.devicePixelRatio}
      ref={canvasRef}
    >
      <Suspense fallback={<span className="loading loading-dots loading-lg"></span>}>
        <color attach="background" args={['#c0d6e9']} />
        { import.meta.env.MODE === "development" ? <Stats/> : <></> }
        <ambientLight color={0x000000} intensity={0.2} />
        <directionalLight color={0xffffff} position={[-5,1, 0]} intensity={1.5} />
        <directionalLight color={0xffffff} position={[-5,1, -5]} intensity={1} />
        <directionalLight color={0xffffff} position={[ 5,0, 5 ]} intensity={3} />
        <Backdrop
          scale={[width*1.5,(height/tileSize)*3, 100]}
          position={[0, -(height/tileSize) -5, -width/tileSize]}
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
              animationType={animationType}
              onStart={onStart}
              onFinish={onFinish}
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
          maxDistance={maxDistance}
          ref={cameraControlRef}
        />
      </Suspense>
    </Canvas>
  );
}

export default ThreejsRendering;
