import React, {useEffect, useRef, useState} from 'react';
import {useAppSelector} from "Hook";
import _ from "lodash";
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import {Icon} from '@iconify/react';
import Map from "ol/Map";
import View from "ol/View";
import LayerTile from "ol/layer/Tile";
import XYZ from 'ol/source/XYZ';
import {Draw} from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {Projection} from 'ol/proj';
import MousePosition from 'ol/control/MousePosition';
import {createStringXY} from 'ol/coordinate';
import {getCenter} from 'ol/extent';
import Point from 'ol/geom/Point';
import LineString from 'ol/geom/LineString';
import {toast} from 'react-toastify';
import Circle from 'ol/geom/Circle';
import {QIDO_RS_Response} from "Slices/searchAreaSlice/components/enums/QIDO_RS_Response";
import {querySeries} from "Slices/imageWithReportSlice/imageWithReportSlice";

function calculateExtremityPoints(coordinates) {
    const points = coordinates.map(coord => coord.replace(/[()]/g, '').split(',').map(Number));

    // Encapsulated helper function to estimate the center of the ellipse
    function estimateCenter(points) {
        let sumX = 0, sumY = 0;

        points.forEach(point => {
            sumX += point[0];
            sumY += point[1];
        });

        return [sumX / points.length, sumY / points.length];
    }

    // Encapsulated helper function to calculate the distance between two points
    function distance(point1, point2) {
        return Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);
    }

    // Estimate the center of the ellipse
    const center = estimateCenter(points);

    // Find the farthest and closest points to the center to estimate the axes
    let maxDist = 0;
    let minDist = Infinity;
    points.forEach(point => {
        const dist = distance(center, point);
        if (dist > maxDist) maxDist = dist;
        if (dist < minDist) minDist = dist;
    });

    // Assuming the farthest point approximates the semi-major axis
    // and the closest point approximates the semi-minor axis
    const semiMajorAxisLength = maxDist;
    const semiMinorAxisLength = minDist;

    // Calculate extremity points without considering rotation
    // A more complex fitting method would be required to handle rotation properly
    const extremities = {
        majorAxis: [[center[0] - semiMajorAxisLength, center[1]], [center[0] + semiMajorAxisLength, center[1]]],
        minorAxis: [[center[0], center[1] - semiMinorAxisLength], [center[0], center[1] + semiMinorAxisLength]]
    };

    return [...extremities.majorAxis, ...extremities.minorAxis].map(point => `(${point[0]}, ${point[1]})`);
}

