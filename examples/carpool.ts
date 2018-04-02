const Q = require("QuickAppJS")
let userModel = Q.userModel({ // this can only be called once
    // name is always "user"
    properties: [
        // email and password are standard
        Q.property({
            name: "firstName",
            type: Q.types.STRING,
            nullable: false,
            enterOnRegistration: true,
            userEdibility: Q.READ_AND_WRITE
        }),
        Q.property({
            name: "lastName",
            type: Q.types.STRING,
            nullable: false,
            enterOnRegistration: true,
            userEdibility: Q.READ_AND_WRITE
        }),
        Q.property({
            name: "phoneNumber",
            type: Q.types.PHONE_NUMBER,
            nullable: false,
            enterOnRegistration: true,
            userEdibility: Q.READ_AND_WRITE
        })
    ]
})
let rideModel = Q.model({
    name: "ride",
    properties: [
        Q.property({
            name: "provider",
            type: userModel.type,
            nullable: false
        }),
        Q.property({
            name: "fromPlace",
            type: Q.types.STRING,
            nullable: false
        }),
        Q.property({
            name: "toPlace",
            type: Q.types.STRING,
            nullable: false
        }),
        Q.property({
            name: "time",
            type: Q.types.DATETIME,
            nullable: false,
            default: Q.deafults.NOW
        }),
        Q.property({
            name: "avaliable",
            type: Q.types.BOOLEAN,
            nullable: false,
            default: true,
            visible: false // only visible from backend
        })
    ]
})
Q.app({
    name: "CarPool",
    menubar: { // optional
        items: {

        }
    },
    register: true, // allows users to register at "/register"
    structure: {
        "/": {
            components: [
                Q.headline("Welcome to CarPool"),
                Q.button({
                    label: "I have a car :car: and I'm looking for passengers",
                    onClick: Q.goto("/offer")
                }),
                Q.button({
                    label: "I don't have a car and would like to ride as a passenger",
                    onClick: Q.goto("/")
                })
            ]
        },
        "/offer": {
            authentication: {
                required: true,
                loginMessage: "You have to be logged in to offer a ride"
            },
            components: [
                Q.headline("Offer a ride")
            ]
        },
        "/browse": {
            components: [
                Q.headline("All CarPool rides"),
                Q.table({
                    data: rideModel.checkEach(function (ride) {
                        return ride.avaliable
                    }),
                    operations: Q.READONLY,
                    onItemClick: Q.goto("/viewride")
                })
            ]
        },
        "/viewride": {
            components: [
                Q.modelDetailView({
                    data: Q.objects.item, // don't have to write this, because its standard with modelDetailView
                    operations: Q.READONLY,
                    components: [
                        Q.button({
                            label: "Book Ride",
                            color: Q.colors.GREEN,
                            onClick: Q.goto("/bookride")
                        })
                    ]
                })
            ]
        },
        "/bookride": {
            authentication: {
                required: true,
                loginMessage: "You have to be logged in to book a ride."
            },
            components: [
                Q.headline("Booking ride"),
                Q.form([
                    Q.textArea({
                        label: "Leave a message for the driver",
                        key: "message",
                        required: true
                    }),
                    Q.button({
                        label: "Book ride",
                        onClick: function(objects) {
                            Q.sendMail({
                                to: objects.item.provider.email,
                                // if no "from" is given, the app name and domain will be used. QuickAppJS has it's own smtp server for that
                                subject: "Your CarPool ride has been booked!",
                                body: "Hello ${objects.item.provider.firstName},<br>${Q.singedInUser.firstName} ${Q.singedInUser.lastName} has booked your ride from ${objects.item.fromPlace} to ${objects.item.toPlace}. You can reach him/her at ${Q.singedInUser.phoneNumber}. He/she has left you this message: ${objects.message}"
                            })
                            objects.item.set("avabliable", false)
                            Q.popupMessage({
                                message: "The ride has been booked, thank you for using CarPool!",
                                closeButton: false,
                                buttons: [
                                    Q.popupMessageButton({
                                        label: "Close",
                                        onClick: function() {
                                            Q.deleteAllObjects()
                                            Q.goto("/")
                                        }
                                    })
                                ]
                            })
                        }
                    })
                ])
            ]
        }
    }
})
Q.serve(8080)