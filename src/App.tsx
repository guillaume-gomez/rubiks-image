import Header from "./Components/Header";
import Footer from "./Components/Footer";
import RegularView from "./Views/RegularView";
import PresetView from "./Views/PresetView";

import useQueryString from "./Hooks/useQueryString";

import './App.css';

function App() {
  const { hasQueryString, convertParams } = useQueryString();
  const { path } = convertParams();

  return (
    <div className="container mx-auto md:px-0 px-5">
      <div className="flex flex-col gap-4 h-screen">
        <Header/>
          {
            hasQueryString ? 
            <PresetView path={path} /> :
            <RegularView />
          }
        <Footer/>
      </div>
    </div>
  )
}

export default App
