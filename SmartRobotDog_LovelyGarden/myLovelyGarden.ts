import { HttpServer } from '@node-wot/binding-http'
import { Servient } from '@node-wot/core'
import fs = require('fs')
import axios from 'axios'
import { ThingDescription } from 'wot-typescript-definitions'

let td: ThingDescription
var wateringON: any = {}

enum States {
  manualWatering,
  autoWatering,
}

const delay = async (ms: number) => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), ms))
}

async function getWeatherforseenParameter() {
  let ret: any = {}
  const api_key: string = 'c34aa6d1fb729b7c3784e97a778e3a7f'
  const api: string = `https://api.openweathermap.org/data/2.5/onecall?lat=48.14206178933707&lon=11.555223956707964&units=metric&appid=${api_key}`
  try {
    const resp = await axios.get(api)
    ret = await resp.data
  } catch (e) {
    console.log(e)
  }

  return ret
}
//Variables initialization. Some variables are just set to avoid errors. They may change periodically
var forseenParameter: any = {}
var temperature: number = 20
var timeMultiplier: number = 0
var soilHumidity: number = 50
var hignHumThreshold = 50
var lowHumThreshold: number = 20
var state: States = States.autoWatering
var periodToDrying = 3600
var timerForDrying: number = periodToDrying
var timerForcasting: number = 86400

//retrieving the data and activating the main function for using it. Mainly the temperature update and the sprinkler starter/stopper status action
async function init() {
  const totalSecsInAday = 86400
  forseenParameter = await getWeatherforseenParameter()
  temperature = forseenParameter.current.temp
  temperaturePeriodicVariation()
  soilPeriodicChange()
  sprinklerStatusChange()
}
//Watering beginns
function startSprinkler() {
  wateringON = true
}
//Watering stops
function stopSprinkler() {
  wateringON = false
}
//sets humifity value to a constant which will be used for further conditions 
function getHumidity(): number {
  return soilHumidity
}
//temperature will naturally collide with the values delivered from the init()
function getTemperature(): number {
  return temperature
}
//Sets humidity threshold. Value is trivial but should be plausible
function getHumidityThresh(): number {
  return lowHumThreshold
}
//delivers the watering mode to use. default means that there is nothing to display in case of special errors or situational circumstances
function getState(): string {
  switch (state) {
    case States.autoWatering:
      return 'automaticWatering'
    case States.manualWatering:
      return 'manualWatering'
    default:
      return 'nothing to state'
  }
}
//after checking the humidity conditions and the actual state we would have to update the status of the sprinkler if needed
function setState(newState: States) {
  switch (newState) {
    case States.manualWatering:
      state = States.manualWatering
      break
    case States.autoWatering:
      state = States.autoWatering
    default:
      break
  }
}

// As th threashold should be set as fiyed. 
//If user identifies the need to change it we would redirect his logic to standard threshold values for humidity. 
//This parameter should be fixed and affected to lowHumThreshold
function setHumidityThresh(newThresh: number) {
  let threshold_use = newThresh
  if (newThresh > 100) {
    threshold_use = 0
  }
  if (newThresh < 0) {
    threshold_use = 0
  }
  lowHumThreshold = threshold_use
}

async function isItWet(): Promise<boolean> {
  const forseenParameter = await getWeatherforseenParameter()
  if (forseenParameter.minutely[0].precipitation > 0) {
    return true
  } else if (wateringON) {
    return true
  } else {
    return false
  }
  return false
}
//optional function. could be replaced by an intern timer implementation in the main function. It specifies the drying timer by which we can know whether the sprinkler is needed or not
function untillItDries_s(decr: number) {
  if (timerForDrying > decr) {
    timerForDrying -= decr
  } else {
    timerForDrying = 0
  }
}

//optional function. could be replaced by an intern timer implementation in the main function. 
function forseenParameterTimerDecrement(decr: number) {
  if (timerForcasting > decr) {
    timerForcasting -= decr
  } else {
    timerForcasting = 0
  }
}
//Based on the current precipitation data and the humidity reached we can determine whether it is essential to use an automatic or manual spinkling mode
async function sprinklerStatusChange() {
  const totalSecsInAday = 86400
  const incrementTimePeriod = 5
  if (state == States.autoWatering) {
    forseenParameterTimerDecrement(incrementTimePeriod)

    // forseenParameter will be once per day updated
    if (timerForcasting == 0) {
      forseenParameter = await getWeatherforseenParameter()
      //for the decrementing timer functions above
      timerForcasting = totalSecsInAday
    }

    if (soilHumidity < lowHumThreshold) {
      // second element is tomorrow's weather
      if (forseenParameter.daily[1].rain > 0 || forseenParameter.daily[1].snow > 0) {
        stopSprinkler()
      } else {
        startSprinkler()
      }
    } else if (soilHumidity > hignHumThreshold) {
      stopSprinkler()
    }
  }

  await delay(5000),
    sprinklerStatusChange()
}

