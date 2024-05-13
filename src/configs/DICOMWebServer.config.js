module.exports = {
    QIDO: {
        enableHTTPS: true,
        hostname: "ditto.dicom.tw",
        port: "",
        pathname: "/dicom-web",
        Token: null
    },
    WADO: {
        enableHTTPS: true,
        hostname: "ditto.dicom.tw",
        port: "",
        URI_pathname: "/wado",
        RS_pathname: "/dicom-web",
        Mode: "rs",
        Token: null
    }
}


// 連接J4Care的DICOMWebServer
// module.exports = {
//     QIDO: {
//         enableHTTPS: true,
//         hostname: "development.j4care.com",
//         port: "11443",
//         pathname: "/dcm4chee-arc/aets/DCM4CHEE/rs",
//         Token: null,
//     },
//     WADO: {
//         enableHTTPS: true,
//         // hostname: "ditto.dicom.tw",
//         hostname: "development.j4care.com",
//         port: "11443",
//         URI_pathname: "/dcm4chee-arc/aets/DCM4CHEE/rs",
//         RS_pathname: "/dcm4chee-arc/aets/DCM4CHEE/rs",
//         Mode: "rs",
//         Token: null,
//     },
// };

// 連接Google PACS的DICOMWebServer
// module.exports = {
//     QIDO: {
//         enableHTTPS: true,
//         hostname: "dicomwebproxy-bqmq3usc3a-uc.a.run.app",
//         port: "",
//         pathname: "dicomWeb",
//         Token: null,
//     },
//     WADO: {
//         enableHTTPS: true,
//         hostname: "dicomwebproxy-bqmq3usc3a-uc.a.run.app",
//         port: "",
//         URI_pathname: "dicomWeb",
//         RS_pathname: "dicomWeb",
//         Mode: "rs",
//         Token: null,
//     },
// };