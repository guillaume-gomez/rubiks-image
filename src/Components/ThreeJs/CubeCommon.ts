import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MeshStandardMaterial, BoxGeometry } from 'three';

const BORDER_SIZE = 0.1;
const SIZE = 1 - BORDER_SIZE;

export const roundedBoxGeometry = new RoundedBoxGeometry(SIZE, SIZE, SIZE);
export const boxGeometry = new BoxGeometry(SIZE, SIZE, SIZE);

const paramsMaterial = { roughness: 0.0, metalness: 0.2, emissive: 0x000000, castShadow: true }

export const colorsMaterialsArray = [
  new MeshStandardMaterial({color: "#BD2827", ...paramsMaterial}), // red -> right
  new MeshStandardMaterial({color: "#EC702D", ...paramsMaterial}), // orange -> left
  new MeshStandardMaterial({color: "#EECF4E", ...paramsMaterial}), // yellow -> top
  new MeshStandardMaterial({color: "#FFFFFF", ...paramsMaterial}), // white -> down
  new MeshStandardMaterial({color: "#2C5DA6", ...paramsMaterial}), // blue -> front
  new MeshStandardMaterial({color: "#7CCF57", ...paramsMaterial}), //green -> back
]

export function fromColorToRotation(color: string) : [number, number, number] {
  switch(color) {
    case "#BD2827": return [0,-Math.PI/2, 0];
    case "#EC702D": return [0, Math.PI/2, 0];
    case "#EECF4E": return [Math.PI/2, 0, 0];
    case "#FFFFFF": return [-Math.PI/2, 0, 0];
    case "#2C5DA6":
    default:
     return [0,0, 0];
    case "#7CCF57": return [0,Math.PI, 0];
  }
}