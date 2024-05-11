import React from "react";
import { useAppDispatch, useAppSelector } from "Hook";
import _ from "lodash";

import { queryParameter, updateQueryParameter } from "Slices/searchAreaSlice/searchAreaSlice";

const QueryParameter_AccessionNumber = () => {
    const qidorsReducer = useAppSelector((state) => state.searchAreaSlice);
    const qidorsParameter = qidorsReducer.parameter;

    const dispatch = useAppDispatch();
    function queryParameterHandler(qidorsParameter) {
        dispatch(updateQueryParameter(qidorsParameter));
    }

    return (
        <>
            <div className="d-flex flex-fill mt-2">
                <div className="d-flex text-nowrap align-items-center me-2 font-bold">Accession Number :</div>
                <input
                    className="border-2 p-2 w-100 rounded-lg text-black"
                    value={qidorsParameter.AccessionNumber}
                    onChange={(e) => {
                        let tempQidorsParameter = _.cloneDeep(qidorsParameter);
                        tempQidorsParameter.AccessionNumber = _.isEmpty(e.target.value) ? undefined : e.target.value;
                        queryParameterHandler(tempQidorsParameter);
                    }} />
            </div>
        </>
    );
}

export { QueryParameter_AccessionNumber };
