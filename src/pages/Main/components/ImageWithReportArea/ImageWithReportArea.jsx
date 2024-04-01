import React from 'react';
import { ReportList } from "./components/ReportList";
import { ImageResultList } from "./components/ImageResultList";
import { Icon } from '@iconify/react'

const Header = () => {
    return (
        <div className="bg-white border-b flex flex-row p-3">
            <div>
                <a className="text-green-500">
                    <Icon icon="gridicons:image-multiple" width="32" height="32"/>
                </a>
            </div>
            <div>
                    <span className="ml-2 text-green-500 text-2xl font-bold">Image & Report</span>
            </div>
        </div>

    );
};

const ImageWithReportArea = () => {
    return (
        <div className="bg-opacity-25 flex flex-col flex-grow">
            <Header/>
            {/*overflow-y-auto overflow-x-hidden*/}
            <div className=" pl-5 pr-5 border-b-4 ">
                <ImageResultList/>
            </div>

            <div className="h-56 flex overflow-x-auto ">
                <ReportList />
                {/*<ImageResultList/>*/}
            </div>


        </div>
    );
};

export default ImageWithReportArea;
