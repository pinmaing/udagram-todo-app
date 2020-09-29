import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo,todoExists } from '../../businessLogic/todos'
import {getUserId, getProccessId } from '../utils'
import { createLogger} from '../../utils/logger'

const logger = createLogger('createTodo')
export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // Update a TODO item with the provided id using values in the "updatedTodo" object
  const procId = getProccessId()
  const userId = getUserId(event);
  logger.info(`ProcessId ${procId} : Start to update Todo : ${todoId} for User : ${userId}`)

  if (!updatedTodo.name || !updatedTodo.dueDate) {
    logger.info(`ProcessId ${procId} : Name or DueDate must not be empty to update Todo : ${todoId} for User : ${userId}`)
  
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

  const validTodoId = await todoExists(userId,todoId)

  if (!validTodoId) {
    logger.info(`ProcessId ${procId} : Invalid to update Todo : ${todoId} for User : ${userId}`)

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

  await updateTodo(updatedTodo, userId, todoId)
  logger.info(`ProcessId ${procId} : Finish to update Todo : ${todoId} for User : ${userId}`)
  
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
