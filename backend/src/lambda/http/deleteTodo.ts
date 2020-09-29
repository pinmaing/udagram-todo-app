import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodo ,todoExists} from '../../businessLogic/todos'
import {getUserId, getProccessId } from '../utils'
import { createLogger} from '../../utils/logger'

const logger = createLogger('deleteTodo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // Remove a TODO item by id
  const procId = getProccessId()
  const userId = getUserId(event);
  logger.info(`ProcessId ${procId} : Start to delete a TodoId : ${todoId} for User : ${userId}`)

  const validTodoId = await todoExists(userId, todoId)

  if (!validTodoId) {
  logger.info(`ProcessId ${procId} : Invalid TodoId : ${todoId} to delete for User : ${userId}`)

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

  await deleteTodo(userId, todoId)

  logger.info(`ProcessId ${procId} : Finish to delete a Todo : ${todoId} for User : ${userId}`)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
    })
  }
}
