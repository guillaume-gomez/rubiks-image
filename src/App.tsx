import { useMemo } from "react";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import RegularView from "./Views/RegularView";
import PresetView from "./Views/PresetView";


import './App.css';

function App() {
  const hasQueryString = useMemo(()=> /[?&]q=/.test(location.search), [location]);

  return (
    <div className="container mx-auto md:px-0 px-5">
      <div className="flex flex-col gap-4 h-screen">
        <Header/>
          {
            hasQueryString ? 
            <PresetView /> :
            <RegularView />
          }
        <Footer/>
      </div>
    </div>
  )
}

export default App
