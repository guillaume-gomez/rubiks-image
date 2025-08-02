import { useMemo } from "react";

import eiffel from "/Tour_Eiffel_Wikimedia_Commons.jpg";


function useQueryString() {
  const hasQueryString = useMemo(()=> /[?&]q=/.test(location.search), [location]);

  function fetchPreset() {
    const searchParams = new URLSearchParams(location.search);
    const result = searchParams.get("q");
    return result
  }

  function convertParams() {
    const result = fetchPreset();
    switch(result) {
      case "eiffel":
      default:
        return { path: eiffel };
    } 
  }


  return { 
    hasQueryString, 
    convertParams
  };
}

export default useQueryString;
