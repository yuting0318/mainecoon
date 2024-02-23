import React from "react";
import { useAppSelector, useAppDispatch } from "Hook";

import _ from "lodash";

import { ImageResult } from "./ImageResult";


const ImageResultList: React.FC = () => {

    const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportSlice.imageResult?.Series;
    const isLoading = _.isEqual(imageWithReportSlice.imageResultStatus, "Loading");

    return (
        <>
            {!isLoading && (
                <div className="flex flex-row">
                    {seriesResults?.map((seriesResult, index) => (
                        <ImageResult key={index} wadoSingleSeries={seriesResult} />
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

export { ImageResultList };