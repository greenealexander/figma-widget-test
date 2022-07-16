import React, { useEffect } from "react";
import "./App.css";

function App() {
  // useEffect(() => {
  //   if (typeof parent !== undefined) {
  //     parent?.postMessage?.({ pluginMessage: "hello" }, "*");
  //   }
  // }, []);

  return (
    <div className="App">
      <h1>Hello</h1>
      <button
        onClick={() => {
          parent?.postMessage?.(
            {
              pluginMessage: {
                type: "add-part",
                part: {
                  name: "button_play",
                  partType: "Button",
                  conditions: [
                    {
                      type: "Display",
                      when: {
                        operator: "Always",
                      },
                    },
                    {
                      type: "Display",
                      when: {
                        operator: "And",
                        assertions: ["this is true", "that is not true"],
                        when: {
                          operator: "Or",
                          assertions: ["this is true", "that is not true"],
                        },
                      },
                    },
                  ],
                },
              },
            },
            "*"
          );
        }}
      >
        Add Part
      </button>
      <button
        onClick={() => {
          parent?.postMessage?.(
            {
              pluginMessage: {
                type: "close",
              },
            },
            "*"
          );
        }}
      >
        Close
      </button>
    </div>
  );
}

export default App;
