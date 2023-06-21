import React, { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { isJson } from '@/_helpers/utils';
import json5 from 'json5';

export const EChart = ({ width, height, darkMode, properties, styles, dataCy }) => {
  const [loadingState, setLoadingState] = useState(false);

  const { visibility, disabledState } = styles;
  const { title, markerColor, showGridLines, type, data, jsonDescription, plotFromJson, showAxes } = properties;

  useEffect(() => {
    const loadingStateProperty = properties.loadingState;
    if (loadingStateProperty != undefined) {
      setLoadingState(loadingStateProperty);
    }
  }, [properties.loadingState]);

  const computedStyles = {
    width: width - 4,
    height,
    display: visibility ? '' : 'none',
    background: darkMode ? '#1f2936' : 'white',
  };

  const chartType = type;

  const isDescriptionJson = isJson(jsonDescription);

  let parsedJsonDescription = {};
  if (isDescriptionJson) {
    parsedJsonDescription = json5.parse(jsonDescription);
  }

  const dataString = data ?? [];

  const computeChartData = (data, dataString) => {
    let rawData = data;
    if (typeof rawData === 'string') {
      try {
        rawData = JSON.parse(dataString);
      } catch (err) {
        rawData = [];
      }
    }

    if (!Array.isArray(rawData)) {
      rawData = [];
    }

    let newData = [];

    if (chartType === 'gauge') {
      newData = [
        {
          type: chartType,
          progress: {
            show: true,
            width: 18,
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: '#999',
            },
          },
          axisLabel: {
            distance: 25,
            color: '#999',
            fontSize: 20,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10,
            },
          },
          detail: {
            valueAnimation: true,
            offsetCenter: [0, '70%'],
          },
          data: rawData.map((item) => ({ value: item })),
        },
      ];
    } else {
      newData = [
        {
          type: chartType || 'line',
          data: rawData.map((item) => item['y']),
          name: rawData.map((item) => item['x']),
        },
      ];
    }

    return newData;
  };

  const memoizedChartData = useMemo(
    () => computeChartData(data, dataString),
    [data, dataString, chartType, markerColor]
  );

  const generateOptions = (type) => {
    // default options for all types
    let options = {
      title: {
        text: title,
        textStyle: {
          color: darkMode ? '#c3c3c3' : '#333',
        },
      },
      tooltip: {
        trigger: 'axis',
      },
      grid: {
        show: false,
      },
      xAxis: {
        type: 'category',
        data: JSON.parse(dataString).map((item) => item.x),
        axisLabel: {
          color: darkMode ? '#c3c3c3' : '#333',
          show: showAxes,
        },
        splitLine: {
          show: showGridLines,
        },
        axisLine: {
          show: showAxes,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: darkMode ? '#c3c3c3' : '#333',
          show: showAxes,
        },
        splitLine: {
          show: showGridLines,
        },
        axisLine: {
          show: showAxes,
        },
      },
      series: memoizedChartData,
    };

    // Additional modifications for each chart type
    switch (type) {
      case 'line':
        // Add additional options for line type here
        break;
      case 'gauge':
        options = {
          series: memoizedChartData,
        };
        // Add additional options for line type here
        break;
      case 'bar':
        // Add additional options for bar type here
        break;
      default:
        // No additional modifications
        break;
    }
    return options;
  };

  let options = plotFromJson ? parsedJsonDescription : generateOptions(chartType);

  if (plotFromJson && !parsedJsonDescription.title) {
    options.title = {
      text: title,
      textStyle: {
        color: darkMode ? '#c3c3c3' : '#333',
      },
    };
  }

  return (
    <div data-disabled={disabledState} style={computedStyles} data-cy={dataCy}>
      {loadingState === true ? (
        <div style={{ width }} className="p-2 loader-main-container">
          <center>
            <div className="spinner-border mt-5" role="status"></div>
          </center>
        </div>
      ) : (
        <ReactECharts
          option={options}
          style={{ height: height, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      )}
    </div>
  );
};
