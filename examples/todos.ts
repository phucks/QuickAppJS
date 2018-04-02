// in development

const Q = require("QuickAppJS")
let todoModel = Q.model({
    name: "todo",
    properties: {
        Q.property({
            name: "text",
            type: Q.types.TEXT,
            nullable: false
        }),
        Q.property({
            name: "completed",
            type: Q.types.BOOLEAN,
            nullable: false
        }),
        Q.property({
            name: "owner",
            type: Q.types.USER,
            nullable: false
        })
    }
})
Q.app({
    name: "ToDos",
    register: true, // allows users to register at "/register"
    structure: {
        "/": {
            authentication: {
                required: true,
                loginMessage: "You have to be logged in to use the ToDo app."
            },
            components: [
                Q.list({
                    data: todoModel.whereEquals("owner", Q.objects.loggedInUser)
                })
                Q.button({
                    label: "Add task",
                    color: Q.colors.GREEN,
                    onClick: function (objects) {
                        Q.promptPopup({
                            message: "Type in the name for the new Task",
                            validation: {
                                regex: "^(?!\s*$).+", // no empty or whitespace string
                                errorMessage: "Task name may not be empty or invisible"
                            },
                            onClick: function (objects) {
                                todoModel.create({
                                    text: objects.input,
                                    completed: false,
                                    owner: Q.loggedInUser
                                })
                            }
                        })
                    }
                })
            ]
        }
    }
})