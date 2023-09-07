import { APIGatewayProxyEvent, Context, Handler } from 'aws-lambda';

export const healCheck:Handler = async (event:APIGatewayProxyEvent, context:Context, callback)=> {
    const response = {
        statusCode: 200,
        body: JSON.stringify({
          message: 'ok',
          input: event,
        }),
      };

      callback(null, response);
}