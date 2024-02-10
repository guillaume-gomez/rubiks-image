interface ExportLinkProps {
  label: string;
  params: string;
}

function ExportLink({ label, params } : ExportLinkProps) {
  
  function exportLink() {
    const url = `${window.location.origin}?${params}`;
    navigator.clipboard.writeText(url);
  }


  return (
    <button
      className="btn btn-primary"
      onClick={exportLink}
    >
      {label}
    </button>
  );
}

export default ExportLink;

