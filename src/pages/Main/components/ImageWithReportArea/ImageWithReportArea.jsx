import React, {useRef} from 'react';
import { ReportList } from "./components/ReportList";
import { ImageResultList } from "./components/ImageResultList";
import { Icon } from '@iconify/react'
import report from "../../../../assests/report.png";
const Header = ({imagesReports}) => {

    setInterval(() => {
        // console.log(imagesReports.current);
    }, 1000);

    const slideToReport = () => {
        const element = document.getElementById("report");
        imagesReports.current.scrollTop = element.offsetTop;
    }


    return (
        <div className="bg-white border-b flex flex-row p-3">
            <div>
                <a className="text-green-500">
                    <Icon icon="gridicons:image-multiple" width="32" height="32"/>
                </a>
            </div>
            <div className="flex flex-row justify-between w-full">
                <div>
                    <span className="ml-2 text-green-500 text-2xl font-bold ">Images</span>
                </div>
                {/*<div className=" ">*/}
                    {/*<button onClick={slideToReport}*/}
                    {/*        className="flex items-center justify-center text-white border-2 border-green-500 bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:border-green-700 focus:ring focus:ring-green-200">*/}
                    {/*    <div className="flex items-center m-2">*/}
                    {/*        <Icon icon="tabler:report-medical" width="24" height="24" className="mr-1"/>*/}
                    {/*        <span className="font-bold text-lg">Reports</span>*/}
                    {/*    </div>*/}
                    {/*</button>*/}

                    <div className="flex justify-center">
                        <button  onClick={slideToReport}
                            className="w-32 h-12 rounded relative inline-flex group items-center justify-center px-5 py-2.5 cursor-pointer border-b-4 border-l-2 active:border-green-600 active:shadow-none shadow-lg bg-gradient-to-tr from-green-600 to-green-500 border-green-700 text-white ">

                            <div className="flex items-center m-2">
                                <Icon icon="tabler:report-medical" width="24"
                                      height="24" className="mr-1"/>
                                <span
                                    className="absolute w-0 h-0 transition-all duration-300 ease-out bg-white  opacity-10"></span>
                                <span className="relative font-bold text-lg">Reports</span>
                            </div>
                        </button>
                    </div>

                {/*</div>*/}
            </div>

        </div>

    );
};

const ImageWithReportArea = ({ onMessageChange }) => {
    const imagesReports = useRef(null);
    const handleMessageChange = () => {
        const message = true
        onMessageChange(false);
    };
    return (
        <div ref={imagesReports} className="bg-opacity-25 h-full overflow-auto flex flex-col flex-grow">
            <div>
            <Header imagesReports={imagesReports}/>
            {/*overflow-y-auto overflow-x-hidden*/}
            <div
                className="absolute flex flex-column justify-center items-center bg-green-500 rounded-r-lg w-8 h-28 mt-auto mb-auto cursor-pointer"
                onClick={handleMessageChange}>
                <div className="flex flex-row text-white text-lg font-bold" style={{writingMode: 'vertical-lr'}}>
                    SEARCH
                </div>
                <Icon icon="line-md:search-twotone" className="text-white mt-1.5" width="24" height="24"/>


            </div>
                <div className=" pl-5 pr-5">

                    <ImageResultList/>
                    <ReportList/>
                </div>
            </div>


        </div>
    );
};

export default ImageWithReportArea;
