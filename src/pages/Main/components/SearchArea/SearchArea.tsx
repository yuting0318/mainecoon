import React from 'react';

import { SearchHeader } from "./components/SearchHeader";
import { SearchResultList } from "./components/SearchResultList";





const SearchArea = () => {
    return (
        <>
            {/*左邊底*/}
            <div className="bg-opacity-75 w-25 flex flex-column border-2">
                {/*搜尋框*/}
                <SearchHeader />
                {/*搜尋結果*/}
                <SearchResultList />
            </div>
        </>
    );
};


export default SearchArea;
