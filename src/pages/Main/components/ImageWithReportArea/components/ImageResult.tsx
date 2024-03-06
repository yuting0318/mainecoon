import React from "react";
import {useNavigate} from 'react-router-dom';

import _ from "lodash";

import {Series} from "csy-dicomweb-wado-rs-uri";

type ImageResultProps = {
    wadoSingleSeries?: Series
}


const ImageResult: React.FC<ImageResultProps> = ({
                                                     wadoSingleSeries
                                                 }) => {

    const metadata: object = _.first(wadoSingleSeries.metadata);
    const modalityAttribute: string = _.get(_.get(metadata, "00080060"), "Value");
    const studyInstanceUID: string = _.get(_.get(metadata, "0020000D"), "Value");
    const seriesInstanceUID: string = _.get(_.get(metadata, "0020000E"), "Value");

    // 是 SM 的話就抓這些資訊顯示
    const everySeries_numberOfFramesList: string[] = [];
    if (_.first(modalityAttribute) == "SM") {
        for (let index = 0; index < wadoSingleSeries.metadata.length; index++) {
            const element = wadoSingleSeries.metadata[index];
            const numberOfFrames = _.toString(_.first(_.get(_.get(element, "00280008"), "Value")));
            everySeries_numberOfFramesList.push(numberOfFrames);
        }
    }
    const sorted_everySeries_numberOfFramesList = _.sortBy(everySeries_numberOfFramesList);
    const maxNumberOfFrames = _.max(sorted_everySeries_numberOfFramesList);
    const seriesLevel = wadoSingleSeries.metadata.length;


    const navigate = useNavigate();

    function OnClick() {
        if (_.isEmpty(studyInstanceUID) && _.isEmpty(seriesInstanceUID)) {
            console.log("UID Empty Error");
            console.log("studyInstanceUID", studyInstanceUID);
            console.log("seriesInstanceUID", seriesInstanceUID);
            return;
        }
        navigate(`../WSIViewerOpenLayers/${studyInstanceUID}/${seriesInstanceUID}/${modalityAttribute}`);
    }


    return <>
        <div className="mt-4 ">
            <div className="w-52 h-52 mb-4 border border-4" key="{seriesInstanceUID}" onClick={OnClick}>
                {// 將SM和ANN的內容放在同一個div內
                    (_.isEqual(_.first(modalityAttribute), "SM") || _.isEqual(_.first(modalityAttribute), "ANN")) && (
                        <div className="">
                            {// ModalityAttribute 是 SM 則顯示圖片
                                _.isEqual(_.first(modalityAttribute), "SM") && (
                                    <>
                                        <div className="">
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/MI_with_contraction_bands_very_high_mag.jpg/1920px-MI_with_contraction_bands_very_high_mag.jpg"
                                                height={"280px"} width={"380px"}/>
                                            <div className="flex flex-col space-y-0 ">
                                                <h5 className="text-green-500 font-bold ml-3 mt-1">{modalityAttribute}</h5>
                                                <p className="ml-3 text-sm">最大圖片數量：{maxNumberOfFrames}張</p>
                                                <p className="ml-3 text-sm">擁有放大倍率：{seriesLevel}層</p>
                                            </div>

                                        </div>
                                    </>
                                )
                            }
                            {// ModalityAttribute 是 ANN 則顯示一支筆
                                _.isEqual(_.first(modalityAttribute), "ANN") && (
                                    <>
                                        <div className="">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor"
                                                 className="bi bi-3pencil-fill ml-10" viewBox="0 0 16 16"
                                                 height={"140px"} width={"130px"}
                                            >
                                                <path
                                                    d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                            </svg>
                                            <h5 className="mt-3 font-bold text-green-500 text-lg ml-3">{modalityAttribute}</h5>
                                        </div>
                                    </>
                                )
                            }
                        </div>
                    )
                }
                {// ModalityAttribute 不是 SM 或 ANN 則顯示問號
                    (!_.isEqual(_.first(modalityAttribute), "SM") && !_.isEqual(_.first(modalityAttribute), "ANN")) && (
                        <>
                            <h5 className="text-green-500">{modalityAttribute}</h5>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="bi bi-question-circle "
                                 viewBox="0 0 16 16" height={"100px"} width={"100px"}>
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                <path
                                    d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                            </svg>
                        </>
                    )
                }
            </div>
        </div>


    </>
}

export {ImageResult};