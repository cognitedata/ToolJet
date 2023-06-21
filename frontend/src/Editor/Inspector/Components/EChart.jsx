import React, { useState } from 'react';
import { renderElement } from '../Utils';
import { CodeHinter } from '../../CodeBuilder/CodeHinter';
import Accordion from '@/_ui/Accordion';
import { resolveReferences } from '@/_helpers/utils';
import { Button } from '@/_ui/LeftSidebar';
import { Popover, OverlayTrigger } from 'react-bootstrap';

class EChart extends React.Component {
  constructor(props) {
    super(props);

    const {
      dataQueries,
      component,
      paramUpdated,
      componentMeta,
      eventUpdated,
      eventOptionUpdated,
      components,
      currentState,
    } = props;

    this.state = {
      dataQueries,
      component,
      paramUpdated,
      componentMeta,
      eventUpdated,
      eventOptionUpdated,
      components,
      currentState,
    };
  }

  componentDidMount() {
    const {
      dataQueries,
      component,
      paramUpdated,
      componentMeta,
      eventUpdated,
      eventOptionUpdated,
      components,
      currentState,
    } = this.props;

    this.setState({
      dataQueries,
      component,
      paramUpdated,
      componentMeta,
      eventUpdated,
      eventOptionUpdated,
      components,
      currentState,
    });
  }

