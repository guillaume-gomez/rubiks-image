import { useState, useEffect, useRef, MutableRefObject } from 'react';

interface ProgressButtonProps {
  label: string;
  durationInMs: number;
  onClick: () => void;

}

function ProgressButton({ label, durationInMs, onClick } : ProgressButtonProps) {
  const [milliseconds, setMilliseconds] = useState<number>(0);
  const [play, setPlay] = useState<boolean>(false);
  const interval: MutableRefObject<number | null> = useRef<number|null>(null);

  function handleClick() {
    if(play === false) {
        setPlay(true);
        onClick();
        interval.current = setInterval(() => {
          setMilliseconds(milliseconds => milliseconds + 50);
        }, 50);
    }
  }

  useEffect(() => {
    if(!interval.current) {
        return;
    }
    return () => {
      if(interval.current){
        clearInterval(interval.current);
      }
    }
  }, []);

  useEffect(() => {
    if(milliseconds >= durationInMs) {
        if(interval.current) {
          clearInterval(interval.current);
        }
        setPlay(false);
        setMilliseconds(0);
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
