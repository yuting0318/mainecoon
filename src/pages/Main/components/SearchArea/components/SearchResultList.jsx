import React, {useRef} from 'react';
import {useAppDispatch, useAppSelector} from "Hook";
import _ from "lodash";
import {getNextTenResult} from "Slices/searchAreaSlice/searchAreaSlice";
import SearchResult from "./SearchResult";

const SearchResultList = ({onMessageChange}) => {
    const searchResultListRef = useRef();

    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    const queryParameter = searchAreaReducer.parameter;
    const results = _.isEmpty(searchAreaReducer.results) ? [] : searchAreaReducer.results;
    console.log('results*********************', results)
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

    const handleMessageChange = (newMessage) => {
        onMessageChange(newMessage);
    };

    return (
        //  overflow-y-auto overflow-x-hidden
        <div className="flex-fill h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll} ref={searchResultListRef}
             style={{scrollbarWidth: 'none', '-ms-overflow-style': 'none'}}>
            <div className="w-full">
                <table className="w-full mr-2 rounded-t-xl overflow-hidden">
                    <tr>
                        <td className="p-2 font-bold bg-green-300 rounded-lt-xl">PatientID</td>
                        <td className="p-2 font-bold bg-green-300">PatientName</td>
                        <td className="p-2 font-bold bg-green-300">PatientBirthDate</td>
                        <td className="p-2 font-bold bg-green-300">PatientSex</td>
                        <td className="p-2 font-bold bg-green-300">AccessionNumber</td>
                        <td className="p-2 font-bold bg-green-300">StudyDate</td>
                    </tr>
                        {results.map((result) => (
                                <SearchResult key={result.id} qidorsSingleStudy={result}
                                              onMessageChange={handleMessageChange}/>
                            )
                        )}
                </table>
            </div>
        </div>
    )
        ;
};

export {SearchResultList};
