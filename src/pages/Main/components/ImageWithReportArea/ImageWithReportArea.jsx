import React, {useRef} from 'react';
import { ReportList } from "./components/ReportList";
import { ImageResultList } from "./components/ImageResultList";
import { Icon } from '@iconify/react'
import report from "../../../../assests/report.png";
const Header = ({imagesReports}) => {

    setInterval(() => {
        console.log(imagesReports.current);
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
                <div >
                    <button onClick={slideToReport} className="flex flex-row text-white border-2 bg-green-500 rounded-lg">
                        <div className="m-2 flex ">
                            <Icon icon="tabler:report-medical" width="24" height="24" className="m-0.5"/>
                            <span className="font-bold text-lg">Reports</span>
                        </div>
                    </button>
                </div>
            </div>

        </div>

    );
};

const ImageWithReportArea = () => {
    const imagesReports = useRef(null);
    return (
        <div ref={imagesReports} className="bg-opacity-25 h-full overflow-auto flex flex-col flex-grow">
            <Header imagesReports={imagesReports}/>
            {/*overflow-y-auto overflow-x-hidden*/}
            <div  className=" pl-5 pr-5">
                <ImageResultList/>
                <ReportList />
            </div>


        </div>
    );
};

export default ImageWithReportArea;
