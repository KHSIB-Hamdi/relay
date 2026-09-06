import React from 'react';
import { AxisDirective, ChartComponent, SeriesCollectionDirective, SeriesDirective, Inject, Legend, Category, Tooltip, ColumnSeries, DataLabel } from '@syncfusion/ej2-react-charts';
import { ChartsHeader } from '../../components';
import { useStateContext } from '../../contexts/ContextProvider';

const Bar = ({ compareData }) => {
  const { currentMode } = useStateContext();
  const chartData = {
    labels: compareData.flatMap(supplier => supplier.articles.map(article => article.name)),
    datasets: compareData.map((supplier, index) => ({
      label: supplier.supplierName,
      data: supplier.articles.map(article => article.quantity)
    }))
  };

  console.log('compareData:', compareData);

  console.log('chartData:', chartData);

  return (
    <div >
      <ChartsHeader title="Comparaison des articles" />
      <ChartComponent
        id="charts"
    
          chartArea={{ border: { width: 0 } }}
          background={currentMode === 'Dark' ? '#33373E' : '#fff'}
          legendSettings={{ background: 'white' }}
      >
        <Inject services={[ColumnSeries, Legend, Tooltip, Category, DataLabel]} />
        <AxisDirective
          valueType="Numeric"
          title="Quantité"
          minimum={0}
          maximum={24000}
          labelFormat="N0"
          
        />
        <SeriesCollectionDirective>
          {compareData.map((supplier, index) => (
            <SeriesDirective
              key={index}
              type="Column"
              dataSource={chartData.datasets[index].data}
              xName="name"
              yName="quantity"
              name={supplier.supplierName}
            />
          ))}
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );
};

export default Bar;
