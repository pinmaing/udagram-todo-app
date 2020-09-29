import {TodoItem} from './TodoItem'
export interface TodoItemList {
  todoItems: TodoItem[],
  lastEvaluatedKey?: any
}
