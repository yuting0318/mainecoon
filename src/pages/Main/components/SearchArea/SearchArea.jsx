import React, {useState} from 'react';
import {SearchResultList} from "./components/SearchResultList";


const SearchArea = ({ onMessageChange }) => {
    const [open,setOpen] = useState(false);
    const handleMessageChange = (newMessage) => {
        onMessageChange(newMessage);
    };
    return (
        <>
            {/*左邊底*/}
            <div className="flex flex-row w-full justify-center">
                <div className="flex flex-column border-2 w-full m-4 rounded-xl shadow-2xl">
                    {/*搜尋框*/}
                    {/* <SearchPageHeader /> */}
                    {/*搜尋結果*/}

                    <SearchResultList onMessageChange={handleMessageChange}/>
                </div>
            </div>
        </>
    );
};


export default SearchArea;
