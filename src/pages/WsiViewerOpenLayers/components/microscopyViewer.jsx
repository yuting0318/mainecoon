
import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import {Icon} from '@iconify/react';
import Map from "ol/Map";
import View from "ol/View";
import LayerTile from "ol/layer/Tile";
import XYZ from 'ol/source/XYZ';
import { Draw } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Projection } from 'ol/proj';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import { getCenter } from 'ol/extent';


import dicomWebServerConfig from "Configs/DICOMWebServer.config";

function MicroscopyViewer(props) {
    const viewerID = "viewerID";
    const studyInstanceUID = _.get(props, "studyInstanceUID");
    const seriesInstanceUID = _.get(props, "seriesInstanceUID");

    const pyramidSliceReducer = useAppSelector((state) => state.pyramidSliceReducer);
    const Instances = pyramidSliceReducer.smResult?.Instances;
    const annVectorLayers = pyramidSliceReducer.annotaionResults;

    const [drawType, setDrawType] = useState('Point');
    const mapRef = useRef(null);
    const sourceRef = useRef(new VectorSource({ wrapX: false }));
    const [isDrawingEllipse, setIsDrawingEllipse] = useState(false);
    const [ellipseCenter, setEllipseCenter] = useState(null);
    const [ellipsePreview, setEllipsePreview] = useState(null);

    const savedEllipsesSourceRef = useRef(new VectorSource({ wrapX: false }));

    const drawInteractionRef = useRef(null);

    useEffect(() => {
        const minLevel = 0;
        const maxLevel = _.size(Instances) - 1;
        const bigestInstance = _.last(Instances);
        const bigestInstanceMetadata = _.get(bigestInstance, "metadata");
        const totalPixelMatrixColumns = _.first(_.get(_.get(bigestInstanceMetadata, "00480006"), "Value"));
        const totalPixelMatrixRows = _.first(_.get(_.get(bigestInstanceMetadata, "00480007"), "Value"));
        const extent = [0, 0, totalPixelMatrixColumns, totalPixelMatrixRows];

        const dicomProjection = new Projection({
            code: 'DICOM',
            units: 'pixels',
            extent: extent
        });

        const wsiSourceXYZ = new XYZ({
            tileUrlFunction: (tileCoord) => {
                const z = tileCoord[0];
                const x = tileCoord[1];
                const y = tileCoord[2];

                const currentInstance = Instances[z]; // 當前的 Instance
                const currentInstanceMetadata = _.get(currentInstance, "metadata"); // 當前 Instance 的 Metadata

                const currentInstanceTotalPixelMatrixColumns = _.first(_.get(_.get(currentInstanceMetadata, "00480006"), "Value")); // 00480006 總寬 TotalPixelMatrixColumns
                const currentInstanceSingleImageWidth = _.first(_.get(_.get(currentInstanceMetadata, "00280011"), "Value")); // 每張小圖的寬
                const widthImageCount = Math.ceil(currentInstanceTotalPixelMatrixColumns / currentInstanceSingleImageWidth); // 寬度部分要擺多少張
                const index = x + y * widthImageCount // 計算 Index

                const queryMode = _.get(currentInstance, "queryMode");
                const frames = _.get(currentInstance, "Frames");

                const specificFrameObject = _.get(frames, index);
                const url = _.get(_.get(_.get(specificFrameObject, "url"), queryMode), "rendered");

                return url;
            },
            maxZoom: maxLevel,
            minZoom: minLevel,
            projection: dicomProjection,
            wrapX: false,
            interpolate: false,
        });
        const savedEllipsesLayer = new VectorLayer({
            source: savedEllipsesSourceRef.current,
        });
        const wsiLayer = new LayerTile({ source: wsiSourceXYZ, extent: extent });

        const view = new View({
            center: getCenter(extent),
            zoom: 2,
            minZoom: minLevel,
            maxZoom: maxLevel,
            projection: dicomProjection,
            extent: extent,
        });

        const vector = new VectorLayer({ source: sourceRef.current });
        const layers = [wsiLayer, ...annVectorLayers, vector, savedEllipsesLayer];
        const mousePositionControl = new MousePosition({
            coordinateFormat: createStringXY(0),
            projection: 'EPSG:4326',
        });

        mapRef.current = new Map({
            target: viewerID,
            controls: [mousePositionControl],
            layers: layers,
            view: view,

        });
    }, [Instances, annVectorLayers]);

    useEffect(() => {
        if (!mapRef.current || !sourceRef.current) return;

        // 如果正在绘制椭圆，添加事件监听
        if (isDrawingEllipse) {
            const newEllipsePreview = new Feature();
            setEllipsePreview(newEllipsePreview);
            sourceRef.current.addFeature(newEllipsePreview);

            const clickHandler = (event) => {
                if (!ellipseCenter) {
                    setEllipseCenter(event.coordinate);
                } else {
                    const radiusX = calculateRadius(event.coordinate, ellipseCenter);
                    const radiusY = radiusX / 2; // 假设Y轴半径为X轴的一半
                    const ellipseCoords = createEllipse(ellipseCenter, radiusX, radiusY);
                    newEllipsePreview.setGeometry(new Polygon([ellipseCoords]));
                    setIsDrawingEllipse(false); // 结束绘制
                }
            };

            const moveHandler = (event) => {
                if (ellipseCenter) {
                    const radiusX = calculateRadius(event.coordinate, ellipseCenter);
                    const radiusY = radiusX / 2; // 同上
                    const ellipseCoords = createEllipse(ellipseCenter, radiusX, radiusY);
                    newEllipsePreview.setGeometry(new Polygon([ellipseCoords]));
                }
            };

            mapRef.current.on('singleclick', clickHandler);
            mapRef.current.on('pointermove', moveHandler);

            return () => {
                mapRef.current.un('singleclick', clickHandler);
                mapRef.current.un('pointermove', moveHandler);
                sourceRef.current.removeFeature(newEllipsePreview);
            };
        }

        if (!isDrawingEllipse && ellipsePreview) {
            savedEllipsesSourceRef.current.addFeature(new Feature(ellipsePreview.getGeometry())); // 將橢圓添加到保存圖層
            ellipsePreview.setGeometry(null); // 清除預覽圖層中的橢圓
            sourceRef.current.removeFeature(ellipsePreview); // 從原來的圖層中移除
            setEllipsePreview(null); // 重置預覽Feature
        }
    }, [isDrawingEllipse, ellipseCenter]);

    const updateDrawType = (type) => {
        // 如果当前正在绘制椭圆，则处理椭圆的结束逻辑
        if (isDrawingEllipse) {
            setIsDrawingEllipse(false);
            if (ellipsePreview) {
                ellipsePreview.setGeometry(null);
                sourceRef.current.removeFeature(ellipsePreview);
                setEllipsePreview(null);
            }
            setEllipseCenter(null);
        }

        // 移除当前的绘图交互（如果存在）
        if (drawInteractionRef.current) {
            mapRef.current.removeInteraction(drawInteractionRef.current);
            drawInteractionRef.current = null;
        }

        // 对于椭圆，设置相关状态以启用特殊的椭圆绘图逻辑
        if (type === 'Ellipse') {
            setIsDrawingEllipse(true);
        } else {
            // 为其他绘图类型创建 Draw 交互
            const drawInteraction = new Draw({
                source: sourceRef.current,
                type: type, // 使用选定的绘图类型
                // 可以在此处添加其他 Draw 交互的配置
            });

            // 添加新的绘图交互到地图上
            mapRef.current.addInteraction(drawInteraction);
            drawInteractionRef.current = drawInteraction;
        }
    };

    function createEllipse(center, radiusX, radiusY, rotation = 0, sides = 50) {
        let angleStep = (2 * Math.PI) / sides;
        let coords = [];

        for (let i = 0; i < sides; i++) {
            let angle = i * angleStep;
            let x = center[0] + radiusX * Math.cos(angle) * Math.cos(rotation) - radiusY * Math.sin(angle) * Math.sin(rotation);
            let y = center[1] + radiusX * Math.cos(angle) * Math.sin(rotation) + radiusY * Math.sin(angle) * Math.cos(rotation);
            coords.push([x, y]);
        }
        coords.push(coords[0]); // 确保闭合椭圆

        return coords;
    }

    function calculateRadius(coord1, coord2) {
        return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
    }

    const saveAnnotations = () => {
        // 获取所有手动添加的标记
        const features = sourceRef.current.getFeatures();
        // 转换为JSON格式
        const savedFeatures = features.map(feature => feature.getProperties());
        // 输出到控制台
        console.log('Saved Annotations:', JSON.stringify(savedFeatures));
    };


    return (
        <>
            <div className="flex flex-column w-25 border-end">
                <div>
                    <label className="ml-2 text-2xl">Patient</label>
                </div>
                <div className="bg-[#e8e8e8] mt-2">
                    <label className="block ml-2 text-xl">ID:</label>
                    <label className="block ml-2 text-xl">Name:</label>
                    <label className="block ml-2 text-xl">Gender:</label>
                    <label className="block ml-2 text-xl">Birthday:</label>
                </div>
                <div>
                    <label className="ml-2 text-2xl mt-2">Case</label>
                </div>
                <div className="bg-[#e8e8e8] mt-2">
                    <label className="block ml-2 text-xl">Accession:</label>
                    <label className="block ml-2 text-xl">ID:</label>
                    <label className="block ml-2 text-xl">Date:</label>
                    <label className="block ml-2 text-xl">Time:</label>
                </div>
            </div>
            <div className="w-100 h-100" id={viewerID}></div>
            <div className="flex flex-column w-25 border-start">
                <div>
                    <label className="ml-2 text-2xl">SlideLabel</label>
                </div>
                <div className="bg-[#e8e8e8] mt-2">
                    <label className="block ml-2 text-xl">LabelText</label>
                    <p className="block ml-2 text-xl">BarcodeValue:</p>
                </div>
                <div>
                    <label className="ml-2 text-2xl">Specimens</label>
                </div>
                <div className="bg-[#e8e8e8] mt-2 text-xl ">
                    <p className="ml-2">AnatomicStructure:</p>
                </div>

                <div className="text-center">
                    <h5 className="font-bold text-xl my-2">手動標記專區 (ANN/SEG) </h5>
                    <button className=" bg-gray-300 rounded-lg p-2.5 mr-2 " onClick={() => updateDrawType('Point')}><Icon icon="tabler:point-filled" className=""/></button>
                    <button className="bg-gray-300 rounded-lg p-2.5 mr-2" onClick={() => updateDrawType('LineString')}><Icon icon="material-symbols-light:polyline-outline" className=""/></button>
                    <button className="bg-gray-300 rounded-lg p-2.5 mr-2" onClick={() => updateDrawType('Polygon')}><Icon icon="ph:polygon" className=""/></button>
                    <button className="bg-gray-300 rounded-lg p-2.5 mr-2" onClick={() => updateDrawType('Circle')}><Icon icon="f7:rectangle" className="" /></button>
                    <button className="bg-gray-300 rounded-lg p-2.5 mr-2" onClick={() => updateDrawType('Ellipse')}><Icon icon="mdi:ellipse-outline" className=""/></button>
                </div>
                <div className="text-center">
                    <button className="bg-gray-300 rounded-lg p-2.5 mt-2" onClick={() => updateDrawType('Ellipse')}><Icon icon="bx:screenshot" className=""/></button>
                </div>

                <div className="text-center mt-3">
                    <h5 className="font-bold my-2 text-xl">模型輔助標記 </h5>
                    <button className="mx-2 bg-[#00c472] p-2 text-white rounded-3" onClick={() => updateDrawType('Point')}>啟動</button>
                    <button className=" mx-2 bg-[#d40000] p-2 text-white rounded-3" onClick={() => updateDrawType('LineString')}>關閉</button>
                    <button className="bg-[#0073ff] mx-2 p-2 text-white rounded-3" onClick={saveAnnotations}>儲存</button>
                </div>

            </div>
        </>
    );
}

export default MicroscopyViewer;