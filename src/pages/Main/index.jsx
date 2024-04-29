import SearchPageHeader from "Components/SearchPageHeader";
import React, {useState} from 'react';
// import TagArea from "./components/TagArea/TagArea";
import SearchArea from "./components/SearchArea/SearchArea";
import ImageWithReportArea from "./components/ImageWithReportArea/ImageWithReportArea";


const UseableBlank = ({isShowMessage}) => {
    const [message, setMessage] = useState('');
    const [isShow, setIsShow] = useState(false);

    const handleMessageChange = (newMessage) => {
        setIsShow(newMessage);
    };
    const handleMessageChange2 = (newMessage) => {
        setIsShow(newMessage);
    };
    console.log('message', isShow)
    return <>
        {/*最外層*/}
        <div className="overflow-y-auto max-w-full border-2 h-full" style={{scrollbarWidth: 'none', '-ms-overflow-style': 'none'}}>
            <div className="flex h-full border-2 flex-cols-2">
                {!isShow && <SearchArea onMessageChange={handleMessageChange}/>}
                {/*<SearchArea onMessageChange={handleMessageChange}/>*/}
                {isShow && <ImageWithReportArea onMessageChange={handleMessageChange2}/>}
            </div>
        </div>


    </>
}

const Main = () => {
    const [isShow, setIsShow] = useState(false);
    const handleMessageChange = (message) => {
        setIsShow(message);
    };
    return <>
        {!isShow && <SearchPageHeader/>}
        {/*下面操作區域*/}
        <UseableBlank onMessageChange={handleMessageChange}/>
    </>
};

export default Main;
