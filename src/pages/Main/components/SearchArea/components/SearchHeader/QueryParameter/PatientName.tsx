import React from "react";
import { useAppDispatch, useAppSelector } from "Hook";
import _ from "lodash";

import { queryParameter, updateQueryParameter } from "Slices/searchAreaSlice/searchAreaSlice";


const QueryParameter_PatientName: React.FC = () => {
    const qidorsReducer = useAppSelector((state) => state.searchAreaSlice);
    const qidorsParameter = qidorsReducer.parameter;

    const dispatch = useAppDispatch();
    function queryParameterHandler(qidorsParameter: queryParameter) {
        dispatch(updateQueryParameter(qidorsParameter));
    }

    return <>
        <div className="d-flex flex-fill mt-2">
            <div className="d-flex text-nowrap align-items-center me-2">Patient Name:</div>
            <input
                className="border-2 p-2 w-100 rounded-lg"
                value={qidorsParameter.PatientName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let tempQidorsParameter = _.cloneDeep(qidorsParameter);
                    tempQidorsParameter.PatientName = _.isEmpty(e.target.value) ? undefined : e.target.value;
                    queryParameterHandler(tempQidorsParameter);
                }} />
        </div>
    </>
}

export { QueryParameter_PatientName };