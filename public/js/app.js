let todos = []
const priorities = ['None', 'Low', 'Medium', 'High']

let toggleDoneState = false

function primaryContent (todo) {
  let template = `<div class="list-item__primary-content">
         <span class="list-item__title">
             <input class="list-item__checkbox" type="checkbox" {{checked}}>
             <input class="list-item__input" value="{{title}}"></input>
         </span>
         <span>
             <span class="list-item__due-date">{{dueDate}}</span>
             <button class="list-item__expander">▾</button>
         </span>
     </div>`

  const checkedState = todo.completed ? 'checked' : ''

  template = template.replace('{{checked}}', checkedState)
  template = template.replace('{{title}}', todo.title)
  template = template.replace('{{dueDate}}', todo.dueDate)

  return template
}

function secondaryContent (todo) {
  let priorityOptions = ''

  priorities.map((x, index) => {
    priorityOptions +=
      `<option value="${index}" ${todo.priority === index ? 'selected' : ''}>` +
      x +
      '</option>'
  })

  let template = `<div class="list-item__secondary-content list-item--hide" >

         <div class="list-item__notes-content">
             <p class="list-item__label">Notes</p>
             <textarea class="list-item__textarea">{{notes}}</textarea>
         </div>

         <div class="list-item__priority-content">
             <div>
                 <p class=list-item__label>Due Date</p>
                 <input type="date" class="list-item__selector" value="{{dueDate}}"/>

                 <p class="list-item__label">Priority</p>
                 <select class="list-item__selector">
                      ${priorityOptions}
                 </select>
             </div>
             <button class="list-item__button list-item__button--danger">Delete</button>
         </div>
    </div>`

  template = template.replace('{{notes}}', todo.notes)
  template = template.replace('{{dueDate}}', todo.dueDate)

  return template
}

function makeTodo (todo) {
  const todoElement = document.createElement('li')
  todoElement.setAttribute('id', todo.id)
  todoElement.setAttribute('class', 'list-item')

  todoElement.innerHTML = primaryContent(todo) + secondaryContent(todo)

  // Adding strike class if checked

  if (todo.completed) {
    todoElement
      .querySelector('.list-item__checkbox')
      .setAttribute('checked', 'true')
    todoElement
      .querySelector('.list-item__input')
      .classList.add('list-item__input--strike')
  }

  // Adding border based on priority
  todoElement.classList.add(
    `list-item--priority-${priorities[todo.priority].toLowerCase()}`
  )

  // adding event listners
  // closures
  const eventArray = [
    ['.list-item__checkbox', 'click', toggleTodo],
    ['.list-item__input', 'blur', editTodo],
    ['.list-item__expander', 'click', showMoreInfo],
    ['.list-item__textarea', 'blur', setNotes],
    ['input[type="date"]', 'change', setDate],
    ['select', 'change', setPriority],
    ['.list-item__button', 'click', deleteTodo]
  ]

  eventArray.map(([element, eventType, eventHandler]) => {
    todoElement
      .querySelector(element)
      .addEventListener(eventType, eventHandler)
  })

  return todoElement
}

function addTodo (event) {
  if (event.keyCode !== 13 || !event.target.value) return

  const newTodo = {
    title: event.target.value,
    completed: false,
    priority: 0,
    dueDate: '',
    id: Date.now(),
    notes: ''
  }

  todos.push(newTodo)

  const li = makeTodo(newTodo)
  document.querySelector('.list').append(li)

  event.target.value = '' // reset input

  syncLocalStorage()
  toggleClearButton()
}

function getParent (event, index) {
  debugger
  const path = event.path || (event.composedPath && event.composedPath())
  const parent = path[index]
  return parent
}

function toggleTodo (event) {
  const parent = getParent(event, 3)
  const [todo] = todos.filter((x) => x.id === Number(parent.id))

  todo.completed = !todo.completed

  event.target.checked = !event.target.checked
  event.target.nextElementSibling.classList.toggle('list-item__input--strike')

  syncLocalStorage()
  toggleDoneTasks()
}

function deleteTodo (event) {
  const parent = getParent(event, 3)
  todos = todos.filter((x) => x.id !== Number(parent.id))

  parent.parentElement.removeChild(parent)

  syncLocalStorage()
  // rename toggle to specific function,passing info
  toggleClearButton()
}

