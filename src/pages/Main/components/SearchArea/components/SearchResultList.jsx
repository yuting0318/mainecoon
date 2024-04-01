import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";
import { updateQueryParameter, firstQuery, getNextTenResult } from "Slices/searchAreaSlice/searchAreaSlice";
import SearchResult from "./SearchResult";

const SearchResultList = () => {
    const searchResultListRef = useRef();

    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    const queryParameter = searchAreaReducer.parameter;
    const results = _.isEmpty(searchAreaReducer.results) ? [] : searchAreaReducer.results;
    const isNextQueryEmpty = searchAreaReducer.isNextQueryEmpty;

    const dispatch = useAppDispatch();

    function onScroll() {
        if (searchResultListRef.current) {
            const clientHeight = searchResultListRef.current.clientHeight;
            const scrollHeight = searchResultListRef.current.scrollHeight;
            const scrollTop = searchResultListRef.current.scrollTop;

            // 卷軸觸底行為
            if (scrollTop + clientHeight === scrollHeight) {
                // 下一階段查詢 不是空的才查詢
                if (!isNextQueryEmpty) {
                    dispatch(getNextTenResult(queryParameter));
                }
            }
        }
    }

    return (
        //  overflow-y-auto overflow-x-hidden
        <div className="flex-fill h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll} ref={searchResultListRef}
             style={{scrollbarWidth: 'none', '-ms-overflow-style': 'none'}}>
            {results.map((result) => (
                <SearchResult key={result.id} qidorsSingleStudy={result}/>
            ))}
        </div>
    );
};

export {SearchResultList};