async function temperaturePeriodicVariation() {
  const incrementTimePeriod: number = 10
  const tempAmplitude: number = 39
  const tempShift: number = 20 // to ensure temperature remains between -20 and 60
  const totalSecsInAday: number = 86400
  //Sinusoidl function in the form sin((2*pi/T)*t)+S where S allows us to shift the function above for a better and more plausible tmperature variation
  temperature = tempAmplitude * Math.sin(((2 * Math.PI) / totalSecsInAday) * timeMultiplier) + tempShift
  // allows users to test the 10 seconds periodic change of the temperature
  console.log(temperature)

  // (Optional) our time incrementation variation scenario. It sets a secure way so that the daily second number does not have to be exceeded. This is optional as we are using a sinusoidal function allowing a periodic change of temperatures
  // (Essential) time incrementation
  if (timeMultiplier == totalSecsInAday) {
    timeMultiplier = 0
  } else {
    timeMultiplier += incrementTimePeriod
  }

  await delay(incrementTimePeriod * 1000).then(async () => {
    temperaturePeriodicVariation()
  })
}
async function soilPeriodicChange() {
  const incrementTimePeriod = 5
  untillItDries_s(incrementTimePeriod)

  if (await isItWet()) {

    timerForDrying = periodToDrying
    //Since we are using percentage an interval of plausible humidity values has to be considered.
    //to avoid any confusion the program sets the value to a minimum or maximum percentage depending on the following scenario
    //humidity increases by 1 percent every 5 seconds when it is being watered. Any type of rain (or snow/hail) has the exact same rate of increase as watering
    if (soilHumidity < 100) {
      soilHumidity++
    } else {
      soilHumidity = 100
    }
  } else {
    if (timerForDrying == 0) {
      timerForDrying = periodToDrying
      if (temperature > 10 && temperature < 20) {
        if (soilHumidity > 0) {
          soilHumidity--
        } else {
          soilHumidity = 0
        }
      }
      else if (temperature > 20 && temperature < 30) {
        if (soilHumidity > 1) {
          soilHumidity -= 2
        } else {
          soilHumidity = 0
        }
      }
      else if (temperature > 30) {
        if (soilHumidity > 3) {
          soilHumidity -= 4
        } else {
          soilHumidity = 0
        }
      }
    }
  }

  await delay(5000).then(async () => {
    soilPeriodicChange()
  })
}


async function main() {
  const servient = new Servient()
  servient.addServer(new HttpServer())
  servient.start().then(async (WoT) => {
    let thing = await WoT.produce(td)
    await init()
    thing.setPropertyReadHandler('temperature', () => {
      return new Promise((resolve, reject) => {
        resolve(Math.round(getTemperature()))
      })
    })
    await thing.setPropertyReadHandler('soilHumidity', () => {
      return new Promise((resolve, reject) => {
        resolve(getHumidity())
      })
    })
    await thing.setPropertyReadHandler('state', () => {
      return new Promise((resolve, reject) => {
        resolve(getState())
      })
    })
    await thing.setPropertyWriteHandler('state', (newState) => {
      return new Promise((resolve, reject) => {
        resolve(setState(newState))
      })
    })
    await thing.setPropertyWriteHandler('humidityThreshold', (newThresh) => {
      return new Promise((resolve, reject) => {
        resolve(setHumidityThresh(newThresh))
      })
    })
    await thing.setActionHandler('startSprinkler', function (value?, options?) {
      return new Promise((resolve, reject) => {
        startSprinkler()
        resolve(setState(States.manualWatering))
      })
    })
    await thing.setActionHandler('stopSprinkler', function (value?, options?) {
      return new Promise((resolve, reject) => {
        stopSprinkler()
        resolve(setState(States.manualWatering))
      })
    })
    await setInterval(async () => {
      let humidityCheckParam = getHumidity()
      let humCheckThresh = getHumidityThresh()

      if (humidityCheckParam < humCheckThresh) {
        thing.emitEvent('tooDry', {})
      } else if (humidityCheckParam > 90) {
        thing.emitEvent('tooWet', {})
      }
    }, 5000)
    await thing.expose()
    console.log('Wheather data ready to be tracked.')

  })
}

//program Execution beginns here
fs.readFile("myLovelyGarden.json", async (err, data) => {
  td = JSON.parse(data.toString());

  await main();
})