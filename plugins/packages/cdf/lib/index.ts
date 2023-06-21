import { QueryService, User, App, QueryResult } from '@tooljet-plugins/common';
import { CogniteClient } from '@cognite/sdk';
import { SourceOptions, QueryOptions } from './types';
import { parse, visit } from 'graphql';
import { DatapointsMultiQuery, DatapointsQueryExternalId } from '@cognite/sdk/dist/src';

function calculateGranularity(start: Date, end: Date): string | null {
  const targetPoints = 300;

  const durationMs = end.getTime() - start.getTime();
  const averageDurationPerPointMs = durationMs / targetPoints;

  return formatGranularity(averageDurationPerPointMs);
}

function formatGranularity(granularity: number): string {
  const secGranularity = granularity / 10000;
  const days = Math.floor(secGranularity / (24 * 3600));
  const hours = Math.floor((secGranularity % (24 * 3600)) / 24);
  const minutes = Math.floor(secGranularity % 60);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;

  return '1h';
}

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
      const rawDataArray = await client.datapoints.retrieve({
        ...params,
        limit: 300,
        aggregates: ['average'],
        granularity: calculateGranularity(new Date(params.items[0].start), new Date(params.items[0].end)),
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
  }

  private async getClient(sourceOptions: SourceOptions, context?: { user?: User; app?: App }) {
    // const isAppPublic = context?.app.isPublic;
    // const userData = context?.user;
    return Promise.resolve(
      new CogniteClient({
        project: sourceOptions.project,
        baseUrl: '',
        appId: 'tooljet-app',
        getToken: () => {
          return Promise.resolve('');
          // return getCurrentToken(true, sourceOptions['tokenData'], userData?.id, isAppPublic);
        },
      })
    );
  }
}
