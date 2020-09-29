import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import {TodoItemList} from '../models/TodoItemList'
import { TodoUpdate } from '../models/TodoUpdate'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly dueDateIndex = process.env.DUEDATE_INDEX_NAME,
    private readonly bucketName = process.env.IMAGES_S3_BUCKET) {
  }

  async getAllTodos(userId: string,limit: number, nextKey: String): Promise<TodoItemList> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName : this.dueDateIndex,
      Limit: limit,
      ExclusiveStartKey: nextKey,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
          ':userId': userId
      },
      ExpressionAttributeNames: {
        '#todoName': "name"
      },
      ProjectionExpression: 
        "todoId, createdAt, #todoName, dueDate, done, attachmentUrl"
      
    }).promise()

    const items = result.Items as TodoItem[]
    const lastEvaluatedKey = result.LastEvaluatedKey
    let todoItemList : TodoItemList = {
      todoItems: items,
      lastEvaluatedKey: lastEvaluatedKey
    }
    return todoItemList
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todo
    }).promise()

    return this.getTodo(todo.userId,todo.todoId);
  }

  async updateTodo(todo: TodoUpdate,userId: string,todoId: string) {
    var params = {
      TableName:this.todosTable,
      Key:{
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set #todoName = :todoName, dueDate=:dueDate, done=:done",
      ExpressionAttributeNames:{
          '#todoName': "name"
      },
      ExpressionAttributeValues:{
          ":todoName": todo.name,
          ":dueDate": todo.dueDate,
          ":done": todo.done
      },
      ReturnValues:"UPDATED_NEW"
  };
    await this.docClient.update(params).promise()
  }

  async deleteTodo(userId: string, todoId: string): Promise<TodoItem> {
    var params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      ReturnValues:"ALL_OLD"
  };
  
    const result = await this.docClient.delete(params).promise()
    console.log(" Return Value " + result.Attributes)
    return result.Attributes as TodoItem
  }

  async getTodo(userId: string, todoId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId and todoId = :todoId ',
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':userId': userId
      },
      ExpressionAttributeNames: {
        '#todoName': "name"
      },
      ProjectionExpression: 
        "todoId, createdAt, #todoName, dueDate, done, attachmentUrl"
    }).promise()
    if (result.Items.length === 0) return null
    return result.Items[0] as TodoItem
  }

  async updateAttachmentURLTodo(userId: string,todoId: string) {
    var params = {
      TableName:this.todosTable,
      Key:{
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues:{
          ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
      },
      ReturnValues:"UPDATED_NEW"
  };
    await this.docClient.update(params).promise()
  }
}
