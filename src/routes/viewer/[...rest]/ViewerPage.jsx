import React, { useState, useEffect } from 'react';
import {Link, useLocation, useParams} from 'react-router-dom';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import { getAnnotations, getImagingInfo, getSeriesInfo } from '../../../lib/dicom-webs/series';
import { DICOMWEB_URLS } from '../../../lib/dicom-webs';

import { getDicomwebUrl } from '../../../lib/dicom-webs/server';

import Header from '../../../lib/Header';
import mainecoon from "../../../assests/mainecoon.png";
import {Icon} from "@iconify/react";
import {Draw} from "ol/interaction";

const ViewerPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const searchParams = useParams();
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const studyUid = searchParams.get('studyUid');
    const seriesUid = searchParams.get('seriesUid');

    const [baseUrl, setBaseUrl] = useState('');
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [smSeriesUid, setSmSeriesUid] = useState('');
    const [drawType, setDrawType] = useState([]);
    const [save, setSave] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            console.log('ViewerPage test')
            // if (!studyUid || !seriesUid) return;
            if (!studyUid || !seriesUid) {
                console.log('studyUid:', studyUid);
                console.log('seriesUid:', seriesUid);
                // return;
            }
            const baseUrl = getDicomwebUrl(server);
            setBaseUrl(baseUrl);


            const series = await getSeriesInfo(baseUrl, studyUid, seriesUid);
            const smSeriesUid = series?.modality === 'SM' ? seriesUid : series?.referencedSeriesUid;
            setSmSeriesUid(smSeriesUid);
            console.log('smSeriesUid',smSeriesUid)
            const imagingInfo = await getImagingInfo(baseUrl, studyUid, smSeriesUid);
            setImages(imagingInfo);
            console.log('imagingInfo:', imagingInfo);


            if (series?.modality === 'ANN') {
                const annotations = await getAnnotations(baseUrl, studyUid, seriesUid);
                setAnnotations(annotations);
            }
        };

        fetchData();
    }, [server, studyUid, seriesUid]);

    if (images.length === 0 || !smSeriesUid) {
        return (
            <div className="flex h-full w-full justify-center items-center">
                <h1>Loading...</h1>
            </div>
        );
    }

    const updateDrawType = (e, type) => {

        let prevButton = e.target;
        for (let i = 0; !prevButton?.querySelector('svg.animate-bounce') && i < 5; i++) {
            prevButton = prevButton.parentElement;
        }
        prevButton.querySelector('svg.animate-bounce')?.classList.remove('animate-bounce');

        let target = e.target;
        while (!target.querySelector('svg')) target = target.parentElement;
        target.querySelector('svg').classList.add('animate-bounce');
        setDrawType(type);
    };

    const handleViewer = (e) => {
        setDrawType(null)
        // Remove bounce animation
        let target = e.target;
        while (!target.querySelector('svg.animate-bounce')) target = target.parentElement;
        console.log(target)
        target.querySelector('svg.animate-bounce').classList.remove('animate-bounce');
    }

    const saveAnnotations = () => {
        setSave(!save);
    }

    return (
        <div className="flex h-full w-full flex-col">
            <header>
                <div className="bg-gradient-to-r from-green-400 via-green-200 to-blue-200 text-white p-1 ">
                    <div className="flex flex-row ">
                        <Link to="/" className={"w-20 h-20 flex flex-column justify-center items-center ml-3 mt-2"}>
                            <img src={mainecoon} alt="maincoon"/>
                        </Link>
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h1 className="text-2xl mt-2 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                            </div>

                            <div className="flex flex-row m-2 gap-2">
                                <div className="m-2 mt-3">

                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={handleViewer}
                                    >
                                        <Icon icon="fa6-regular:hand" className="animate-bounce text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={(e) => updateDrawType(e, 'Point')}
                                    >
                                        <Icon icon="tabler:point-filled" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={(e) => updateDrawType(e, 'LineString')}
                                    >
                                        <Icon icon="material-symbols-light:polyline-outline"
                                              className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={(e) => updateDrawType(e, 'Polygon')}
                                    >
                                        <Icon icon="ph:polygon" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={(e) => updateDrawType(e, 'Rectangle')}
                                    >
                                        <Icon icon="f7:rectangle" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={(e) => updateDrawType(e, 'Ellipse')}
                                    >
                                        <Icon icon="mdi:ellipse-outline" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                        onClick={(e) => updateDrawType(e, 'ELLIPSE')}
                                    >
                                        <Icon icon="bx:screenshot" className="text-black h-6 w-6"/>
                                    </button>
                                </div>

                                <div className="flex justify-end mt-1 ">
                                    <button
                                        className="bg-[#0073ff] w-24 h-10 justify-center flex mt-3.5 mx-2 p-2 text-white rounded-3 mb-2"
                                        onClick={saveAnnotations}
                                    >
                                        <Icon icon="ant-design:save-outlined" className="w-6 h-6 mr-2"/>儲存
                                    </button>
                                    <button
                                        className="bg-[#0073ff] w-24 h-10 justify-center flex mt-3.5 mx-2 p-2 text-white rounded-3 mb-2"
                                        // onClick={undoFeature}
                                    >
                                        <Icon icon="gg:undo" className="w-6 h-6 mr-2"/>復原
                                    </button>
                                    <button className="ml-6 mr-2 mb-2"
                                        // onClick={() => openStuModal()}
                                            style={{transform: 'rotate(180deg)'}}>
                                        <Icon icon="fluent:list-28-filled" className="text-black h-7 w-7"/>
                                    </button>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </header>
            <MicroscopyViewer
                baseUrl={baseUrl}
                studyUid={studyUid}
                seriesUid={smSeriesUid}
                images={images}
                annotations={annotations}
                drawType={drawType}
                save={save}
                className="grow"
            />
        </div>
    );
};


export default ViewerPage;
