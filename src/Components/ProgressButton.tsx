import { useState, useEffect, useRef, MutableRefObject } from 'react';
import { useAnimation } from "../Reducers/generationReducer";

interface ProgressButtonProps {
  label: string;
  onClick: () => void;
}

function ProgressButton({ label, onClick } : ProgressButtonProps) {
  const [milliseconds, setMilliseconds] = useState<number>(0);
  const [play, setPlay] = useState<boolean>(false);
  const animationRef : MutableRefObject<number | undefined> = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number|undefined>(undefined);
  const { started, duration: durationInMs } = useAnimation();

  function animate(time: number) {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;

      // Pass on a function to the setter of the state
      // to make sure we always have the latest state
      setMilliseconds(prevCount => (prevCount + deltaTime));
    }
    previousTimeRef.current = time;
    animationRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    if(started) {
      handleClick();
    } else {
        if(animationRef.current) {
           cancelAnimationFrame(animationRef.current)
        }
        setPlay(false);
        setMilliseconds(0);
        previousTimeRef.current = undefined;
    }
  }, [started])

  useEffect(() => {
    return () => {
      if(animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  function handleClick() {
    if(play === false) {
        setPlay(true);
        onClick();
        requestAnimationFrame(animate);
    }
  }

  const progressPercentage = (milliseconds/durationInMs)*100;

  return (
    <button
      className="btn btn-secondary btn-xs flex flex-row justify-start px-0 w-full"
      onClick={handleClick}
    >
        <div
          className="bg-primary w-full h-full flex items-center justify-center"
          style={{width: `${progressPercentage}%`}}
        >
        </div>
        <div
          className="absolute object-center"
          style={{left: "50%", transform: "translate(-50% , 0%)"}}
        >
          { milliseconds === 0 ? label : `${Math.trunc(progressPercentage)}%` }
        </div>
    </button>
  );
}

export default ProgressButton;
