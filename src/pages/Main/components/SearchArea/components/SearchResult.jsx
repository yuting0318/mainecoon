import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";

import { updateQueryParameter, firstQuery, getNextTenResult } from "Slices/searchAreaSlice/searchAreaSlice";
import { QIDO_RS_Response, qidorsState, result as qidorsSingleStudyType } from "Slices/searchAreaSlice/searchAreaSlice";
import { queryParameter } from "Slices/searchAreaSlice/searchAreaSlice";
import { renderSpecificSeries, renderAllSeries, querySeries, queryReports } from "Slices/imageWithReportSlice/imageWithReportSlice";

// type SearchResultProps = {
//     qidorsSingleStudy?: qidorsSingleStudyType
// }

const SearchResult = ({ qidorsSingleStudy }) => {
    const dispatch = useAppDispatch();

    const imageWithReportReducer = useAppSelector((state) => state.imageWithReportSlice);
    const imageResult = imageWithReportReducer.imageResult;
    const seriesList = imageResult?.Series;
    const [seriesInstanceUIDList, setSeriesInstanceUIDList] = useState([]);

    // 整理 SeriesInstanceUIDList
    useEffect(() => {
        if (_.isEqual(imageWithReportReducer.imageResultStatus, "Success")) {
            const tempSeriesInstanceUIDList = [];

            _.forEach(seriesList, (series) => {
                tempSeriesInstanceUIDList.push(series.uid);
            })

            setSeriesInstanceUIDList(tempSeriesInstanceUIDList);
        }
    }, [imageResult])

    // (imageWithReportReducer的狀態是完成 && SeriesInstanceUIDList不為空) 就去 FHIR Server 查詢 Reports
    useEffect(() => {
        if (_.isEqual(imageWithReportReducer.imageResultStatus, "Success") && !(_.isEmpty(seriesInstanceUIDList))) {
            dispatch(queryReports(seriesInstanceUIDList));
        }
    }, [seriesInstanceUIDList])


    function OnClick() {
        const studyInstanceUID =
            getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyInstanceUID,
                "StudyInstanceUID, NotFound");
        dispatch(querySeries(studyInstanceUID));
    }

    function getQidorsSingleStudyMetadataValue(qidorsSingleStudy, metadataTag, defaultValue) {
        // console.log("~~~~~~~~~~~~~~~~~~~~~qidorsSingleStudy", qidorsSingleStudy)
        return _.isUndefined(_.first(_.get(qidorsSingleStudy, metadataTag).Value)) ? defaultValue : _.first(_.get(qidorsSingleStudy, metadataTag).Value);
    }

    const patientID= getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientID, "PatientID NotFound");
    const patientName = _.get(getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientName, "PatientName NotFound"), "Alphabetic");
    const patientBirthDate= getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientBirthDate, "PatientBirthDate NotFound");
    const patientSex= getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientSex, "PatientSex NotFound");
    const accessionNumber= getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.AccessionNumber, "AccessionNumber NotFound");
    const studyDate= getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyDate, "StudyDate NotFound");
    //
    // console.log("patientID", patientID)
    // console.log("patientName", patientName)
    // console.log("patientBirthDate", patientBirthDate)
    // console.log("patientSex", patientSex)
    // console.log("accessionNumber", accessionNumber)
    // console.log("studyDate", studyDate)

    // 畫面左邊下面的每一筆資料
    return (
        <>
            <div className="border-b-4 m-2" key={patientID}>
                <div className="flex flex-column px-3" onClick={OnClick}>
                    <div className="text-xl font-bold">
                        <span>{patientID}</span>&nbsp;/&nbsp;
                        <span>{patientName}</span>
                    </div>

                    <div className="">
                        <span>{patientBirthDate}</span>&nbsp;/&nbsp;
                        <span>{patientSex}</span>
                    </div>

                    <div className="">
                        <span>{accessionNumber}</span>&nbsp;/&nbsp;
                        <span>{studyDate}</span>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SearchResult;
