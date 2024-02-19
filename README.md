# **Mainecoon Web-based Digital Pathology Viewer**

Mainecoon 是一個基於 Web 的數位病理切片檢視器。

## Install

- clone mainecoon project
    
    ```jsx
    git clone https://gitlab.dicom.tw/ditto/mainecoon_v2.git
    
    cd mainecoon_v2
    ```
    

### Config

- DICOMWeb Config
    - 到 /src/configs/DICOMWebServer.config.js.template 複製一份檔案並修改 Config
    
    ```jsx
    module.exports = {
        QIDO: {
            enableHTTPS: false,
            hostname: "test.dicom.tw",      // PACS address 
            port: "443",                    // PAC address port
            pathname: "/dicomwebqido",      // PACS dicomweb api
            Token: "jf9403vunt140fny4r981fnyr" || null
        },
        WADO: {
            enableHTTPS: false,
            hostname: "test.dicom.tw",      // PACS address 
            port: "443",                    // PAC address port
            RUI_pathname: "/dicomwadouri",  // PACS dicomweb api
            RS_pathname: "/dicomwebwado",   // PACS dicomweb api
            Mode: "rs" || "uri",            // 保留 rs 即可
            Token: "3u902jvtur40h1fcyr48392fjy349r" || null
        }
    }
    
    // Token 保留 null 即可
    ```
    - 複製 config.js.raccoon.template 成 config.js

- FHIR Server Base URL Config
    - src/slices/imageWithReportSlice/imageWithReportSlice.ts
    
    ```jsx
    const fhirServerBaseURL: string = "http://localhost:8080/fhir"; // FHIR server address
    ```
    
- 找到有 const layers = [wsiLayer, debugLayer, ...annVectorLayers, vector]; 的檔案
    
    ```jsx
    const layers = [wsiLayer, debugLayer, ...annVectorLayers, vector]; // 刪除 debugLayer
    ```
    
- 安裝 nodejs 套件
    
    ```bash
    npm install
    
    npm run build
    
    npm run dev
    ```