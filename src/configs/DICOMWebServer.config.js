// 連接自己的DICOMWebServer

// module.exports = {
//     // QIDO: {
//     //     enableHTTPS: true,
//     //     hostname: "ditto.dicom.tw",
//     //     port: "",
//     //     pathname: "/dicom-web",
//     //     Token: null
//     // },
//     // WADO: {
//     //     enableHTTPS: true,
//     //     hostname: "ditto.dicom.tw",
//     //     port: "",
//     //     URI_pathname: "/dicom-web/wado",
//     //     RS_pathname: "/dicom-web",
//     //     Mode: "rs",
//     //     Token: null
//     // }
// }\


// 連接J4Care的DICOMWebServer
module.exports = {
    QIDO: {
        enableHTTPS: true,
        hostname: "development.j4care.com",
        port: "11443",
        pathname: "/dcm4chee-arc/aets/DCM4CHEE/rs",
        Token: null,
    },
    WADO: {
        enableHTTPS: true,
        // hostname: "ditto.dicom.tw",
        hostname: "development.j4care.com",
        port: "11443",
        URI_pathname: "/dcm4chee-arc/aets/DCM4CHEE/rs",
        RS_pathname: "/dcm4chee-arc/aets/DCM4CHEE/rs",
        Mode: "rs",
        Token: null,
    },
};
