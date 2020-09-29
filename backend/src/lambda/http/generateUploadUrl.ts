import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { todoExists, getUploadUrl } from '../../businessLogic/todos'
import {getUserId, getProccessId} from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('generateUploadUrl')
export const handler : APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // Return a presigned URL to upload a file for a TODO item with the provided id
  const procId = getProccessId()
  logger.info('Start to generate Upload Url : ProcessId ', procId )
  const userId = getUserId(event);
  logger.info(`ProcessId ${procId} : Start to generate Upload Url for Todo : ${todoId} of User : ${userId}`)

  const validTodoId = await todoExists(userId, todoId)

  if (!validTodoId) {
    logger.info(`ProcessId ${procId} : Invalid TodoId : ${todoId} to generate Upload Url for User : ${userId}`)
    return {
      statusCode: 404,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        error: 'Todo does not exist'
      })
    }
  }

  const url = await getUploadUrl(userId, todoId)

  logger.info(`ProcessId ${procId} : Finish to generate Upload Url for Todo : ${todoId} of User : ${userId}`)

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
