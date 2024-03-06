import React from "react";
import {useAppSelector} from "Hook";

import _ from "lodash";

import {ImageResult} from "./ImageResult";


const ImageResultList: React.FC = () => {

    const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportSlice.imageResult?.Series;
    const isLoading = _.isEqual(imageWithReportSlice.imageResultStatus, "Loading");
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    function getColumnCount() {
        const screenWidth = window.innerWidth;
        if (screenWidth < 1920) {
            return 4; // 如果屏幕宽度小于1920像素，则显示3列
        } else {
            return 5; // 如果屏幕宽度大于等于1920像素，则显示5列
        }
    }


    return (
        <>
            {!isLoading && (
                // <div className="flex flex-row gap-3">
                <div className={`grid md:grid-cols-5 grid-cols-${getColumnCount()}`}>
                    {seriesResults?.map((seriesResult, index) => (
                        <ImageResult key={index} wadoSingleSeries={seriesResult}/>
                    ))}
                </div>


            )}

            {isLoading && (
                <>
                    <span>Loading</span>
                </>
            )}
        </>
    );

}

export {ImageResultList};