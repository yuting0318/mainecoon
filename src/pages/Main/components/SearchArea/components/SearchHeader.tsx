import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";

import { QueryParameter_StudyDate } from "./SearchHeader/QueryParameter/StudyDate";
import { QueryParameter_AccessionNumber } from "./SearchHeader/QueryParameter/AccessionNumber";
import { QueryParameter_StudyUID } from "./SearchHeader/QueryParameter/StudyUID";
import { QueryParameter_PatientName } from "./SearchHeader/QueryParameter/PatientName";
import { QueryParameter_PatientID } from "./SearchHeader/QueryParameter/PatientID";

const SearchHeader: React.FC = () => {

    const [isMouseOn, setIsMouseOn] = useState(false);

    function mouseOnFun() {
        setIsMouseOn(true);
    }

    function mouseOutFun() {
        setIsMouseOn(false);
    }

    return <>
        <div
            className="position-relative"
            onMouseOver={mouseOnFun}>
            <SearchHeaderLiteMode />
            {isMouseOn && <SearchHeaderExpandMode onMouseHoverHandler={mouseOutFun} />}
        </div>
    </>
}

type SearchHeaderProps = {
    onMouseHoverHandler: () => void
}

const SearchHeaderExpandMode: React.FC<SearchHeaderProps> = ({ onMouseHoverHandler }) => {




    return <>
        <div className=" bg-white border-bottom position-absolute top-0 start-0 w-100 m-2"
             onMouseLeave={onMouseHoverHandler}>
            <div>
                <div className="flex flex-column">
                    <QueryParameter_PatientID />
                    <QueryParameter_PatientName />
                    <QueryParameter_StudyUID />
                    <QueryParameter_AccessionNumber />
                    <QueryParameter_StudyDate />
                </div>
            </div>
        </div>
    </>
}



const SearchHeaderLiteMode: React.FC = () => {

    return <>
        <div className="bg-white border-bottom m-2">
            <div className="container-fluid">
                <div className="flex flex-fill flex-column">
                    <QueryParameter_PatientID />
                </div>
            </div>
        </div>
    </>
}


export { SearchHeader };