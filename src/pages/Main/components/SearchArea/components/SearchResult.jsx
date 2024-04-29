import React, {useEffect, useState} from 'react';
import {useAppDispatch, useAppSelector} from "Hook";
import _ from "lodash";

import {QIDO_RS_Response} from "Slices/searchAreaSlice/searchAreaSlice";
import {queryReports, querySeries} from "Slices/imageWithReportSlice/imageWithReportSlice";
import {Icon} from "@iconify/react";

// type SearchResultProps = {
//     qidorsSingleStudy?: qidorsSingleStudyType
// }

const SearchResult = ({qidorsSingleStudy,onMessageChange}) => {
    const dispatch = useAppDispatch();

    const imageWithReportReducer = useAppSelector((state) => state.imageWithReportSlice);
    const imageResult = imageWithReportReducer.imageResult;
    const seriesList = imageResult?.Series;
    const [seriesInstanceUIDList, setSeriesInstanceUIDList] = useState([]);

    // console.log('qidorsSingleStudy', qidorsSingleStudy);
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
        console.log("onClick")
        onMessageChange(true);
    }

    function getQidorsSingleStudyMetadataValue(qidorsSingleStudy, metadataTag, defaultValue) {
        // console.log("~~~~~~~~~~~~~~~~~~~~~qidorsSingleStudy", qidorsSingleStudy)
        return _.isUndefined(_.first(_.get(qidorsSingleStudy, metadataTag).Value)) ? defaultValue : _.first(_.get(qidorsSingleStudy, metadataTag).Value);
    }

    const patientID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientID, "NotFound");
    const patientName = _.get(getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientName, "NotFound"), "Alphabetic");
    const patientBirthDate = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientBirthDate, "NotFound");
    const patientSex = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientSex, "NotFound");
    const accessionNumber = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.AccessionNumber, "NotFound");
    const studyDate = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyDate, "NotFound");
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
            <tr className="border-b-4 m-2 " key={patientID}>
                <div className="contents flex-column px-3 h-28" onClick={OnClick}>
                    {/*<div className="flex flex-row">*/}
                    {/*<div className="text-xl font-bold h-full mt-2">*/}
                    {/*    <span>{patientID}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{patientName}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{patientBirthDate}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{patientSex}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{accessionNumber}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{studyDate}</span>*/}
                    {/*</div>*/}
                    {/*<table className="text-xl font-bold h-full mt-2">*/}
                    {/*    <thead>*/}
                    {/*    <tr>*/}
                    {/*        <td className="border-2 border-red-500 w-32">PatientID</td>*/}
                    {/*        <td className="border-2 border-red-500 w-32">PatientName</td>*/}
                    {/*        <td className="border-2 border-red-500 w-32">PatientBirthDate</td>*/}
                    {/*        <td className="border-2 border-red-500 w-32">PatientSex</td>*/}
                    {/*        <td className="border-2 border-red-500 w-32">AccessionNumber</td>*/}
                    {/*        <td className="border-2 border-red-500 w-32">StudyDate</td>*/}
                    {/*    </tr>*/}
                    {/*    </thead>*/}

                            <td className="border-2 w-1/4  p-2.5">{patientID?.length ? patientID : "NotFound"}</td>
                            <td className="border-2 w-1/4  p-2.5">{patientName?.length ? patientName : "NotFound"}</td>
                            <td className="border-2 w-1/12 p-2.5">{patientBirthDate?.length ? patientBirthDate : "NotFound"}</td>
                    {
                        patientSex === 'F' ? <td className="border-2 w-1/16 p-2.5 align-middle">
                                <div className="rounded-md bg-pink-500 w-fit p-1 scale-[0.91] mx-auto ">
                                    <Icon icon="ph:gender-female-bold" width="36" height="36" className="text-white"/>
                                </div>
                            </td> :
                            patientSex === 'M' ? <td className="border-2 w-1/16 p-2.5 align-middle">
                                    <div className="rounded-md bg-blue-600 w-fit p-1 scale-[0.91] mx-auto">
                                    <Icon icon="tdesign:gender-male" width="36" height="36" className="text-white"/>
                                    </div>
                                </td> :
                                <td className="border-2 w-1/16 p-2.5 text-center align-middle">
                                    <div className="rounded-md bg-green-400 w-fit p-1 scale-[0.91] mx-auto">
                                        <Icon icon="ion:male-female" width="36" height="36" className="text-white"  />
                                    </div>
                                </td>
                    }
                            {/*<td className="border-2 w-1/12 p-2.5">{patientSex?.length ? patientSex : "NotFound"}</td>*/}
                            <td className="border-2 w-1/4  p-2.5">{accessionNumber?.length ? accessionNumber : "NotFound"}</td>
                            <td className="border-2 w-1/6  p-2.5">{studyDate?.length ? studyDate : "NotFound"}</td>

                    {/*</table>*/}

                    {/*<div className="h-full">*/}
                    {/*    <span>{patientBirthDate}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{patientSex}</span>*/}
                    {/*</div>*/}
                    {/*/!*</div>*!/*/}

                    {/*<div className="h-full">*/}
                    {/*    <span>{accessionNumber}</span>&nbsp;/&nbsp;*/}
                    {/*    <span>{studyDate}</span>*/}
                    {/*</div>*/}
                </div>
            </tr>
        </>
    );
}

export default SearchResult;
