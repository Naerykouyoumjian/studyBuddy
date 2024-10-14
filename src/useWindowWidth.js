//importing useEffect and useState functionality
import { useEffect, useState } from 'react';

//gets width of current display window
function getWindowWidth(){
    const {innerWidth: width} = window;
    return{
      width
    }
}

//returns width of current display window
function useWindowWidth(){
    const [windowWidth, setWindowWidth] = useState(
      getWindowWidth()
    );
    
    {/*handles window resizing based on width */}
    useEffect(() => {
      function handleResize(){
        setWindowWidth(getWindowWidth());
      }
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    return windowWidth;
}

export default useWindowWidth;