import React from "react";
import { useAppDispatch, useAppSelector } from "Hook";
import _ from "lodash";
import { firstQuery, updateQueryParameter, initialLimitAndOffset } from "../../../../../../../slices/searchAreaSlice/searchAreaSlice";
const QueryParameter_PatientID = () => {
    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    const queryParameter = searchAreaReducer.parameter;

    const dispatch = useAppDispatch();
    const queryParameterHandler = (qidorsParameter) => {
        dispatch(updateQueryParameter(qidorsParameter));
    };
    const searchBtnOnClick = () => {
        dispatch(initialLimitAndOffset());
        dispatch(firstQuery(queryParameter));
    };

    return (
        <>
            <div className="flex flex-fill">
                <div className="flex text-nowrap align-items-center me-2 font-bold">Patient ID :</div>
                <input
                    className="border-2 m-2 p-2 rounded-lg text-black"
                    value={queryParameter.PatientID}
                    onChange={(e) => {
                        // 複製一份新的 queryParameter
                        let tempQidorsParameter = _.cloneDeep(queryParameter);
                        // 類似{e.target.value === "" ? undefined : e.target.value
                        // 檢查是不是空字串
                        tempQidorsParameter.PatientID = _.isEmpty(e.target.value) ? undefined : e.target.value;
                        queryParameterHandler(tempQidorsParameter);
                    }}
                />
                <button className="border-2 m-2 rounded-lg px-2 " onClick={searchBtnOnClick}>Search</button>
            </div>
        </>
    );
};

export { QueryParameter_PatientID };
