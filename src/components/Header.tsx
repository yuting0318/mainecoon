import React from "react";
import { Link } from "react-router-dom";


const Header: React.FC = () => {
    return <>
        <div className="m-0 p-0">
            <div className=" text-white bg-green-500 p-3">
                <div className="container-fluid">
                    <Link className=" text-white" to="/">MaineCoonViewer</Link>
                </div>
            </div>
        </div>
    </>
};

export default Header;
