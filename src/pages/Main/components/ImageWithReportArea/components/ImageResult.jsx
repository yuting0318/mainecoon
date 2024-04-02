import React from "react";
import {useNavigate} from 'react-router-dom';
import _ from "lodash";
import { Icon } from '@iconify/react';
// import {Series} from "csy-dicomweb-wado-rs-uri";
//
// type ImageResultProps = {
//     wadoSingleSeries?: Series
// }


const ImageResult = ({wadoSingleSeries}) => {

    const metadata = _.first(wadoSingleSeries.metadata);
    const modalityAttribute = _.get(_.get(metadata, "00080060"), "Value");
    const studyInstanceUID = _.get(_.get(metadata, "0020000D"), "Value");
    const seriesInstanceUID = _.get(_.get(metadata, "0020000E"), "Value");
    // 是 SM 的話就抓這些資訊顯示
    const everySeries_numberOfFramesList = [];
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
        console.log("studyInstanceUID", studyInstanceUID);
        navigate(`../WSIViewerOpenLayers/${studyInstanceUID}/${seriesInstanceUID}/${modalityAttribute}`);
    }


    return <>
        <div className="mt-4 ">
            <div className="w-52 mb-2 h-56 border-4 rounded-lg shadow-xl shadow-gray-400" key="{seriesInstanceUID}" onClick={OnClick}>
                {// 將SM和ANN的內容放在同一個div內
                    (_.isEqual(_.first(modalityAttribute), "SM") || _.isEqual(_.first(modalityAttribute), "ANN")) && (
                        <div className="">
                            {// ModalityAttribute 是 SM 則顯示圖片
                                _.isEqual(_.first(modalityAttribute), "SM") && (
                                    <>
                                        <div className="">
                                            {/*<img*/}
                                            {/*    src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/MI_with_contraction_bands_very_high_mag.jpg/1920px-MI_with_contraction_bands_very_high_mag.jpg"*/}
                                            {/*    height={"280px"} width={"380px"}/>*/}
                                            <div className="flex justify-center">
                                                <Icon icon="emojione-monotone:microscope" width="128" height="128" />
                                            </div>
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
                                        <div className=" ">
                                            <div className="flex justify-center">
                                                <Icon icon="fluent:tag-search-24-filled" width="160" height="160" className="text-red-500/90"/>
                                            </div>
                                            {/*<Icon icon="uiw:edit" width="160" height="160" className={"text-center"}/>*/}

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
                            <Icon icon="logos:whatwg" width="120" height="120" />
                        </>
                    )
                }
            </div>
        </div>


    </>
}

export {ImageResult};