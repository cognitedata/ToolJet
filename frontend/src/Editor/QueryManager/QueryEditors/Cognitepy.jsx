import React from 'react';
import { changeOption } from './utils';
import { defaults } from 'lodash';
import CodeHinter from '@/Editor/CodeEditor';
import Select from '@/_ui/Select';
import { BaseUrl } from '@/Editor/QueryManager/QueryEditors/Restapi/BaseUrl';
import Tabs from '@/Editor/QueryManager/QueryEditors/Restapi/Tabs';

export class Cognitepy extends React.Component {
  constructor(props) {
    super(props);
    const options = defaults({ ...props.options }, { code: '//Type your Python code here' });
    this.state = {
      options,
    };
  }

  componentDidMount() {}

  render() {
    const { options } = this.state;
    console.log(this);
    const cdfCluster = '';
    const cdfProject = '';
    const queryName = this.props.queryName;

    return (
      <>
        <div className="runps-editor mb-3">
          <CodeHinter
            type="multiline"
            initialValue={this.props.options.code}
            lang="python"
            height={400}
            className="query-hinter"
            onChange={(value) => changeOption(this, 'code', value)}
            componentName="Cognitepy"
            cyLabel={`cognitepy`}
            delayOnChange={false}
          />
        </div>

        <div className={`d-flex mb-1`}>
          <div className="form-label flex-shrink-0">Configuration</div>
          <div className="flex-grow-1">
            <div className="rest-api-methods-select-element-container mb-2">
              <div className={`field w-100 rest-methods-url mb-2`}>
                <label className="font-weight-bold color-slate12">CDF Cluster</label>
                <div className="d-flex">
                  {cdfCluster && (
                    <BaseUrl theme={this.props.darkMode ? 'monokai' : 'default'} dataSourceURL={cdfCluster} />
                  )}
                  <div
                    className={`flex-grow-1 rest-api-url-codehinter ${cdfCluster ? 'url-input-group' : ''}`}
                    style={{ width: '200px' }}
                  >
                    <CodeHinter
                      type="basic"
                      initialValue={options.cdfCluster}
                      onChange={(value) => {
                        changeOption(this, 'cdfCluster', value);
                      }}
                      placeholder={'Enter CDF cluster (e.g., westeurope-1)'}
                      componentName={`${queryName}::url`}
                      lang="javascript"
                    />
                  </div>
                </div>
              </div>

              <div className={`field w-100 rest-methods-url mb-2 mx-3`}>
                <div className="font-weight-bold color-slate12">CDF Project</div>
                <div className="d-flex">
                  {cdfProject && (
                    <BaseUrl theme={this.props.darkMode ? 'monokai' : 'default'} dataSourceURL={cdfProject} />
                  )}
                  <div
                    className={`flex-grow-1 rest-api-url-codehinter ${cdfProject ? 'url-input-group' : ''}`}
                    style={{ width: '200px' }}
                  >
                    <CodeHinter
                      type="basic"
                      initialValue={options.cdfProject}
                      onChange={(value) => {
                        changeOption(this, 'cdfProject', value);
                      }}
                      placeholder={'Enter CDF project name'}
                      componentName={`${queryName}::url`}
                      lang="javascript"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
