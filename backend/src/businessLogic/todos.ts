import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoItemList} from '../models/TodoItemList'
import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoFileAccess } from '../dataLayer/todosFileAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()
const todoFileAccess = new TodoFileAccess()

export async function getAllTodos(userId: string,limit: number, nextKey: String) : Promise<TodoItemList> {
  return todoAccess.getAllTodos(userId,limit,nextKey)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string): Promise<TodoItem> {

  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    userId: userId,
    todoId: todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false
  })
}

export async function updateTodo(
  updateTodoRequest: UpdateTodoRequest,
  userId: string,
  todoId: string) {

  await todoAccess.updateTodo({
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
    }, 
    userId, 
    todoId)
}

export async function deleteTodo(
  userId: string,
  todoId: string) {

  const delTodo = await todoAccess.deleteTodo(userId, todoId)
  if(delTodo.attachmentUrl) await todoFileAccess.deleteAttachment(delTodo.todoId)
}

export async function todoExists(
  userId: string,
  todoId: string) {

  const result = await todoAccess.getTodo(userId, todoId)
  return !!result
}

export async function getUploadUrl(
  userId: string,
  todoId: string) : Promise<string> {

  await todoAccess.updateAttachmentURLTodo(userId, todoId)
  const url = await todoFileAccess.getUploadUrl(todoId)
  return url
}