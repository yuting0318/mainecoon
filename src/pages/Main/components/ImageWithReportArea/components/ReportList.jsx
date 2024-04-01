import React, {useState} from "react";
import {useAppSelector} from "Hook";

import _ from "lodash";
import Modal from "./Modal";


const ReportList = () => {

    const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    const reportResults = imageWithReportSlice.reportResult;
    const isLoading = _.isEqual(imageWithReportSlice.reportResultStatus, "Loading");
    const [isClick, setIsClick] = useState(false);
    const [reportContent, setReportContent] = useState([]);
    const handleCloseReport = () => {
        setIsClick(false);
        // setReportContent('');
    };
    const handleOpenReport = () => {
        setIsClick(true);
        fetch('report.txt')
            .then(response => response.text())
            .then(data => {
                const lines = data.split('\n'); // 將內容分割成每行
                setReportContent(lines);
            })
            .catch(error => console.error('Error fetching report:', error));
    };
    console.log('reportResults',reportResults)
    return (
        <>
            {/*{*/}
            {/*	!isLoading && reportResults?.map((reportResult: reportType, index) => {*/}
            {/*		const reportResultIndex = index;*/}
            {/*		const reportTitle = `Report_${_.toString(reportResultIndex + 1).padStart(3, "000")}`;*/}

            {/*		const seriesInstanceUID = reportResult.seriesInstanceUID;*/}
            {/*		const diagnosticReportUrl = reportResult.diagnosticReportUrl;*/}

            {/*		return <>*/}
            {/*			<Report title={reportTitle} seriesInstanceUID={seriesInstanceUID} diagnosticReportUrl={diagnosticReportUrl} />*/}
            {/*		</>*/}
            {/*	})*/}
            {/*}*/}
            {reportResults && (
                <>
                    <button onClick={handleOpenReport}>
                        <div className="ml-10 mt-3 w-52 border-4 rounded-lg border-green-500">
                            <div className=" border-b-2 border-green-500 ">
                                <p className="m-2.5 font-mono text-xl">Report_001</p>
                            </div>
                            <div className="text-green-500 p-3">
                                <h5 className="">Lung Positive</h5>
                                <p className="">content content</p>
                                <p className="">content content</p>
                            </div>
                        </div>
                    </button>
                    <button onClick={handleOpenReport}>
                        <div className="ml-10 mt-3 w-52 border-4 rounded-lg border-green-500">
                            <div className=" border-b-2 border-green-500 ">
                                <p className="m-2.5 font-mono text-xl">Report_002</p>
                            </div>
                            <div className="text-green-500 p-3">
                                <h5 className="">Ear Negative</h5>
                                <p className="">content content</p>
                                <p className="">content content</p>
                            </div>
                        </div>
                    </button>
                </>
            )}

            <Modal isOpen={isClick} onClose={handleCloseReport}>
                {reportContent.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </Modal>

            {isLoading && (
                <>
                    <span>
                        Loading
                    </span>
                </>
            )}
        </>
    );
}


export {ReportList};
