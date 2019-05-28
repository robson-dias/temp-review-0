import React from "react";
import ReactDOM from "react-dom";
import { Machine, assign } from "xstate";
import { useMachine } from "@xstate/react";

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
          onDone: {
            target: "success",
            actions: "actionGetData"
          },
          onError: {
            target: "failure",
            actions: "actionGetData"
          }
        }
      },
      success: {
        on: {
          TOGGLEDONE: {
            actions: "actionToggleDone"
          }
        }
      },
      failure: {
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
        tasks: (ctx, data) => {
          ctx.tasks[data.index].done = !ctx.tasks[data.index].done;

          return ctx.tasks;
        }
      })
    },
    services: {
      getData: ctx =>
        new Promise((res, rej) =>
          setTimeout(() => {
            const random = Math.floor(Math.random() * 10);

            if (random >= 7) rej([]);
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
            ]);
          }, 3000)
        )
    }
  }
);

const showError = machine => {
  const [current, send] = machine;
  if (current.value !== "failure") return;
  return (
    <div>
      Erro! <button onClick={e => send({ type: "RETRY", e: e })}>Retry!</button>
    </div>
  );
};

const showLoading = machine => {
  const [current] = machine;
  if (current.value !== "pending") return;
  return <div>Loading...</div>;
};

const showData = machine => {
  const [current, send] = machine;
  const { tasks } = current.context;

  if (current.value !== "success") return;
  return (
    <ul>
      {tasks.map((task, index) => {
        if (task.done === true)
          return (
            <li key={index}>
              <strike>{task.taskTitle}</strike>{" "}
              <button onClick={() => send({ type: "TOGGLEDONE", index })}>
                Undo
              </button>
            </li>
          );
        return (
          <li key={index}>
            {task.taskTitle}{" "}
            <button onClick={() => send({ type: "TOGGLEDONE", index })}>
              Done
            </button>
          </li>
        );
      })}
    </ul>
  );
};

function App() {
  const machine = useMachine(todoMachine);
  const [current] = machine;
  console.info("state => ", current.value);
  console.info("context => ", current.context);
  console.info("actions => ", current.actions);
  console.log("-------");

  return (
    <div className="App">
      {showLoading(machine)}
      {showError(machine)}
      {showData(machine)}
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