  render() {
    const { dataQueries, component, paramUpdated, componentMeta, components, currentState } = this.state;
    const { darkMode } = this.props;
    const { fetchingRecommendation } = false; //TODO update
    const data = this.state.component.component.definition.properties.data;

    const jsonDescription = this.state.component.component.definition.properties.jsonDescription;

    const plotFromJson = resolveReferences(
      this.state.component.component.definition.properties.plotFromJson?.value,
      currentState
    );

    const chartType = this.state.component.component.definition.properties.type.value;

    const popoverForRecommendation = (
      <Popover id="transformation-popover-container">
        <div className="transformation-popover card text-center">
          <img src="/assets/images/icons/copilot.svg" alt="AI copilot" height={64} width={64} />
          <div className="d-flex flex-column card-body">
            <h4 className="mb-2">ToolJet x OpenAI</h4>
            <p className="mb-2">
              <strong style={{ fontWeight: 700, color: '#3E63DD' }}>AI copilot</strong> helps you write your queries
              faster. It uses OpenAI&apos;s GPT-3.5 to suggest queries based on your data.
            </p>
            <Button
              onClick={() => window.open('https://docs.tooljet.com/docs/tooljet-copilot', '_blank')}
              darkMode={darkMode}
              size="sm"
              classNames="default-secondary-button"
              styles={{ width: '100%', fontSize: '12px', fontWeight: 700, borderColor: darkMode && 'transparent' }}
            >
              <Button.Content title={'Read more'} />
            </Button>
          </div>
        </div>
      </Popover>
    );

    const coPilotTitle = () => {
      return (
        <>
          Powered by <strong style={{ fontWeight: 700, color: '#3E63DD' }}>AI copilot</strong>
        </>
      );
    };

    let items = [];

    items.push({
      title: 'Title',
      children: renderElement(
        component,
        componentMeta,
        paramUpdated,
        dataQueries,
        'title',
        'properties',
        currentState,
        components,
        this.props.darkMode
      ),
    });

    items.push({
      title: 'EChart Options schema',
      children: renderElement(
        component,
        componentMeta,
        paramUpdated,
        dataQueries,
        'plotFromJson',
        'properties',
        currentState
      ),
    });

    if (plotFromJson) {
      items.push({
        title: 'JSON description',
        children: (
          <>
            <CodeHinter
              currentState={this.props.currentState}
              initialValue={jsonDescription?.value ?? {}}
              theme={this.props.darkMode ? 'monokai' : 'duotone-light'}
              mode="javascript"
              lineNumbers={false}
              className="chart-input pr-2"
              onChange={(value) => this.props.paramUpdated({ name: 'jsonDescription' }, 'value', value, 'properties')}
              componentName={`widget/${this.props.component.component.name}::${chartType}`}
            />
            <div className="d-flex">
              <Button.UnstyledButton styles={{ height: '28px' }} darkMode={darkMode} classNames="mx-1">
                <Button.Content title={coPilotTitle} iconSrc={'assets/images/icons/flash.svg'} direction="left" />
              </Button.UnstyledButton>
              <OverlayTrigger trigger="click" placement="left" overlay={popoverForRecommendation} rootClose>
                <svg
                  width="16.7"
                  height="16.7"
                  viewBox="0 0 20 21"
                  fill="#3E63DD"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ cursor: 'pointer' }}
                  data-cy={`transformation-info-icon`}
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M10 2.5C5.58172 2.5 2 6.08172 2 10.5C2 14.9183 5.58172 18.5 10 18.5C14.4183 18.5 18 14.9183 18 10.5C18 6.08172 14.4183 2.5 10 2.5ZM0 10.5C0 4.97715 4.47715 0.5 10 0.5C15.5228 0.5 20 4.97715 20 10.5C20 16.0228 15.5228 20.5 10 20.5C4.47715 20.5 0 16.0228 0 10.5ZM9 6.5C9 5.94772 9.44771 5.5 10 5.5H10.01C10.5623 5.5 11.01 5.94772 11.01 6.5C11.01 7.05228 10.5623 7.5 10.01 7.5H10C9.44771 7.5 9 7.05228 9 6.5ZM8 10.5C8 9.94771 8.44772 9.5 9 9.5H10C10.5523 9.5 11 9.94771 11 10.5V13.5C11.5523 13.5 12 13.9477 12 14.5C12 15.0523 11.5523 15.5 11 15.5H10C9.44771 15.5 9 15.0523 9 14.5V11.5C8.44772 11.5 8 11.0523 8 10.5Z"
                    fill="#3E63DD"
                  />
                </svg>
              </OverlayTrigger>
            </div>
            <div
              data-tooltip-id="tooltip-for-active-copilot"
              data-tooltip-content="Activate Copilot in the workspace settings"
            >
              <Button
                onClick={() => alert(JSON.stringify(jsonDescription))}
                size="sm"
                classNames={`${fetchingRecommendation ? (darkMode ? 'btn-loading' : 'button-loading') : ''}`}
                styles={{ width: '100%', fontSize: '12px', fontWeight: 500 }}
              >
                <Button.Content title={'Generate code'} />
              </Button>
            </div>
          </>
        ),
      });
    } else {
      items.push({
        title: 'Properties',
        children: renderElement(
          component,
          componentMeta,
          paramUpdated,
          dataQueries,
          'type',
          'properties',
          currentState,
          components
        ),
      });

      items.push({
        title: 'Chart data',
        children: (
          <CodeHinter
            currentState={this.props.currentState}
            initialValue={data.value}
            theme={this.props.darkMode ? 'monokai' : 'duotone-light'}
            mode="javascript"
            lineNumbers={false}
            className="chart-input pr-2"
            onChange={(value) => this.props.paramUpdated({ name: 'data' }, 'value', value, 'properties')}
            componentName={`widget/${this.props.component.component.name}::${chartType}`}
          />
        ),
      });
    }

    // if (!plotFromJson) {
    //   items.push({
    //     title: 'Marker color',
    //     children: renderElement(
    //       component,
    //       componentMeta,
    //       paramUpdated,
    //       dataQueries,
    //       'markerColor',
    //       'properties',
    //       currentState
    //     ),
    //   });
    // }

    // items.push({
    //   title: 'Options',
    //   children: (
    //     <>
    //       {renderElement(
    //         component,
    //         componentMeta,
    //         paramUpdated,
    //         dataQueries,
    //         'loadingState',
    //         'properties',
    //         currentState
    //       )}
    //       {renderElement(component, componentMeta, paramUpdated, dataQueries, 'showAxes', 'properties', currentState)}
    //       {renderElement(
    //         component,
    //         componentMeta,
    //         paramUpdated,
    //         dataQueries,
    //         'showGridLines',
    //         'properties',
    //         currentState
    //       )}
    //     </>
    //   ),
    // });

    items.push({
      title: 'Layout',
      isOpen: false,
      children: (
        <>
          {renderElement(
            component,
            componentMeta,
            this.props.layoutPropertyChanged,
            dataQueries,
            'showOnDesktop',
            'others',
            currentState,
            components
          )}
          {renderElement(
            component,
            componentMeta,
            this.props.layoutPropertyChanged,
            dataQueries,
            'showOnMobile',
            'others',
            currentState,
            components
          )}
        </>
      ),
    });

    return <Accordion items={items} />;
  }
}

export { EChart };
