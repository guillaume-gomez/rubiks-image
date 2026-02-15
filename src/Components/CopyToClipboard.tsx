import { useState } from "react";
import { useCopyToClipboard } from 'usehooks-ts';

interface CopyToClipboardProps {
  initialLabel: string;
} 

function CopyToClipboard({initialLabel} : CopyToClipboardProps) {
  const [_, copy] = useCopyToClipboard();
  const [label, setLabel] = useState<string>(initialLabel);

  function handleCopy(text: string) {
    copy(text)
      .then(() => {
        console.log('Copied!', { text })
        setLabel("Copied to clipboard !");
        setTimeout(() => {
          setLabel(initialLabel);
        }, 2500);
      })
      .catch(error => {
        console.error('Failed to copy!', error)
      })
  }

  return (
    <div className="flex flex-row gap-2">
      <div className="flex-grow">
        <input
          type="text"
          placeholder={document.location.href}
          className="input input-bordered input-primary w-full"
        />
      </div>
      <button 
        className="btn btn-primary w-28"
        onClick={() => handleCopy(document.location.href) }
      >
        {label}
      </button>
    </div>
   );

}

export default CopyToClipboard;