import React, {useEffect, useRef} from 'react';
import {useAppDispatch, useAppSelector} from "Hook";
import _ from "lodash";
import {firstQuery, getNextTenResult, initialLimitAndOffset} from "Slices/searchAreaSlice/searchAreaSlice";
import SearchResult from "./SearchResult";
import {updateQueryParameter} from "Slices/searchAreaSlice/searchAreaSlice";

const SearchResultList = ({onMessageChange}) => {
    const searchResultListRef = useRef();

    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    console.log('searchAreaReducer', searchAreaReducer)
    const queryParameter = searchAreaReducer.parameter;
    const results = _.isEmpty(searchAreaReducer.results) ? [] : searchAreaReducer.results;
    console.log('results*********************', results)
    const isNextQueryEmpty = searchAreaReducer.isNextQueryEmpty;

    const dispatch = useAppDispatch();

    // // 假设您希望在组件加载时更改limit
    // useEffect(() => {
    //     // 调用 reducer 来更改 limit
    //     dispatch(updateQueryParameter({ ...searchAreaReducer.parameter, limit: "3" }));
    // }, [dispatch, searchAreaReducer.parameter]);


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


    const handlePageChange = (e) => {
        dispatch(updateQueryParameter({ ...searchAreaReducer.parameter, limit: e.target.value }));
        dispatch(initialLimitAndOffset());
        console.log('queryParameter', queryParameter)
        dispatch(firstQuery(queryParameter));
    }

    return (
        //  overflow-y-auto overflow-x-hidden
        <div className="flex-fill h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll} ref={searchResultListRef}
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
            <div>
                <select className="w-1/12 h-12 bg-green-400 text-white rounded-br-xl" onChange={(e) => {handlePageChange(e)}}>
                    <option value="5">5</option>
                    <option value="7">7</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                </select>
            </div>
        </div>
    )
        ;
};

export {SearchResultList};
