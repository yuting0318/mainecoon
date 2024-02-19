import React from 'react';

import { SearchHeader } from "./components/SearchHeader";
import { SearchResultList } from "./components/SearchResultList";





const SearchArea = () => {
    return (
        <>
            {/*左邊底*/}
            <div className="bg-opacity-10 w-25 flex flex-column border-4">
                <SearchHeader />
                <SearchResultList />
            </div>
        </>
    );
};


export default SearchArea;
