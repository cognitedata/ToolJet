import { QueryService, User, App, QueryResult } from '@tooljet-plugins/common';
import { CogniteClient } from '@cognite/sdk';
import { SourceOptions, QueryOptions } from './types';
import { parse, visit } from 'graphql';
import { DatapointsMultiQuery, DatapointsQueryExternalId } from '@cognite/sdk/dist/src';

export default class CDFQueryService implements QueryService {
  constructor() {}
  private transcodeDatapoints(args) {
    const result: DatapointsMultiQuery = { items: [] };

    const toTimestamp = (str) => {
      const date = new Date(str);
      return !isNaN(date.valueOf()) ? date.getTime() : str;
    };

    const datapointsQuery: Partial<DatapointsQueryExternalId> = args.reduce((acc, arg) => {
      const argName = arg.name.value;
      let argValue = arg.value.value.replace(/'/g, '');

      if (argName === 'start' || argName === 'end') {
        argValue = toTimestamp(argValue);
      } else if (argName === 'aggregates') {
        argValue = argValue.split(',');
      }

      acc[argName] = argValue;

      return acc;
    }, {});

    result.items.push(datapointsQuery as DatapointsQueryExternalId);

    return result;
  }

  async run(
    sourceOptions: SourceOptions,
    queryOptions: QueryOptions,
    dataSourceId: string,
    dataSourceUpdatedAt: string,
    context?: { user?: User; app?: App }
  ): Promise<QueryResult> {
    const client = await this.getClient(sourceOptions);
    const queryAST = parse(queryOptions.query);
    let params;
    visit(queryAST, {
      Field: {
        enter: (node) => {
          if (node.name.value === 'timeseries') {
            params = this.transcodeDatapoints(node.arguments);
          }
        },
      },
    });
    if (params) {
      const rawDataArray = await client.datapoints.retrieve(params);
      const data = rawDataArray.map((rawData, index) => {
        const timestamps = rawData.datapoints.map((point) => new Date(point.timestamp));
        const values = rawData.datapoints.map((point) => point.value);
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
  }

  private async getClient(sourceOptions: SourceOptions, context?: { user?: User; app?: App }) {
    // const isAppPublic = context?.app.isPublic;
    // const userData = context?.user;
    return Promise.resolve(
      new CogniteClient({
        project: sourceOptions.project,
        baseUrl: sourceOptions.url,
        appId: 'tooljet-app',
        getToken: () => {
          return Promise.resolve('token');
          // return getCurrentToken(true, sourceOptions['tokenData'], userData?.id, isAppPublic);
        },
      })
    );
  }
}
