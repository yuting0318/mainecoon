import SearchPageHeader from "Components/SearchPageHeader";
import React from 'react';
// import TagArea from "./components/TagArea/TagArea";
import SearchArea from "./components/SearchArea/SearchArea";
import ImageWithReportArea from "./components/ImageWithReportArea/ImageWithReportArea";


const UseableBlank = () => {
    return <>
        {/*最外層*/}
        <div className="overflow-y-auto max-w-full border-2 h-full" style={{scrollbarWidth: 'none', '-ms-overflow-style': 'none'}}>
            <div className="flex h-full border-2 flex-cols-2">
                <SearchArea />
                <ImageWithReportArea />
            </div>
        </div>


    </>
}

const Main = () => {
    return <>
        <SearchPageHeader/>
        {/*下面操作區域*/}
        <UseableBlank/>
    </>
};

export default Main;
