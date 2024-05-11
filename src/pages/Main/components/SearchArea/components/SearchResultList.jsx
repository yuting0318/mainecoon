import React, {useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from "Hook";
import _ from "lodash";
import {firstQuery, getNextTenResult, updateQueryParameter} from "Slices/searchAreaSlice/searchAreaSlice";
import SearchResult from "./SearchResult";

const SearchResultList = ({onMessageChange,pageChangeMessage}) => {
    const searchResultListRef = useRef();
    const dispatch = useAppDispatch();
    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    console.log('searchAreaReducer', searchAreaReducer)
    const queryParameter = searchAreaReducer.parameter;
    const results = _.isEmpty(searchAreaReducer.results) ? [] : searchAreaReducer.results;
    console.log('results*********************', results)
    const isNextQueryEmpty = searchAreaReducer.isNextQueryEmpty;


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

    const [update, setUpdate] = useState(false);
    const [limit, setLimit] = useState(1);

    useEffect(() => {
        setLimit(pageChangeMessage)
        setUpdate(dispatch(updateQueryParameter({...searchAreaReducer.parameter, limit: pageChangeMessage})))
    },[pageChangeMessage])

    useEffect(() => {
        dispatch(firstQuery(queryParameter));
    }, [update])

    return (
        <>

            <div className="flex-fill h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll}
                 ref={searchResultListRef}
                 style={{scrollbarWidth: 'thin', '-ms-overflow-style': 'none'}}>
                <div className="w-full">
                    <table className="w-full mr-2 rounded-t-xl overflow-hidden">
                        <tr className="h-12">
                            <td className="p-2 font-bold bg-green-400 rounded-lt-xl text-white">PatientID</td>
                            <td className="p-2 font-bold bg-green-400 text-white">Name</td>
                            <td className="p-2 font-bold bg-green-400 text-white">BirthDate</td>
                            <td className="p-2 font-bold bg-green-400 text-white">Sex</td>
                            <td className="p-2 font-bold bg-green-400 text-white">Accession Number</td>
                            <td className="p-2 font-bold bg-green-400 text-white">Study Date</td>
                            <td className="p-2 font-bold bg-green-400 text-white">SM&emsp;</td>
                            <td className="p-2 font-bold bg-green-400 text-white">ANN&nbsp;</td>
                        </tr>
                        {results.map((result) => (
                                <SearchResult key={result.id} qidorsSingleStudy={result}
                                              onMessageChange={handleMessageChange}/>
                            )
                        )}
                    </table>
                </div>
            </div>

        </>
    );
};

export {SearchResultList};
