import React from "react";
import { useAppSelector } from "Hook";
import L_Modal from "../LoadingModal.jsx";
import _ from "lodash";

import { ImageResult } from "./ImageResult";

const ImageResultList = () => {
    const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportSlice.imageResult?.Series;
    const isLoading = _.isEqual(imageWithReportSlice.imageResultStatus, "Loading");

    return (
        <div className="" style={{scrollbarWidth: 'none', '-ms-overflow-style': 'none'}}>
            {!isLoading && (
                <div className={`grid 2xl:grid-cols-6 xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 gap-3 p-3`}>
                    {seriesResults?.map((seriesResult, index) => (
                        <ImageResult key={index} wadoSingleSeries={seriesResult} />
                    ))}
                </div>
            )}
            <L_Modal isOpen={isLoading}>Loading...</L_Modal>
        </div>
    );
};

export { ImageResultList };
