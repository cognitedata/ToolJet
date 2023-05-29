import { QueryService, User, App, getCurrentToken, QueryResult } from '@tooljet-plugins/common';
import { CogniteClient } from '@cognite/sdk';
import { SourceOptions, QueryOptions } from './types';
import { parse, visit } from 'graphql';

export default class CDFQueryService implements QueryService {
  async run(
    sourceOptions: SourceOptions,
    queryOptions: QueryOptions,
    dataSourceId: string,
    dataSourceUpdatedAt: string,
    context?: { user?: User; app?: App }
  ): Promise<QueryResult> {
    const client = await this.getClient(sourceOptions);
    let result = {};
    const queryAST = parse(queryOptions.query);
    visit(queryAST, {
      Field: {
        enter(node) {
          if (node.name.value === 'timeseries') {
            result = client.timeseries.retrieve(this.transcode(node.arguments));
          }
        },
      },
    });

    return {
      status: 'ok',
      data: result,
    };
  }

  private transcode(args) {
    const result = {};
    for (const arg of args) {
      result[arg.name.value] = arg.value.value.replace(/'/g, '');
    }
    return result;
  }

  private async getClient(sourceOptions: SourceOptions, context?: { user?: User; app?: App }) {
    const isAppPublic = context?.app.isPublic;
    const userData = context?.user;
    return new CogniteClient({
      project: sourceOptions.project,
      baseUrl: sourceOptions.url,
      appId: 'tooljet-app',
      getToken: () => {
        return getCurrentToken(true, sourceOptions['tokenData'], userData?.id, isAppPublic);
      },
    });
  }
}
