import { useRef , useEffect } from 'react';
import {Object3D, InstancedMesh, MeshStandardMaterial, BoxGeometry } from 'three';
import { RubickFace } from "../../types";
import RubickTile from "./RubickTile";
import Toggle from "../Toggle";

interface InstancedMeshProps {
  width: number;
  height: number;
  tileSize: number;
  rubickFaces: RubickFace[];
  hasBorder?: boolean;
}

const colorsMaterialsArray = [
  new MeshStandardMaterial({color: "#2C5DA6"}), // bleu -> right
  new MeshStandardMaterial({color: "#7CCF57"}), // green -> left
  new MeshStandardMaterial({color: "#BD2827"}), // red -> top
  new MeshStandardMaterial({color: "#EC702D"}), // orange -> down
  new MeshStandardMaterial({color: "#EECF4E"}), // yellow -> front
  new MeshStandardMaterial({color: "#FFFFFF"}), //white -> back
]

const truc = new MeshStandardMaterial({color: "#FF00FF"})

const BORDER_SIZE = 0.1;
const SIZE = 1 - BORDER_SIZE;
const boxGeometry = new BoxGeometry(SIZE, SIZE, SIZE);

const spaceBetweenRubick = 0.1;


function fromColorToRotation(color: string) : string {
  switch(color) {
    case "#2C5DA6": return [0,-Math.PI/2, 0];
    case "#7CCF57": return [0, Math.PI/2, 0];
    case "#BD2827": return [Math.PI/2, 0, 0];
    case "#EC702D": return [-Math.PI/2, 0, 0];
    case "#EECF4E":
    default:
     return [0,0, 0];
    case "#FFFFFF": return [0,-Math.PI, 0];
  }
}


function Cubes({ width, height, tileSize, rubickFaces, hasBorder } : InstancedMeshProps) {
  const meshRef = useRef<InstancedMesh>();
  const tempObject = new Object3D();

  useEffect(() => {
    if (meshRef == null) return;
    if (meshRef.current == null) return;

    let id = -1;
    rubickFaces.forEach(rubickFace => {
      for(let z = 0; z < 3; z++) {
        rubickFace.forEach( ({x, y, color}) => {
            id++;
            tempObject.position.set((x/tileSize) - (width/2/tileSize), -(y/tileSize) + (height/2/tileSize), z);
            tempObject.rotation.set(...fromColorToRotation(color));
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(id, tempObject.matrix);
        })
      }
    })

    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rubickFaces]);

  return (
    <instancedMesh ref={meshRef} args={[boxGeometry, colorsMaterialsArray, rubickFaces.length * 9 * 3 ]} />
  );
}

export default Cubes;