function displayTodos (todos_ = todos) {
  // filter as  parameter
  const todoList = document.querySelector('.list')
  todoList.innerHTML = ''
  todos_.map((todo) => todoList.appendChild(makeTodo(todo)))
}

function editTodo (event) {
  const parent = getParent(event, 3)

  // find instead of filter
  const [todo] = todos.filter((x) => x.id === Number(parent.id))

  todo.title = event.target.value
  syncLocalStorage()
}

function showMoreInfo (event) {
  const parent = getParent(event, 3)
  const secondaryContent = parent.querySelector(
    '.list-item__secondary-content'
  )
  const expander = parent.querySelector('.list-item__expander')

  secondaryContent.classList.toggle('list-item--hide')
  expander.classList.toggle('list-item__expander--expand')
}

function setDate (event) {
  const parent = getParent(event, 4)
  const dateLabel = parent.querySelector('.list-item__due-date')
  const [todo] = todos.filter((x) => x.id === Number(parent.id))

  todo.dueDate = event.target.value
  dateLabel.innerText = todo.dueDate

  syncLocalStorage()
}

function setPriority (event) {
  const parent = getParent(event, 4)
  const [todo] = todos.filter((x) => x.id === Number(parent.id))

  todo.priority = Number(event.target.value)

  for (const priority of priorities) {
    const priorityClass = 'list-item--priority-' + priority.toLowerCase()

    if (parent.classList.contains(priorityClass)) { parent.classList.remove(priorityClass) }
  }

  parent.classList.add(
    `list-item--priority-${priorities[todo.priority].toLowerCase()}`
  )
  syncLocalStorage()
}

function setNotes (event) {
  const parent = getParent(event, 3)
  const [todo] = todos.filter((x) => x.id === Number(parent.id))

  todo.notes = event.target.value
  syncLocalStorage()
}

function syncLocalStorage (command) {
  const todoStore = localStorage

  switch (command) {
    case 'init':
      if (todoStore.todos) {
        todos = JSON.parse(todoStore.todos)
      }
      break

    case 'clear':
      todoStore.removeItem('todos')
      todos = []
      break

    default:
      todoStore.todos = JSON.stringify(todos)
  }
}

function clearAllTasks () {
  syncLocalStorage('clear')
  document.querySelector('.list').innerHTML = ''
  toggleFooter()
}

function toggleClearButton () {
  const clearAllTasksButton = document.querySelector('.actionbar__clear-all')
  clearAllTasksButton.style.visibility = todos.length ? 'visible' : 'hidden'
}



// counter  of done tasks and decide to show up toggled task
function toggleDoneTasks (event) {
  const footer = document.querySelector('.actionbar')
  const showTasksButton = document.querySelector('.actionbar__show-toggle')

  const tempTodos = todos.filter((todo) => !todo.completed)
  const completedTasksCount = todos.length - tempTodos.length

  if (completedTasksCount > 0) {
    footer.style.visibility = 'visible'
  } else {
    displayTodos()
    footer.style.visibility = 'hidden'
  }

  if (event) {
    toggleDoneState = !toggleDoneState
  }

  if (toggleDoneState) {
    displayTodos(tempTodos)
    showTasksButton.innerHTML = `Show Done Tasks (${completedTasksCount})`
  } else {
    displayTodos(todos)
    showTasksButton.innerHTML = `Hide Done Tasks (${completedTasksCount})`
  }
}

function toggleFooter () {
  toggleDoneTasks()
  toggleClearButton()
}

function clearDoneTasks () {
  todos = todos.filter((x) => !x.completed)
  toggleDoneState = false

  syncLocalStorage()
  toggleFooter()
}

function main () {
  syncLocalStorage('init')
  displayTodos()
  toggleFooter()
}

const todoInput = document.querySelector('.input-container__input')
todoInput.addEventListener('keypress', addTodo)

const clearAllButton = document.querySelector('.actionbar__clear-all')
clearAllButton.addEventListener('click', clearAllTasks)

const clearDoneButton = document.querySelector('.actionbar__clear-done')
clearDoneButton.addEventListener('click', clearDoneTasks)

const toggleTasksButton = document.querySelector('.actionbar__show-toggle')
toggleTasksButton.addEventListener('click', toggleDoneTasks)

main()
