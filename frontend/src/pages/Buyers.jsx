import React from 'react';
import { GridComponent, Inject, ColumnsDirective, ColumnDirective, Search, Page } from '@syncfusion/ej2-react-grids';

import { buyersGrid } from '../data/dummy';
import { Header } from '../components';
import { useState, useEffect } from 'react';
import { useAuthContext } from "../hooks/useAuthContext"
import { useBuyersContext } from "../hooks/useBuyersContext"
import { API_URL } from '../config/api';

const Buyers = () => {
  const toolbarOptions = ['Delete'];
  const selectionsettings = { persistSelection: true };
  const editing = { allowDeleting: true, allowEditing: true };
  const [buyersData, setBuyersData] = useState([]); // State to store fetched data
  const {user} = useAuthContext()
  const {dispatch} = useBuyersContext()

  useEffect(() => {
    const fetchBuyersData = async () => {
      try {
        const response = await fetch(`${API_URL}/buyers`, {
          headers: {'Authorization': `Bearer ${user.accessToken}`},
        })
        const json = await response.json()
        if (response.ok) {
          setBuyersData(json);
          dispatch({type: 'SET_BUYER', payload: json})
        }
      } catch (error) {
        console.error('Error fetching suppliers data:', error);
      }
    };

    if (user) {
      fetchBuyersData()
    }
  }, [dispatch, user]);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Acheteurs" />
      <GridComponent
        dataSource={buyersData}
        width="auto"
        allowPaging
        allowSorting
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        editSettings={editing}
        toolbar={toolbarOptions}
      >
        <ColumnsDirective>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          {buyersGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
        </ColumnsDirective>
        <Inject services={[Search, Page]} />

      </GridComponent>
    </div>
  );
};
export default Buyers;
