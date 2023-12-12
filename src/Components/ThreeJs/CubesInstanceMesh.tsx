import { useRef , useEffect } from 'react';
import { useFrame } from "@react-three/fiber";
import { Object3D, Matrix4, Vector3, InstancedMesh, MeshStandardMaterial, Euler, Quaternion } from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RubickFace } from "../../types";

interface InstancedMeshProps {
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


const BORDER_SIZE = 0.1;
const SIZE = 1 - BORDER_SIZE;
const boxGeometry = new RoundedBoxGeometry(SIZE, SIZE, SIZE);

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

const colors = ["#2C5DA6", "#7CCF57", "#BD2827", "#EC702D", "#EECF4E", "#FFFFFF"];


function Cubes({ tileSize, rubickFaces, hasBorder } : InstancedMeshProps) {
  const meshRef = useRef<InstancedMesh>();
  const elapsedTimeAdded = useRef<number>(0);
  const animationFinish = useRef<boolean>(false);
  const tempObject = new Object3D();
  const numberOfCubes = rubickFaces.length * 9 * 3;

  function finalResult() {
    let id = 0;
    rubickFaces.forEach(rubickFace => {
      for(let z = 0; z < 3; z++) {
        rubickFace.forEach( ({x, y, color}) => {
            tempObject.position.set((x/tileSize), -(y/tileSize), z);
            tempObject.rotation.set(...fromColorToRotation(color));
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(id, tempObject.matrix);
            id++;
        })
      }
    })
  }

  function init() {
    let id = 0;
    rubickFaces.forEach(rubickFace => {
      for(let z = 0; z < 3; z++) {
        rubickFace.forEach( ({x, y, color}) => {
            //const indexColor = Math.floor(Math.random() * 6);

            tempObject.position.set((x/tileSize), -(y/tileSize), z);
            //tempObject.rotation.set(...fromColorToRotation(colors[indexColor]));
            tempObject.updateMatrix();
            meshRef.current.setMatrixAt(id, tempObject.matrix);
            id++;
        })
      }
    })
  }

  function initTest() {
    if(rubickFaces.length <= 0) {
      return;
    }

    let id = 0;
    for(let z = -1; z <= 1; z++) {
      rubickFaces[0].forEach( ({x, y, color}) => {
          const indexColor = Math.floor(Math.random() * 6);
          tempObject.position.set((x/tileSize), -(y/tileSize), z);
          //tempObject.rotation.set(...fromColorToRotation(colors[indexColor]));
          tempObject.updateMatrix();
          meshRef.current.setMatrixAt(id, tempObject.matrix);
          id++;
      })
    }
  }

  function rotateRubickCubes() {
    console.log(numberOfCubes)
    rubickFaces.forEach((rubickFace, index) => {
      const face = Math.floor(Math.random() * 3);
      const angle = Math.floor(Math.random() * 4);
      rotate("Y", index * 3 * 9, face, angle * Math.PI/2)
       rotate("X", index * 3 * 9, face, angle * Math.PI/2)
    })


  }

  function rotate(rotationAxis: "X"|"Y"|"Z", rubickCubeIndex: number, face: number, angleInRadian: number) {
    const ids = getIdsFromRotationAxis(rotationAxis, rubickCubeIndex, face);
    console.log(ids)
    ids.forEach(id => {
      let tempObject = new Object3D();
      let matrix = new Matrix4();

      meshRef.current.getMatrixAt(id, matrix);
      matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);

      matrix.makeRotationFromEuler(getEulerFromRotationAxis(rotationAxis, angleInRadian));
      matrix.setPosition(tempObject.position.x, tempObject.position.y, tempObject.position.z);
      meshRef.current.setMatrixAt(id, matrix);
    });
  }

  function getIdsFromRotationAxis(rotationAxis: "X"|"Y"|"Z", rubickCubeIndex: number, face: number) : array {
    let iterator = 0;
    switch(rotationAxis) {
      case "X":
      default:
        iterator = face * 1;
        return [0, 3, 6, 9, 12, 15, 18, 21, 24].map(id => (id + iterator) + (rubickCubeIndex));
      case "Y":
       iterator = face * 3;
        return [0, 1, 2, 9, 10, 11, 18,19, 20].map(id => (id + iterator) + (rubickCubeIndex));
      case "Z":
         iterator = face * 9;
        return [0, 1, 2, 3, 4, 5, 6, 7, 8].map(id => (id + iterator)  + (rubickCubeIndex));
    }
  }

  function getEulerFromRotationAxis(rotationAxis: "X"|"Y"|"Z", angleInRadian: number): Euler {
    switch(rotationAxis) {
      case "X":
      default:
        return new Euler(angleInRadian, 0, 0);
      case "Y":
        return new Euler(0, angleInRadian, 0);
      case "Z":
        return new Euler(0, 0, angleInRadian);
    }
  }


  function random(elapsedTime: number) {
    for(let id = 0; id < numberOfCubes; id++) {
      const indexColor = Math.floor(Math.random() * 6);
      let tempObject = new Object3D();
      let matrix = new Matrix4();

      meshRef.current.getMatrixAt(id, matrix);
      matrix.decompose(tempObject.position, tempObject.quaternion, tempObject.scale);
      tempObject.rotation.set(...fromColorToRotation(colors[indexColor]));
      //tempObject.rotateX(2.0 *  elapsedTime);
      tempObject.updateMatrix();

      meshRef.current.setMatrixAt(id, tempObject.matrix);
    }
  }

  useEffect(() => {
    if (meshRef == null) return;
    if (meshRef.current == null) return;

    elapsedTimeAdded.current = 0.0;
    animationFinish.current = false;

    init();
    if(rubickFaces.length > 0) {
      rotateRubickCubes();
    }
    //initTest();


    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [rubickFaces]);

  useFrame((state, elapsedTime) => {
    /*if(animationFinish.current) {
      return;
    }

    elapsedTimeAdded.current += elapsedTime;
    if(elapsedTimeAdded.current < 5.0) {
      random(elapsedTime);
    } else {*/
      //finalResult();
      /*animationFinish.current = true;
    }*/


    //rotate(elapsedTime)

    meshRef.current.instanceMatrix.needsUpdate = true;

  });

  return (
    <instancedMesh ref={meshRef} args={[boxGeometry, colorsMaterialsArray, numberOfCubes ]} />
  );
}

export default Cubes;