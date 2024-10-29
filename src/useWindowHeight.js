//importing useEffect and useState functionality
import { useEffect, useState } from 'react';

//gets height of current display window
function getWindowHeight(){
    const {innerHeight: height} = window;
    return{
      height
    }
}

//returns height of current display window
function useWindowHeight(){
    const [windowHeight, setWindowHeight] = useState(
      getWindowHeight()
    );
  
    {/*handles window resizing based on height*/}
    useEffect(() => {
      function handleResize(){
        setWindowHeight(getWindowHeight());
      }
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    return windowHeight;
}

  export default useWindowHeight;