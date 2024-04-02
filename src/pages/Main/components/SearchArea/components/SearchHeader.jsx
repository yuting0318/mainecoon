import React, { useState } from 'react';
import { QueryParameter_StudyDate } from './SearchHeader/QueryParameter/StudyDate';
import { QueryParameter_AccessionNumber } from './SearchHeader/QueryParameter/AccessionNumber';
import { QueryParameter_StudyUID } from './SearchHeader/QueryParameter/StudyUID';
import { QueryParameter_PatientName } from './SearchHeader/QueryParameter/PatientName';
import { QueryParameter_PatientID } from './SearchHeader/QueryParameter/PatientID';
import Modal from  './SearchHeader/SearchHeaderModal';

const SearchHeader = () => {
    const [isMouseOn, setIsMouseOn] = useState(false);

    const mouseOnFun = () => {
        setIsMouseOn(true);
    };

    const mouseOutFun = () => {
        setIsMouseOn(false);
    };

    const myRef = useRef(null);
    useOutsideClick(myRef, () => {mouseOutFun()});

    return (
        <div ref={myRef} className="" onMouseOver={mouseOnFun}>
            <SearchHeaderLiteMode setIsMouseOn={setIsMouseOn}/>
            {isMouseOn && <SearchHeaderExpandMode onMouseHoverHandler={mouseOutFun} />}
        </div>
    );
};

const SearchHeaderExpandMode = ({onMouseHoverHandler}) => {
    return (
        <div className="" onMouseOver={onMouseHoverHandler}>
            <div>
                <div className="flex flex-column">
                    <Modal isOpen={1} onClose={onMouseHoverHandler}>
                        <QueryParameter_PatientName />
                        <QueryParameter_StudyUID />
                        <QueryParameter_AccessionNumber />
                        <QueryParameter_StudyDate />
                    </Modal>
                </div>
            </div>
        </div>
    );
};

const SearchHeaderLiteMode = ({setIsMouseOn}) => {
    return (
        <div className="bg-auto border-bottom m-2 ">
            <div className="">
                <div className="flex flex-fill flex-column">
                    <QueryParameter_PatientID setIsMouseOn={setIsMouseOn} />
                </div>
            </div>
        </div>
    );
};

import { useEffect, useRef } from 'react';

export const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = event => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback(event);
                // ref.current.dispatchEvent(new CustomEvent('click-outside'));
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, callback]);
};

export { SearchHeader };
