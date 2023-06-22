import { QueryService, User, App, QueryResult } from '@tooljet-plugins/common';
import { CogniteClient } from '@cognite/sdk';
import { SourceOptions, QueryOptions } from './types';

export default class CDFQueryService implements QueryService {
  constructor() {}

  async run(
    sourceOptions: SourceOptions,
    queryOptions: QueryOptions,
    dataSourceId: string,
    dataSourceUpdatedAt: string,
    context?: { user?: User; app?: App }
  ): Promise<QueryResult> {
    const client = await this.getClient(sourceOptions);
    const rawDataArray = await client.datapoints.retrieve({
      items: [{ externalId: 'RPFCC370:oee', start: 'ago-5d', end: 'now' }],
      limit: 300,
      aggregates: ['average'],
      granularity: '1h',
    });
    const data = rawDataArray.map((rawData, index) => {
      const timestamps = rawData.datapoints.map((point) => new Date(point.timestamp));
      const values = rawData.datapoints.map((point) => point.average);
      return {
        x: timestamps,
        y: values,
        type: 'scatter',
        mode: 'lines+markers',
        name: `Series ${index + 1}`, // you may want to use a more meaningful name
        line: {
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // random color, replace with a fixed color or a color selection logic if needed
        },
        marker: {
          color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // random color, replace with a fixed color or a color selection logic if needed
        },
      };
    });

    return {
      status: 'ok',
      data: data,
    };
  }

  private async getClient(sourceOptions: SourceOptions, context?: { user?: User; app?: App }) {
    // const isAppPublic = context?.app.isPublic;
    // const userData = context?.user;
    return Promise.resolve(
      new CogniteClient({
        project: sourceOptions.project,
        baseUrl: 'https://westeurope-1.cognitedata.com',
        appId: 'tooljet-app',
        getToken: () => {
          return Promise.resolve(sourceOptions.token);
          // return getCurrentToken(true, sourceOptions['tokenData'], userData?.id, isAppPublic);
        },
      })
    );
  }
}
