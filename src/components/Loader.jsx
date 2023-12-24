import React from "react";

import AnimaterLogo from "../assets/images/logo-animated.gif"
function Loader() {
    return ( 
        <div className="loader">
            <img  className="logo" src={AnimaterLogo} />
        </div>
     );
}

export default Loader;