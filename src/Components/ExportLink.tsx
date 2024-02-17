import { useState, useEffect } from "react";

interface ExportLinkProps {
  label: string;
  params: string;
}

function ExportLink({ label, params } : ExportLinkProps) {
  const [displayIndicator, setDisplayIndicator] = useState<boolean>(false);
  const [clicked, setClicked] = useState<boolean>(false);

  useEffect(() => {
    if(clicked) {
      setDisplayIndicator(true);
      setTimeout(() => {
        setDisplayIndicator(false);
        setClicked(false);
      }, 5000);
    }
  }, [clicked]);

  function exportLink() {
    const url = `${window.location.origin}?${params}`;
    navigator.clipboard.writeText(url);

    setClicked(true);
  }

  return (
    <div className="indicator">
      {displayIndicator && <span className="indicator-item badge badge-primary">Copied !</span>}
      <button
        className="btn btn-primary"
        onClick={exportLink}
      >
        {label}
    </button>
    </div>
  );
}

export default ExportLink;

