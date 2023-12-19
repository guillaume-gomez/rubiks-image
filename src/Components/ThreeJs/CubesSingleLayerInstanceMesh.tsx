import { useRef , useEffect } from 'react';
import { Object3D, InstancedMesh } from 'three';
import { RubickFace } from "../../types";
import { boxGeometry, colorsMaterialsArray, fromColorToRotation } from "./CubeCommon";

interface CubesSingleLayerInstanceMeshProps {
  tileSize: number;
  rubickFaces: RubickFace[];
}

function CubesSingleLayerInstanceMesh({ tileSize, rubickFaces } : CubesSingleLayerInstanceMeshProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const numberOfCubesSingleLayerInstanceMesh =  rubickFaces.length * 9;

  function init() {
    let id = 0;
    rubickFaces.forEach((rubickFace) => {
        rubickFace.forEach( ({x, y, color}) => {
            const object = new Object3D();

            object.position.set((x/tileSize), -(y/tileSize), 0);
            object.rotation.set(...fromColorToRotation(color));
            object.updateMatrix();
            meshRef.current?.setMatrixAt(id, object.matrix);
            id++;
        })
    })
  }

  useEffect(() => {
    if (meshRef == null) return;
    if (meshRef.current == null) return;
    if (rubickFaces.length <= 0) return;

    init();
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rubickFaces]);

  return (
    <instancedMesh ref={meshRef} args={[boxGeometry, colorsMaterialsArray, numberOfCubesSingleLayerInstanceMesh ]} />
  );
}

export default CubesSingleLayerInstanceMesh;