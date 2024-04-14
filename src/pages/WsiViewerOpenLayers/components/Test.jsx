import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { XYZ, TileDebug } from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import { Projection } from 'ol/proj';
import { getCenter } from 'ol/extent';
import { MousePosition, defaults as defaultControls } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import TileGrid from 'ol/tilegrid/TileGrid';
import { useAppSelector } from "Hook";
import _ from "lodash";

const Test = (props) => {
    const viewerID = "viewerID";
    const studyInstanceUID = _.get(props, "studyInstanceUID");
    const seriesInstanceUID = _.get(props, "seriesInstanceUID");
    const mapRef = useRef(null);
    const pyramidSliceReducer = useAppSelector((state) => state.pyramidSliceReducer);
    const Instances = pyramidSliceReducer.smResult?.Instances;
    const annVectorLayers = pyramidSliceReducer.annotaionResults;

    console.log('Instances:', Instances);
    useEffect(() => {
        if (!Instances || Instances.length === 0) {
            console.error('No instances available.');
            return;
        }

        console.log("Instances", Instances);
        console.log('Instances available:', Instances.length);

        const biggestInstance = Instances[Instances.length - 1];
        if (!biggestInstance || !biggestInstance.metadata) {
            console.error('Biggest instance or metadata is undefined.');
            return;
        }

        console.log('Using biggest instance:', biggestInstance);

        const biggestInstanceMetadata = biggestInstance.metadata;
        const imageType = biggestInstanceMetadata["00080008"].Value;
        const isImplicitTileGrid = Instances.length > 1 || !imageType.includes('VOLUME');
        const totalPixelMatrixColumns = biggestInstanceMetadata["00480006"].Value[0];
        const totalPixelMatrixRows = biggestInstanceMetadata["00480007"].Value[0];
        const numberOfFrames = biggestInstanceMetadata["00280008"].Value[0];

        const extent = [0, 0, totalPixelMatrixColumns, totalPixelMatrixRows];
        console.log('Extent set:', extent);

        const projection = new Projection({
            code: 'DICOM',
            units: 'pixels',
            extent: extent
        });

        const tileGridConfig = isImplicitTileGrid ? {} : {
            tileGrid: new TileGrid({
                resolutions: Array.from({ length: Instances.length }, (_, i) => 2 ** i).reverse(),
                sizes: [new Array(2).fill(Math.ceil(Math.sqrt(numberOfFrames)))],
                extent,
                tileSize: [biggestInstanceMetadata["00280011"].Value[0], biggestInstanceMetadata["00280011"].Value[0]]
            })
        };

        console.log('Projection set:', projection.getCode());

        const map = new Map({
            target: 'map',
            controls: defaultControls().extend([
                new MousePosition({ coordinateFormat: createStringXY(4), projection: 'DICOM' })
            ]),
            layers: [
                new TileLayer({
                    source: new XYZ({
                        tileUrlFunction: ([z, x, y]) => {
                            console.log('Processing tile:', z, x, y);

                            const currentInstance = Instances[z];
                            if (!currentInstance) {
                                console.error('Current instance is undefined.');
                                return null;
                            }

                            console.log('Current instance metadata:', currentInstance.metadata);

                            const currentInstanceMetadata = currentInstance.metadata;
                            const widthImageCount = Math.ceil(currentInstanceMetadata["00480006"].Value[0] / currentInstanceMetadata["00280011"].Value[0]);
                            const index = x + y * widthImageCount;

                            console.log('Calculated index:', index);

                            const queryMode = _.get(currentInstance, "queryMode");
                            const frames = _.get(currentInstance, "Frames");

                            if (!frames || frames.length <= index) {
                                console.error('Frame data is incomplete or index is out of bounds.');
                                return null;
                            }

                            const specificFrameObject = _.get(frames, index);
                            if (!specificFrameObject) {
                                console.error('Specific frame object is undefined.');
                                return null;
                            }

                            const url = _.get(_.get(_.get(specificFrameObject, "url"), queryMode), "rendered");
                            console.log('Fetched URL:', url);

                            return url || ''; // Provide a fallback empty string
                        },
                        minZoom: 0,
                        maxZoom: Instances.length - 1,
                        projection,
                        ...tileGridConfig,
                        tileSize: [biggestInstanceMetadata["00280011"].Value[0], biggestInstanceMetadata["00280011"].Value[0]]
                    }),
                    extent,
                }),
                new TileLayer({
                    source: new TileDebug({
                        projection,
                        tileSize: [biggestInstanceMetadata["00280011"].Value[0], biggestInstanceMetadata["00280011"].Value[0]]
                    }),
                    extent,
                    minZoom: 0,
                    maxZoom: Instances.length - 1,
                    ...tileGridConfig
                })
            ],
            view: new View({
                center: getCenter(extent),
                extent,
                projection,
                zoom: 2
            })
        });

        console.log('Map initialized:', map);

        map.getView().fit(extent);

        // Cleanup on unmount
        return () => map.setTarget(undefined);
    }, [Instances]);


    return <div id="map" style={{ height: '100vh', width: '100vw' }} />;

};

export default Test;
