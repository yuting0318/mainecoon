import React, {useState} from 'react';
import {SearchResultList} from "./components/SearchResultList";


const SearchArea = ({ onMessageChange }) => {
    const [open,setOpen] = useState(false);
    const [pageLimit, setPageLimit] = useState(1);
    const handleMessageChange = (newMessage) => {
        onMessageChange(newMessage);
    };
    const handlePageChangeMessage = (e) => {
        setPageLimit(e.target.value)
    }
    return (
        <>
            <div className="flex flex-row w-full justify-center">
                <div className=" right-6 mt-2 absolute">
                    <input
                        type="number"
                        min="1"
                        className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg"
                        placeholder={"Page Limit"}
                        onChange={(e) => {
                            handlePageChangeMessage(e)
                        }}
                    />
                </div>
                <div className="flex flex-column border-2 w-full mt-12 mr-4 ml-4 mb-4 rounded-xl shadow-2xl">
                    {/*搜尋框*/}
                    {/* <SearchPageHeader /> */}
                    {/*搜尋結果*/}

                    <SearchResultList onMessageChange={handleMessageChange} pageChangeMessage={pageLimit}/>
                </div>
            </div>
        </>
    );
};


export default SearchArea;