function MicroscopyViewer(props) {
    const viewerID = "viewerID";
    const studyInstanceUID = _.get(props, "studyInstanceUID");
    const seriesInstanceUID = _.get(props, "seriesInstanceUID");

    const pyramidSliceReducer = useAppSelector((state) => state.pyramidSliceReducer);
    const Instances = pyramidSliceReducer.smResult?.Instances;
    const annVectorLayers = pyramidSliceReducer.annotaionResults;

    const [drawType, setDrawType] = useState('Point');
    const mapRef = useRef(null);
    const sourceRef = useRef(new VectorSource({wrapX: false}));
    const [isDrawingEllipse, setIsDrawingEllipse] = useState(false);
    const [ellipseCenter, setEllipseCenter] = useState(null);
    const [ellipsePreview, setEllipsePreview] = useState(null);
    const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
    const [rectangleCenter, setRectangleCenter] = useState(null);
    const [rectanglePreview, setRectanglePreview] = useState(null);

    const savedEllipsesSourceRef = useRef(new VectorSource({wrapX: false}));
    const savedRectangleSourceRef = useRef(new VectorSource({wrapX: false}));
    const drawInteractionRef = useRef(null);

    const [isOpen, setIsOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);


    const [newAnnSeries, setNewAnnSeries] = useState(false);
    const [newAnnAccession, setNewAnnAccession] = useState(false);
    const [accessionNumber, setAccessionNumber] = useState('');

    // Keeps of the order in which shapes are drawn
    const drawnShapesStack = useRef([]);

    const LeftDrawer = () => {
        setIsOpen(!isOpen);
    };

    const RightDrawer = () => {
        setIsRightOpen(!isRightOpen);
    };

    useEffect(() => {
        const minLevel = 0;
        const maxLevel = _.size(Instances) - 1;
        const bigestInstance = _.last(Instances);
        const bigestInstanceMetadata = _.get(bigestInstance, "metadata");
        const totalPixelMatrixColumns = _.first(_.get(_.get(bigestInstanceMetadata, "00480006"), "Value"));
        const totalPixelMatrixRows = _.first(_.get(_.get(bigestInstanceMetadata, "00480007"), "Value"));
        const extent = [0, 0, totalPixelMatrixColumns, totalPixelMatrixRows];

        console.log('minLevel',minLevel)
        console.log('maxLevel',maxLevel)
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
                console.log('x,y,z',x,y,z)
                const currentInstance = Instances[z]; // 當前的 Instance
                const currentInstanceMetadata = _.get(currentInstance, "metadata"); // 當前 Instance 的 Metadata

                const currentInstanceTotalPixelMatrixColumns = _.first(_.get(_.get(currentInstanceMetadata, "00480006"), "Value")); // 00480006 總寬 TotalPixelMatrixColumns
                const currentInstanceSingleImageWidth = _.first(_.get(_.get(currentInstanceMetadata, "00280011"), "Value")); // 每張小圖的寬
                const widthImageCount = Math.ceil(currentInstanceTotalPixelMatrixColumns / currentInstanceSingleImageWidth); // 寬度部分要擺多少張
                const index = x + y * widthImageCount // 計算 Index
                console.log('index',index)

                console.log('currentInstanceTotalPixelMatrixColumns',currentInstanceTotalPixelMatrixColumns)

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
        const savedRectangleLayer = new VectorLayer({
            source: savedRectangleSourceRef.current,
        });
        const wsiLayer = new LayerTile({source: wsiSourceXYZ, extent: extent});

        const view = new View({
            center: getCenter(extent),
            zoom: 2,
            minZoom: minLevel,
            maxZoom: maxLevel,
            projection: dicomProjection,
            extent: extent,
        });

        const vector = new VectorLayer({source: sourceRef.current});
        const layers = [wsiLayer, ...annVectorLayers, vector, savedEllipsesLayer, savedRectangleLayer];
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
                    setEllipseCenter(null);
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
            drawnShapesStack.current.push('ELLIPSE');
            ellipsePreview.setGeometry(null); // 清除預覽圖層中的橢圓
            sourceRef.current.removeFeature(ellipsePreview); // 從原來的圖層中移除
            setEllipsePreview(null); // 重置預覽Feature
        }
    }, [isDrawingEllipse, ellipseCenter]);

    useEffect(() => {
        // 如果正在绘制椭圆，添加事件监听
        if (isDrawingRectangle) {
            const newRectanglePreview = new Feature();
            setRectanglePreview(newRectanglePreview);
            sourceRef.current.addFeature(newRectanglePreview);
            const clickHandler = (event) => {
                if (!rectangleCenter) {
                    setRectangleCenter(event.coordinate);
                } else {
                    const radiusX = calculateRadius(event.coordinate, rectangleCenter);
                    const radiusY = radiusX / 2; // 假设Y轴半径为X轴的一半
                    const rectangleCoords = createRectangle(rectangleCenter, radiusX, radiusY);
                    newRectanglePreview.setGeometry(new Polygon([rectangleCoords]));
                    setIsDrawingRectangle(false); // 结束绘制
                    setRectangleCenter(null); // 重置中心
                }
            };

            const moveHandler = (event) => {
                if (rectangleCenter) {
                    const radiusX = calculateRadius(event.coordinate, rectangleCenter);
                    const radiusY = radiusX / 2; // 同上
                    const rectangleCoords = createRectangle(rectangleCenter, radiusX, radiusY);
                    newRectanglePreview.setGeometry(new Polygon([rectangleCoords]));
                }
            };

            mapRef.current.on('singleclick', clickHandler);
            mapRef.current.on('pointermove', moveHandler);

            return () => {
                mapRef.current.un('singleclick', clickHandler);
                mapRef.current.un('pointermove', moveHandler);
                sourceRef.current.removeFeature(newRectanglePreview);
            };
        }
        if (!isDrawingRectangle && rectanglePreview) {
            savedRectangleSourceRef.current.addFeature(new Feature(rectanglePreview.getGeometry())); // 將橢圓添加到保存圖層
            drawnShapesStack.current.push('RECTANGLE');
            rectanglePreview.setGeometry(null); // 清除預覽圖層中的橢圓
            sourceRef.current.removeFeature(rectanglePreview); // 從原來的圖層中移除
            setRectanglePreview(null); // 重置預覽Feature
        }
    }, [isDrawingRectangle, rectangleCenter]);

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
        } else if (isDrawingRectangle) {
            setIsDrawingRectangle(false);
            if (rectanglePreview) {
                rectanglePreview.setGeometry(null);
                sourceRef.current.removeFeature(rectanglePreview);
                setRectanglePreview(null);
            }
            setRectangleCenter(null);
        }

        // 移除当前的绘图交互（如果存在）
        if (drawInteractionRef.current) {
            mapRef.current.removeInteraction(drawInteractionRef.current);
            drawInteractionRef.current = null;
        }

        // 对于椭圆，设置相关状态以启用特殊的椭圆绘图逻辑
        if (type === 'Ellipse') {
            setIsDrawingEllipse(true);
        } else if (type === 'Rectangle') {
            setIsDrawingRectangle(true);
        } else {
            // 为其他绘图类型创建 Draw 交互
            const drawInteraction = new Draw({
                source: sourceRef.current,
                type: type, // 使用选定的绘图类型
                // 可以在此处添加其他 Draw 交互的配置
            });

            // 添加新的绘图交互到地图上
            mapRef.current.addInteraction(drawInteraction);
            drawnShapesStack.current.push(type);
            drawInteractionRef.current = drawInteraction;
        }
    };

    function createEllipse1(center, radiusX, radiusY, rotation = 0, sides = 50) {
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

    function undoFeature() {
        let features = sourceRef.current.getFeatures();
        switch (drawnShapesStack.current.pop()) {
            case 'ELLIPSE':
                features = savedEllipsesSourceRef.current.getFeatures();
                if (features.length > 0) {
                    const lastFeature = features[features.length - 1];
                    savedEllipsesSourceRef.current.removeFeature(lastFeature);
                }
                break;
            case 'RECTANGLE':
                features = savedRectangleSourceRef.current.getFeatures();
                if (features.length > 0) {
                    const lastFeature = features[features.length - 1];
                    savedRectangleSourceRef.current.removeFeature(lastFeature);
                }
                break;
            default:
                if (features.length > 0) {
                    const lastFeature = features[features.length - 1];
                    sourceRef.current.removeFeature(lastFeature);
                }
        }
    }

    function calculateRadius(coord1, coord2) {
        return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
    }

    function createRectangle(center, width, height, rotation = 0) {
        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let cosRotation = Math.cos(rotation);
        let sinRotation = Math.sin(rotation);

        let topLeft = [
            center[0] - halfWidth * cosRotation - halfHeight * sinRotation,
            center[1] - halfWidth * sinRotation + halfHeight * cosRotation
        ];

        let topRight = [
            center[0] + halfWidth * cosRotation - halfHeight * sinRotation,
            center[1] + halfWidth * sinRotation + halfHeight * cosRotation
        ];

        let bottomRight = [
            center[0] + halfWidth * cosRotation + halfHeight * sinRotation,
            center[1] + halfWidth * sinRotation - halfHeight * cosRotation
        ];

        let bottomLeft = [
            center[0] - halfWidth * cosRotation + halfHeight * sinRotation,
            center[1] - halfWidth * sinRotation - halfHeight * cosRotation
        ];

        return [topLeft, topRight, bottomRight, bottomLeft]; // 確保長方形閉合
    }


    // Define formatCoordinate function
    const formatCoordinate = (coord) => {
        return `(${coord[0].toFixed(1)}, ${coord[1].toFixed(1)})`;
    };


    function createEllipse(center, semiMajor, semiMinor, rotation = 0, sides = 50) {
        let angleStep = (2 * Math.PI) / sides;
        let coords = [];

        for (let i = 0; i < sides; i++) {
            let angle = i * angleStep;
            let x = center[0] + semiMajor * Math.cos(angle) * Math.cos(rotation) - semiMinor * Math.sin(angle) * Math.sin(rotation);
            let y = center[1] + semiMajor * Math.cos(angle) * Math.sin(rotation) + semiMinor * Math.sin(angle) * Math.cos(rotation);
            coords.push([x, y]);
        }
        coords.push(coords[0]); // Ensure the ellipse is closed

        return coords;
    }

    const saveAnnotations = () => {
        const features = sourceRef.current.getFeatures();

        function CustomShape(type, feature) {
            this.type = type;
            this.feature = feature;
        }

        const rectanglesFeatures = savedRectangleSourceRef.current.getFeatures();
        features.push(...rectanglesFeatures.map(feature => new CustomShape('RECTANGLE', feature)));

        const ellipsesFeatures = savedEllipsesSourceRef.current.getFeatures();
        features.push(...ellipsesFeatures.map(feature => new CustomShape('ELLIPSE', feature)));

        // 转换为JSON格式
        const savedAnnotations = features.map(feature => {
            let type = null;
            let coordinates = [];

            if (feature instanceof CustomShape) {
                type = feature.type;
                feature = feature.feature;
            }

            // 获取几何类型和坐标
            const geometry = feature.getGeometry();
            if (geometry instanceof Point) {
                type = "POINT";
                coordinates.push(formatCoordinate(geometry.getCoordinates()));
            } else if (geometry instanceof Polygon) {
                type ??= "POLYGON";
                coordinates = geometry.getCoordinates()[0].map(coord => formatCoordinate(coord));
                if (type === 'ELLIPSE') {
                    coordinates = calculateExtremityPoints(coordinates);
                }
            } else if (geometry instanceof LineString) {
                type = "POLYLINE";
                coordinates = geometry.getCoordinates().map(coord => formatCoordinate(coord));
            }

            return {type, coordinates};
        });

        const groupedAnnotations = Object.values(savedAnnotations.reduce((acc, curr) => {
            if (acc[curr.type]) {
                acc[curr.type].coordinates = acc[curr.type].coordinates.concat(curr.coordinates);
            } else {
                acc[curr.type] = {type: curr.type, coordinates: curr.coordinates};
            }
            return acc;
        }, {}));

        console.log('Grouped Annotations:', groupedAnnotations);

        function extractStudyAndSeriesIdsFromUrl(url) {
            const regex = /\/WSIViewerOpenLayers\/([^/]+)\/([^/]+)/;
            const matches = url.match(regex);
            if (matches && matches.length === 3) {
                return {
                    studyId: matches[1],
                    seriesId: matches[2]
                };
            } else {
                return null;
            }
        }


        const currentUrl = window.location.href;
        const ids = extractStudyAndSeriesIdsFromUrl(currentUrl);
        if (ids) {
            const studyId = ids.studyId;
            const seriesId = ids.seriesId;
            const formattedData = {
                NewAnnSeries: newAnnSeries ? "true" : "false",
                OldAnnSeriesOID: seriesId,
                NewAnnAccession: newAnnAccession ? "true" : "false",
                AccessionNumber: accessionNumber,
                data: savedAnnotations.map(annotation => annotation) // 原有的轉換邏輯
            };

            console.log('Formatted Data:', formattedData);
            //使用 formattedData 作為請求體
            fetch(`http://localhost:3251/api/SaveAnnData/studies/${studyId}/series/${seriesId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                        toast.error("發生未知錯誤")
                    }
                    toast.success("上傳成功")
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                    return response.json();
                })
                .then(data => {
                    console.log('API response:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            console.error("Failed to extract study and series IDs from URL");
            toast.error("發生未知錯誤")
        }

    };

    const [isActive, setIsActive] = useState(false);
    const handleToggle = (e) => {
        setIsActive(!isActive);
        // 在這裡執行更多操作，如發送請求等
    };

    const toggleSwitch = () => {
        setNewAnnSeries(!newAnnSeries);
    };


    const toggleSwitch1 = () => {
        setNewAnnAccession(!newAnnAccession);
    };


    useEffect(() => {
        // 获取当前页面的 URL
        const url = window.location.href;

        // 获取最后一个斜杠后面的内容
        const lastSlashIndex = url.lastIndexOf('/');
        const extractedContent = url.substring(lastSlashIndex + 1);

        // 打印提取的内容到控制台
        console.log(extractedContent);
    }, []);

    const [data, setData] = useState([]);
    // 確認studyInstanceUID是否有值(問!!!!!!!!!!!!!!!)
    const fetchDetails = async() => {
        try{
            const response = await fetch(`https://ditto.dicom.tw/dicom-web/studies?ModalitiesInStudy=SM&StudyInstanceUID=${studyInstanceUID}`);
            const data = await response.json();
            setData(data)
            console.log('data02313',data);console.log('data[0].0020000D',data[0]["00080020"].Value[0])
        }catch (e) {
            console.log('error',e)
        }
    }

    useEffect(() => {
        fetchDetails();
    }, []);

    function getQidorsSingleStudyMetadataValue(data, metadataTag, defaultValue) {
        return _.get(data, metadataTag) ? _.get(data, metadataTag).Value[0] : defaultValue;
        // return _.isUndefined(_.first(_.get(data, metadataTag).Value[0])) ? defaultValue : _.first(_.get(data, metadataTag).Value[0]);
        console.log('data',data)
        // console.log('metadataTag',metadataTag)
        // console.log('defaultValue',defaultValue)
    }
    const patientID= getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientID, "PatientID NotFound");
    const patientName = _.get(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientName, "PatientName NotFound"), "Alphabetic");
    const patientBirthDate= formatDate(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientBirthDate, "PatientBirthDate NotFound"));
    const patientSex= getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientSex, "PatientSex NotFound");
    const accessionNumber2= getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.AccessionNumber, "AccessionNumber NotFound");
    const studyDate= formatDate(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyDate, "StudyDate NotFound"));
    const StudyTime= formatTime(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyTime, "StudyTime NotFound"));

    // console.log("patientID", patientID)
    // console.log("patientName", patientName)
    // console.log("patientBirthDate", formatDate(patientBirthDate))
    // console.log("patientSex", patientSex)
    // console.log("accessionNumber", accessionNumber2)
    // console.log("studyDate", formatDate(studyDate))
    // console.log("StudyTime", formatTime(StudyTime))

    function formatDate(inputDate) {
        const year = inputDate.substring(0, 4);
        const month = inputDate.substring(4, 6);
        const day = inputDate.substring(6, 8);
        return `${year}-${month}-${day}`;
    }
    function formatTime(inputTime) {
        const hours = inputTime.substring(0, 2);
        const minutes = inputTime.substring(2, 4);
        const seconds = inputTime.substring(4, 6);
        return `${hours}:${minutes}:${seconds}`;
    }


    return (
        <>
            {isOpen ? (
                <>
                    <div className="flex flex-row w-96">
                        <div className={`flex flex-column w-full border-end`}>
                            <div className="bg-opacity-100 flex justify-end items-end z-30 mt-2">
                                <button
                                    className="flex items-center bg-green-400 hover:bg-green-600 text-white font-bold rounded-l-lg p-3"
                                    onClick={LeftDrawer}>
                                    {'<<'}
                                </button>
                            </div>
                            <div className="flex flex-row items-center bg-green-300 mt-6">
                                <label className="ml-5 text-2xl mt-2 font-bold font-sans mb-2 ">
                                    Patient
                                </label> <Icon icon="bi:people-circle" width="28" height="28" className="ml-3 text-white"/>
                            </div>
                            <div className="bg-green-50">
                                <div className="p-1.5">
                                    {/*00100020,LO => 123456*/}
                                    <span className="block ml-2 text-lg mt-2 "><span
                                        className="font-bold">ID : </span>{patientID}</span>
                                    {/*00100010,PN => Philips^Amy*/}
                                    <span className="block ml-2 text-lg mt-2"><span
                                        className="font-bold">Name : </span>{patientName}</span>
                                    {/*00100040,CS => O*/}
                                    <span className="block ml-2 text-lg mt-2"><span
                                        className="font-bold">Gender : </span>{patientSex}</span>
                                    {/*00100030,DA => 20010101*/}
                                    <span className="block ml-2 text-lg mt-2 mb-4"><span className="font-bold">Birthday : </span>{patientBirthDate}</span>
                                </div>
                            </div>
                            <div className="flex flex-row items-center bg-green-300 mt-6">
                                <label className="ml-5 text-2xl mt-2 font-bold font-sans mb-2 ">Case</label>
                                <Icon icon="fluent:document-data-16-filled" width="28" height="28" className="ml-3 text-white"/>
                            </div>
                            <div className="bg-green-50">
                                <div className="p-1.5">
                                    {/*00080050,SH => D18-1001*/}
                                    <span className="block ml-2 text-lg mt-2"><span
                                        className="font-bold">Accession : </span>{accessionNumber2}</span>
                                    <span className="block ml-2 text-lg mt-2"><span
                                        className="font-bold">ID : </span></span>
                                    {/*00080020,DA => 20181003 */}
                                    <span className="block ml-2 text-lg mt-2"><span
                                        className="font-bold">Date : </span>{studyDate}</span>
                                    <span className="block ml-2 text-lg mt-2 mb-4"><span
                                        className="font-bold">Time : </span>{StudyTime}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-opacity-0 flex justify-start items-center z-30 mt-2">
                    <button
                        className="flex items-center bg-green-400 hover:bg-green-600 text-white font-bold rounded-r-lg px-2 py-5"
                        onClick={LeftDrawer}>
                        {'>'}
                    </button>
                </div>

            )}

            <div className="w-100 h-100 flex text-center border-4 border-red-500" id={viewerID}></div>
            {isRightOpen ? (
                <div className="flex flex-row w-96">

                    <div className="flex flex-column w-full border-start">

                        <div className="bg-opacity-100 flex justify-start items-end mt-2">
                            <button
                                className="flex items-center bg-green-400 hover:bg-green-600 text-white font-bold rounded-r-lg p-3"
                                onClick={RightDrawer}>
                                {'>>'}
                            </button>

                        </div>
                        <div className="mt-2">
                            <label className="ml-2 text-2xl ">SlideLabel</label>
                        </div>
                        <div className="bg-[#e8e8e8] mt-2">
                            <label className="block flex items-center ml-2 text-xl mt-2">LabelText</label>
                            <p className="block ml-2 text-xl">BarcodeValue:</p>
                        </div>
                        <div>
                            <label className="ml-2 text-2xl">Specimens</label>
                        </div>
                        <div className="bg-[#e8e8e8] mt-2 text-xl ">
                            <p className="ml-2">AnatomicStructure:</p>
                        </div>

                        <div className="flex items-center ml-1 mt-3">

                            <button
                                className={`relative w-14 h-8 bg-gray-300 rounded-full focus:outline-none transition-colors duration-300 ${
                                    newAnnSeries ? 'bg-green-400' : 'bg-gray-300'
                                }`}
                                onClick={toggleSwitch}
                            >
                            <span
                                className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                    newAnnSeries ? 'translate-x-full' : ''}`}/>
                            </button>
                            {/*<span className="ml-2 text-gray-600">{newAnnSeries ? 'ON' : 'OFF'}</span>*/}
                            <label className="ml-3 text-2xl " >NewAnnSeries</label>

                        </div>
                        <div className="ml-1">

                            <button
                                className={`relative w-14 h-8 bg-gray-300 rounded-full focus:outline-none transition-colors duration-300 ${
                                    newAnnAccession ? 'bg-green-400' : 'bg-gray-300'
                                }`}
                                onClick={toggleSwitch1}
                            >
                            <span
                                className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                    newAnnAccession ? 'translate-x-full' : ''}`}/>
                            </button>
                            {/*<span className="ml-2 text-gray-600">{newAnnAccession ? 'ON' : 'OFF'}</span>*/}
                            <label  className="ml-3 text-2xl ">NewAnnAccession</label>

                            {newAnnAccession && (
                                <input
                                    type="text"
                                    placeholder="Accession Number"
                                    value={accessionNumber}
                                    className="rounded-lg border border-gray-300 p-2 w-60 ml-2 mt-1.5"
                                    onChange={(e) => setAccessionNumber(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="text-center mt-2">
                            <h5 className="font-bold text-xl my-2">手動標記專區 (ANN/SEG) </h5>
                            <button className=" bg-gray-300 rounded-lg p-2.5 mr-2 "
                                    onClick={() => updateDrawType('Point')}>
                                <Icon icon="tabler:point-filled" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('LineString')}>
                                <Icon icon="material-symbols-light:polyline-outline" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('Polygon')}>
                                <Icon icon="ph:polygon" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('Rectangle')}>
                                <Icon icon="f7:rectangle" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('Ellipse')}>
                                <Icon icon="mdi:ellipse-outline" className=""/></button>
                        </div>


                        <div className="flex justify-evenly">
                            <button className="bg-[#0073ff] w-20 justify-center flex mt-2 mx-2 p-2 text-white rounded-3"
                                    onClick={saveAnnotations}>儲存標記
                            </button>

                            <button
                                className="bg-[#0073ff] w-20 justify-center flex mt-2 mx-2 p-2 text-white rounded-3"
                                onClick={undoFeature}
                            >復原
                            </button>
                            {/* TODO */}
                            {/*<button*/}
                            {/*    className="bg-[#0073ff] w-20 justify-center flex mt-2 mx-2 p-2 text-white rounded-3">取消復原*/}
                            {/*</button>*/}
                        </div>

                        {/*<div className="text-center">*/}
                        {/*    <button className="bg-gray-300 rounded-lg p-2.5 mt-2"*/}
                        {/*            onClick={() => updateDrawType('Ellipse')}>*/}
                        {/*        <Icon icon="bx:screenshot" className=""/></button>*/}
                        {/*</div>*/}

                        {/*<div className="text-center mt-3">*/}
                        {/*    <h5 className="font-bold my-2 text-xl">模型輔助標記 </h5>*/}
                        {/*    <button className="mx-2 bg-[#00c472] p-2 text-white rounded-3"*/}
                        {/*            onClick={() => updateDrawType('Point')}>啟動*/}
                        {/*    </button>*/}
                        {/*    <button className=" mx-2 bg-[#d40000] p-2 text-white rounded-3"*/}
                        {/*            onClick={() => updateDrawType('LineString')}>關閉*/}
                        {/*    </button>*/}
                        {/*    <button className="bg-[#0073ff] mx-2 p-2 text-white rounded-3" onClick={saveAnnotations}>儲存*/}
                        {/*    </button>*/}
                        {/*</div>*/}


                    </div>
                </div>
            ) : (
                <>
                    <div className="bg-opacity-0 flex flex-column justify-start items-end mt-60 gap-10">
                        <div className="bg-opacity-0 flex">
                            <button
                                className="flex items-center bg-green-400 hover:bg-green-600 text-white font-bold rounded-l-lg px-2 py-5"
                                onClick={RightDrawer}>
                                {'<'}
                            </button>
                        </div>
                        <div className="flex flex-column mb-5 gap-2">
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2 "
                                    onClick={() => updateDrawType('POINT')}>
                                <Icon icon="tabler:point-filled" className=""/>
                            </button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('POLYLINE')}>
                                <Icon icon="material-symbols-light:polyline-outline" className=""/>
                            </button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('POLYGON')}>
                                <Icon icon="ph:polygon" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('RECTANGLE')}>
                                <Icon icon="f7:rectangle" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2 "
                                    onClick={() => updateDrawType('ELLIPSE')}>
                                <Icon icon="mdi:ellipse-outline" className=""/></button>
                            <button className="bg-gray-300 rounded-lg p-2.5 mr-2"
                                    onClick={() => updateDrawType('ELLIPSE')}>
                                <Icon icon="bx:screenshot" className=""/></button>
                        </div>
                    </div>
                </>
            )}

        </>
    )
        ;
}

export default MicroscopyViewer;