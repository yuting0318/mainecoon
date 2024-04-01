import React from 'react';
import { SearchHeader } from "./components/SearchHeader";
import { SearchResultList } from "./components/SearchResultList";


const SearchArea = () => {
    return (
        <>
            {/*左邊底*/}
            <div className="flex flex-column border-r-2 w-96">
                {/*搜尋框*/}
                {/*<SearchPageHeader />*/}
                {/*搜尋結果*/}
                <SearchResultList />
            </div>
        </>
    );
};


export default SearchArea;
