import {React, useEffect} from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Resize, Sort, ContextMenu, Filter, Page, ExcelExport, PdfExport, Edit, Inject } from '@syncfusion/ej2-react-grids';
import { contextMenuItems, articlesGrid } from '../data/dummy';
import { Header } from '../components';
import { Link } from 'react-router-dom';
import { useState} from 'react';
import { useAuthContext } from "../hooks/useAuthContext"
import { useArticlesContext } from "../hooks/useArticlesContext"
import { useStateContext } from '../contexts/ContextProvider';
import { API_URL } from '../config/api';

const Articles = () => {
  const editing = { allowDeleting: true, allowEditing: true };
  const [articlesData, setArticlesData] = useState([]); 
  const {user} = useAuthContext()
  const {dispatch} = useArticlesContext()
  const { currentColor} = useStateContext();

  useEffect(() => {
    const fetchArticlesData = async () => {
      try {
        const response = await fetch(`${API_URL}/articles`, {
          headers: {'Authorization': `Bearer ${user.accessToken}`},
        })
        const json = await response.json()
        if (response.ok) {
          setArticlesData(json);
          dispatch({type: 'SET_ARTICLE', payload: json})
        }
      } catch (error) {
        console.error('Error fetching articles data:', error);
      }
    };

    if (user) {
      fetchArticlesData()
    }
  }, [dispatch, user]);

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header title="Articles" />
      <GridComponent
        id="gridcomp"
        dataSource={articlesData}
        allowPaging
        allowSorting
        allowExcelExport
        allowPdfExport
        contextMenuItems={contextMenuItems}
        editSettings={editing}
      >
        <ColumnsDirective>
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          {articlesGrid.map((item, index) => <ColumnDirective key={index} {...item} />)}
        </ColumnsDirective>
        <Inject services={[Resize, Sort, ContextMenu, Filter, Page, ExcelExport, Edit, PdfExport]} />
      </GridComponent>
      
        <Link to = {"/create-article"} >
            Ajouter
        </Link>
    </div>
  );
};
export default Articles;
