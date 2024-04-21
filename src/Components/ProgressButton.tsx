import { useState, useEffect, useRef, MutableRefObject } from 'react';

interface ProgressButtonProps {
  label: string;
  durationInMs: number;
  onClick: () => void;

}

function ProgressButton({ label, durationInMs, onClick } : ProgressButtonProps) {
  const [milliseconds, setMilliseconds] = useState<number>(0);
  const [play, setPlay] = useState<boolean>(false);
  const animationRef : MutableRefObject<number | undefined> = useRef<number | undefined>(undefined);
  const previousTimeRef = useRef<number|undefined>(undefined);

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
    return () => {
      if(animationRef.current) {
        cancelAnimationFrame(animationRef.current)
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



  useEffect(() => {
    if(milliseconds >= durationInMs) {
        if(animationRef.current) {
           cancelAnimationFrame(animationRef.current)
        }
        setPlay(false);
        setMilliseconds(0);
        previousTimeRef.current = undefined;
    }
  }, [milliseconds]);

  return (
    <button className="btn btn-secondary flex flex-row justify-start px-0" onClick={handleClick}>
        <div className="bg-primary w-full h-full flex items-center justify-center" style={{width: `${(milliseconds/durationInMs)*100}%`}}>
        </div>
        <div className="absolute object-center" style={{left: "50%"}}>{label}</div>
    </button>
  );
}

export default ProgressButton;
