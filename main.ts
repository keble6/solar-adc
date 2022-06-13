function readTime () {
    date = "" + DS3231.date() + "/" + DS3231.month() + "/" + DS3231.year()
    time = "" + DS3231.hour() + ":" + DS3231.minute()
    dateTime = "" + date + " " + time
}
function makeReading () {
    // Read each ADC channel, generate average, then store in Vreadings array
    for (let channel = 0; channel <= 2; channel++) {
        if (channel == 0) {
            Ntotal = 0
            for (let sample = 0; sample <= sampleSize - 1; sample++) {
                // Add each sample
                Ntotal = Ntotal + pins.analogReadPin(AnalogPin.P0)
            }
        } else if (channel == 1) {
            Ntotal = 0
            for (let sample = 0; sample <= sampleSize - 1; sample++) {
                // Add each sample
                Ntotal = Ntotal + pins.analogReadPin(AnalogPin.P1)
            }
        } else {
            Ntotal = 0
            for (let sample = 0; sample <= sampleSize - 1; sample++) {
                // Add each sample
                Ntotal = Ntotal + pins.analogReadPin(AnalogPin.P2)
            }
        }
        // generate average reading
        Nave = Ntotal / sampleSize
        // Scaled voltage: for ADC = 1023 at 3.3V on P0 and external resistors 270k to Vin and 330k to Gnd
        Vscaled = Nave * (6 / 1023)
        // Round to 2 decimal place2
        Vscaled = Math.round(Vscaled * 100)
        Vscaled = Vscaled / 100
        if (channel == 0) {
            Vreading = "" + convertToText(Vscaled) + ","
        } else if (channel == 1) {
            Vreading = "" + Vreading + convertToText(Vscaled) + ","
        } else {
            Vreading = "" + Vreading + convertToText(Vscaled)
        }
    }
}
// Test block
input.onButtonPressed(Button.A, function () {
    if (count > 0) {
        basic.showString("" + (dateTimeReadings[count - 1]))
        basic.showString("" + (Vreadings[count - 1]))
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
    Vreadings = []
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
            radio.sendString("" + (Vreadings[index]))
            basic.pause(500)
        }
    }
})
// Show all 3 input voltages
input.onButtonPressed(Button.B, function () {
    makeReading()
    basic.showString(Vreading)
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
let Vreading = ""
let Vscaled = 0
let Nave = 0
let Ntotal = 0
let dateTime = ""
let time = ""
let date = ""
let count = 0
let dateTimeReadings: string[] = []
let Vreadings: string[] = []
let sampleSize = 0
// Set the number of readings to get the average
sampleSize = 10
// Sampling time interval
let oneMinute = 60000
// This is the stored array of ADC voltage readings
Vreadings = []
// The date and time text string of the reading
dateTimeReadings = []
// The number of stored readings
count = 0
radio.setGroup(1)
radio.setTransmitPower(7)
loops.everyInterval(oneMinute, function () {
    // Take readings once per hour
    if (DS3231.minute() == 0) {
        // Debug - make a reading
        serial.writeLine("Making a reading")
        readTime()
        dateTimeReadings.push(dateTime)
        makeReading()
        Vreadings.push(Vreading)
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
