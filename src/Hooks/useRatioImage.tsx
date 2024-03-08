import { useState } from "react";

function useRatioImage({ initialMaxWidth = 1920, initialMaxHeight = 1080 }) {
    const [maxWidth, setMaxWidth] = useState<number>(initialMaxWidth);
    const [maxHeight, setMaxHeight] = useState<number>(initialMaxHeight);

    function resize(width: number, height: number) : [number, number] {
        //resize to fit maxSize
        if(width > maxWidth) {
            const ratio = maxWidth/width;
            return [ maxWidth, height * ratio ];
        } else if(height > maxHeight) {
            const ratio = maxHeight/height;
            return [ width * ratio, maxHeight ];
        }
        else {
            return [ width, height ];
        }
    }

    function updateMaxSize(maxWidth: number, maxHeight: number) {
        setMaxWidth(maxWidth);
        setMaxHeight(maxHeight);
    }

    return { resize, updateMaxSize };
}

export default useRatioImage;