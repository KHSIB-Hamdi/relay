import React from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Selection, Inject, Edit, Toolbar, Sort, Filter } from '@syncfusion/ej2-react-grids';
import { suppliersGrid } from '../data/dummy';
import { Header } from '../components';
import { useState, useEffect } from 'react';
import { useAuthContext } from "../hooks/useAuthContext"
import { useSuppliersContext } from "../hooks/useSuppliersContext"
import Bar from './Charts/Bar';
import Rating from '../components/Rating'
import { API_URL } from '../config/api';


const Suppliers = () => {
  const selectionsettings = { persistSelection: true };
  const toolbarOptions = ['Search'];
  const editing = { allowDeleting: true, allowEditing: true };
  const [suppliersData, setSuppliersData] = useState([]); 
  const {user} = useAuthContext()
  const {dispatch} = useSuppliersContext()


  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [comparedArticles, setComparedArticles] = useState([]);

  
  const handleSupplierSelect = (supplier) => {
    if (selectedSuppliers.includes(supplier)) {
      setSelectedSuppliers(selectedSuppliers.filter(s => s !== supplier));
    } else {
      setSelectedSuppliers([...selectedSuppliers, supplier]);
    }
  };

  const handleCompareClick = async () => {
    
    const comparedData = [];

    for (const supplier of selectedSuppliers) {
      const supplierId = supplier._id; // Assuming _id is the supplier's unique identifier
      const response = await fetch(`${API_URL}/suppliers/${supplierId}/articles`, {
        headers: {'Authorization': `Bearer ${user.accessToken}`},
      });
      const articles = await response.json();

      comparedData.push({
        supplierName: supplier.username,
        articles: articles,
      });
    }

    

    setComparedArticles(comparedData);
  };


  useEffect(() => {
    const fetchSuppliersData = async () => {
      try {
        const response = await fetch(`${API_URL}/suppliers`, {
          headers: {'Authorization': `Bearer ${user.accessToken}`},
        })
        const json = await response.json()
        if (response.ok) {
          setSuppliersData(json);
          dispatch({type: 'SET_SUPPLIER', payload: json})
        }
      } catch (error) {
        console.error('Error fetching suppliers data:', error);
      }
    };

    if (user) {
      fetchSuppliersData()
    }
  }, [dispatch, user]);

  const onFiltering = (e) => {
    const field = e.column.field;
    const operator = e.operator;
    const value = e.value;
    
    
    if (['username', 'contact', 'address', 'email'].includes(field)) {
     
      const filteredData = // Your filtering logic here
      setSuppliersData(filteredData);
    } else {
      e.preventDefault(); // Prevent filtering on non-applicable columns
      console.log('Filtering is not supported for this column');
    }
  };
  

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <Header category="Page" title="Fournisseurs" />
      <GridComponent
        dataSource={suppliersData}
        enableHover={false}
        allowPaging
        pageSettings={{ pageCount: 5 }}
        selectionSettings={selectionsettings}
        toolbar={toolbarOptions}
        editSettings={editing}
        allowSorting={true}
        filterSettings={{ type: 'Menu', operators: true }}
        allowFiltering={true}
        actionComplete={(args) => {
          if (args.requestType === 'filtering' && args.error) {
            console.log('Filtering error:', args.error); 
          }
        }}
        filtering={onFiltering}
        
        rowSelected={(args) => handleSupplierSelect(args.data)}
       
      >
        <ColumnsDirective>
          {suppliersGrid.map((item, index) => (<ColumnDirective key={index} {...item}
            
          />
          ))}
          
        </ColumnsDirective>
        <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
      </GridComponent>
        <div  className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
          <div>
            <h2>Fournisseurs selectionnés:</h2>
            <ul>
              {selectedSuppliers.map((supplier, index) => (
                <li key={index}>{supplier.username}</li>
              ))}
            </ul>
            <button onClick={handleCompareClick}>Comparer</button>
          </div>
        </div>
        
        <Bar compareData={comparedArticles} />
    </div>
  );
};

export default Suppliers;
