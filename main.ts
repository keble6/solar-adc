function readTime () {
    date = "" + DS3231.date() + "/" + DS3231.month() + "/" + DS3231.year()
    time = "" + DS3231.hour() + ":" + DS3231.minute()
    dateTime = "" + date + " " + time
}
function makeReading () {
    basic.pause(1000)
    // Scaled for ADC = 1023 at 3.3V on P0 and external resistors 18k to Vbat and 33k to Gnd
    Vbat = pins.analogReadPin(AnalogPin.P0) * (3.3 / 662)
    // Round to 1 decimal place
    Vbat = Math.round(Vbat * 10)
    Vbat = Vbat / 10
}
// Test block
input.onButtonPressed(Button.A, function () {
    if (count > 0) {
        basic.showString("" + (dateTimeReadings[count - 1]))
        basic.showString("" + (batteryReadings[count - 1]))
        basic.pause(1000)
        basic.showNumber(count)
        basic.pause(1000)
        basic.clearScreen()
    } else {
        basic.showString("wait for reading")
    }
})
function setDate () {
    // the first 2 characters after command
    date = stringIn.substr(2, 2)
    // the next 2 characters
    month = stringIn.substr(4, 2)
    // the last 4 characters
    year = stringIn.substr(6, 4)
    DS3231.dateTime(
    parseFloat(year),
    parseFloat(month),
    parseFloat(date),
    DS3231.day(),
    DS3231.hour(),
    DS3231.minute(),
    0
    )
    serial.writeNumber(DS3231.date())
    serial.writeNumber(DS3231.month())
    serial.writeNumber(DS3231.year())
    serial.writeLine("")
}
// Reset readings
input.onButtonPressed(Button.AB, function () {
    batteryReadings = []
    dateTimeReadings = []
    count = 0
    // Debug - reset
    serial.writeLine("Resetting readings")
})
function setTime () {
    // the first 2 characters after command
    hour = stringIn.substr(2, 2)
    // the next 2 characters command
    minute = stringIn.substr(4, 2)
    DS3231.dateTime(
    DS3231.year(),
    DS3231.month(),
    DS3231.date(),
    DS3231.day(),
    parseFloat(hour),
    parseFloat(minute),
    0
    )
    serial.writeNumber(DS3231.hour())
    serial.writeNumber(DS3231.minute())
    serial.writeLine("")
}
radio.onReceivedString(function (receivedString) {
    // Debug - radio received
    serial.writeLine("radio received")
    if (count > 0) {
        basic.pause(2000)
        for (let index = 0; index <= count - 1; index++) {
            radio.sendString("" + dateTimeReadings[index] + ",")
            radio.sendString("" + (batteryReadings[index]))
            basic.pause(500)
        }
    }
})
// Instant PTH
input.onButtonPressed(Button.B, function () {
    makeReading()
    basic.showString("" + (Vbat))
})
serial.onDataReceived(serial.delimiters(Delimiters.CarriageReturn), function () {
    stringIn = serial.readUntil(serial.delimiters(Delimiters.CarriageReturn))
    command = stringIn.substr(0, 2)
    if (command == "st") {
        setTime()
    }
    if (command == "sd") {
        setDate()
    }
})
let command = ""
let minute = ""
let hour = ""
let year = ""
let month = ""
let stringIn = ""
let Vbat = 0
let dateTime = ""
let time = ""
let date = ""
let count = 0
let dateTimeReadings: string[] = []
let batteryReadings: number[] = []
let oneMinute = 60000
batteryReadings = []
dateTimeReadings = []
count = 0
radio.setGroup(1)
radio.setTransmitPower(7)
// Debug - start serial
serial.writeLine("abc")
loops.everyInterval(oneMinute, function () {
    // Take readings once per hour
    if (DS3231.minute() == 0) {
        // Debug - make a reading
        serial.writeLine("Making a reading")
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        batteryReadings.push(Vbat)
        count += 1
    }
    basic.showLeds(`
        . . . . #
        . . . . .
        . . . . .
        . . . . .
        . . . . .
        `)
    basic.pause(50)
    basic.clearScreen()
})
