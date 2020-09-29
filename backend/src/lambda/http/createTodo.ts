import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../businessLogic/todos'
import {getUserId, getProccessId} from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('createTodo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // Implement creating a new TODO item
  const procId = getProccessId()
  const userId = getUserId(event);
  logger.info(`ProcessId ${procId} : Start to create Todo for User : ${userId}`)

  if (!newTodo.name || !newTodo.dueDate) {
    logger.info(`ProcessId ${procId} : Name or DueDate must not be empty to create Todo for User : ${userId}`)
  
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Invalid request body : Name or DueDate must not be empty'
        })
      }
    }

  const item = await createTodo(newTodo, userId)

  logger.info(`ProcessId ${procId} : Finish to create Todo for User : ${userId}`)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
