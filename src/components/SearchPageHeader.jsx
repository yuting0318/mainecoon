import React from "react";
import mainecoon from "../assests/mainecoon.png";
import { Link } from 'react-router-dom';
import {SearchHeader} from "Pages/Main/components/SearchArea/components/SearchHeader";

const SearchPageHeader = () => {
    return <>
        <div className="m-0 p-0">
            <div className=" text-white bg-green-400 p-1 ">
                <div className="flex flex-row">
                    <Link to="/" className={"w-16 h-16 flex flex-column justify-center items-center ml-3 mt-2"}>
                        <img src={mainecoon} alt="maincoon"/>
                    </Link>
                    <div className="flex justify-center items-center ">
                        <h1 className="text-2xl mt-2 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                    </div>
                    <div className="ml-32">
                        <SearchHeader />
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default SearchPageHeader;