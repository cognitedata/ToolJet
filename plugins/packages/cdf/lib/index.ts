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
      items: [{ externalId: 'RPFCC370:oee', start: '5d-ago', end: 'now' }],
      limit: 300,
      aggregates: ['average'],
      granularity: '1h',
    });
    const data = rawDataArray.map((rawData, index) => {
      return rawData.datapoints.map((point) => {
        return {
          x: new Date(point.timestamp),
          y: point.average,
        };
      });
    });

    return {
      status: 'ok',
      data: data[0],
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
