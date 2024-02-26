import React from "react";
import { useAppDispatch, useAppSelector } from "Hook";
import _ from "lodash";

import { firstQuery, queryParameter, updateQueryParameter, initialLimitAndOffset } from "Slices/searchAreaSlice/searchAreaSlice";


const QueryParameter_PatientID: React.FC = () => {
    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    const queryParameter = searchAreaReducer.parameter;

    const dispatch = useAppDispatch();
    function queryParameterHandler(qidorsParameter: queryParameter) {
        dispatch(updateQueryParameter(qidorsParameter));
    }
    function searchBtnOnClick() {
        dispatch(initialLimitAndOffset());
        dispatch(firstQuery(queryParameter));
    }

    return <>
        <div className="flex flex-fill">
            <div className="flex text-nowrap align-items-center me-2">Patient ID:</div>
            <input
                className="border-2 m-2 p-2 w-96 rounded-lg"
                value={queryParameter.PatientID}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let tempQidorsParameter = _.cloneDeep(queryParameter);
                    tempQidorsParameter.PatientID = _.isEmpty(e.target.value) ? undefined : e.target.value;
                    queryParameterHandler(tempQidorsParameter);
                }} />
            <button className="border-2 m-2 rounded-lg px-2 " onClick={searchBtnOnClick}>Search</button>
        </div>
    </>
}

export { QueryParameter_PatientID };