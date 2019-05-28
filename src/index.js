import React from "react"
import ReactDOM from "react-dom"
import { Machine, assign } from "xstate"
import { useMachine } from "@xstate/react"

const todoMachine = Machine(
  {
    id: "todoMachine",
    initial: "pending",
    context: {
      tasks: []
    },
    states: {
      pending: {
        invoke: {
          src: "getData",
          onDone: "success",
          onError: "failure"
        }
      },
      success: {
        onEntry: "actionGetData",
        on: {
          "TASK.CLICK": {
            actions: "actionToggleDone"
          }
        }
      },
      failure: {
        onEntry: "actionGetData",
        on: {
          RETRY: "pending"
        }
      }
    }
  },
  {
    actions: {
      actionGetData: assign({
        tasks: (_ctx, event) => event.data
      }),
      actionToggleDone: assign({
        tasks: (ctx, event) =>
          ctx.tasks.map((task, index) =>
            index === event.index ? { ...task, done: !task.done } : task
          )
      })
    },
    services: {
      getData: ctx =>
        new Promise((res, rej) =>
          setTimeout(() => {
            const random = Math.floor(Math.random() * 10)

            if (random >= 7) {
              rej([])
            }
            res([
              {
                done: true,
                taskTitle: "Code furiously"
              },
              {
                done: true,
                taskTitle: "Do user study"
              },
              {
                done: true,
                taskTitle: "Write paper"
              },
              {
                done: false,
                taskTitle: "Have a life!!"
              }
            ])
          }, 3000)
        )
    }
  }
)

const RetryButton = ({ onRetryClick }) => (
  <div>
    Erro! <button onClick={() => onRetryClick()}>Retry!</button>
  </div>
)

const TaskList = ({ tasks, onTaskClick }) => (
  <ul>
    {tasks.map((task, index) => (
      <li key={index}>
        {task.done ? <strike>{task.taskTitle}</strike> : task.taskTitle}{" "}
        <button onClick={() => onTaskClick(index)}>Done</button>
      </li>
    ))}
  </ul>
)

function App() {
  const [state, send] = useMachine(todoMachine)

  console.info("state => ", state.value)
  console.info("context => ", state.context)
  console.info("actions => ", state.actions)
  console.log("-------")

  return (
    <div className="App">
      {(state.matches("pending") && "Loading...") ||
        (state.matches("failure") && (
          <RetryButton onRetryClick={() => send("RETRY")} />
        )) || (
          <TaskList
            tasks={state.context.tasks}
            onTaskClick={index => send("TASK.CLICK", { index })}
          />
        )}
    </div>
  )
}

const rootElement = document.getElementById("root")
ReactDOM.render(<App />, rootElement)
