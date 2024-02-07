// For this Thing Project I got inspired by a game
// I used to play when I was 14, the first time I got
//my favceboook account active. The game is called Pet Society
//In this case instead following the trend of cleaning feedind etc, I chose
//to go for a domestic robot friend. 

import { HttpServer } from '@node-wot/binding-http'
import { Servient } from '@node-wot/core'
import { ThingDescription } from 'wot-typescript-definitions'
import fs = require('fs')


let td: ThingDescription

const delay = async (ms: number) => {
    await new Promise<void>((resolve) => setTimeout(() => resolve(), ms))
}

const chargingInS = 0.027777777; // 100%/3600 if we supposed that a robot is chargeable in 1 hour
const userHungryforcastInS = 0.5;
enum postChargingStatus {
    PCS1 = "H.A.P.P.Y",
    PCS2 = "S.U.P.E.R.H.A.P.P.Y",
    PCS3 = "M.E.H"
}
const ledScreenReaction = ["GOTCHA",
    "CHEATER", "LALALAND VIBE"];

enum Feelings {
    //Displayed feelings. LED-face interface
    F1 = "joyfull",
    F2 = "sad",
    F3 = "unsatisfied",
    F4 = "worried",
    F5 = "interested",
    F6 = "neutral",
    F7 = "pleased"

}

enum Charge {
    //Charging Method
    CM1 = "cablecharging",
    CM2 = "wirecharging",
    CM3 = "do nothing"
}

enum PlayOptions {
    PL1 = "chess",
    PL2 = "ball",
    PL3 = "dance"
}


var lonelynessMaxTimeThreshold = 120; //in secs
var actualTime = Date.now();
var name: string = "";
var PostChargingState: postChargingStatus = postChargingStatus.PCS3; //initialize PostChargingState. can vary depending on the status later
var feeling: Feelings = Feelings.F3; //initialize feeling. can vary depending on the status later
var batteryStatus: number = 0; // battery level of the robot
var masterHungerLevel: number = 0; //
var actualTime = 0;
var maintainanceNeeded: boolean = false;


async function init() {
    await grapAttentionActions();
}

function get_feeling(): Feelings {
    return feeling;
}


function chargeMe(): number {
    return batteryStatus;
}

function serveMaster(): number {
    return masterHungerLevel;
}

function checkIfBroken(): boolean {
    return maintainanceNeeded;
}
actualTime = Date.now();
function interact() {

    if (Math.random() > 0.6) {
        feeling = Feelings.F1;
    }
    else {
        feeling = Feelings.F7;
    }
}

async function battery(charge: Charge) {
    switch (charge) {
        case Charge.CM3:
            batteryStatus += 0;
            PostChargingState = postChargingStatus.PCS3;
            break;
        case Charge.CM1:
            await delay(1 * 1000)
            batteryStatus += 100;
            PostChargingState = postChargingStatus.PCS2;
            break;
        case Charge.CM2:
            await delay(1 * 1000)
            batteryStatus += 50;
            PostChargingState = postChargingStatus.PCS1;
            break;
        default:
            break;
    }
    //avoid error since battery status level can only be positiv
    if (batteryStatus > 100) {
        batteryStatus = 100;
    }
}


function maintanceNeededNow() {
    if (Math.random() > 0.8) {
        maintainanceNeeded = true;
    }
    else {
        maintainanceNeeded = false;
    }
}


async function grapAttentionActions() {
    batteryStatus += (batteryStatus <= (100 - chargingInS) ? chargingInS : 0);
    masterHungerLevel += (masterHungerLevel <= (100 - userHungryforcastInS) ? userHungryforcastInS : 0);

    // Here we get an idea on the "feelings" of the robot.
    // Master should always check upon the time he last interacted with his 
    // domestic friend. Time is of course in milliseconds displayed
    let emotionCounterTimer = Date.now();
    //lonelynessMaxTimeThreshold
    if ((actualTime - emotionCounterTimer) > lonelynessMaxTimeThreshold) {
        feeling = Feelings.F4;
    }

    if ((actualTime - emotionCounterTimer) > lonelynessMaxTimeThreshold) {
        feeling = Feelings.F2;
    }

    if ((actualTime - emotionCounterTimer) < lonelynessMaxTimeThreshold) {
        feeling = Feelings.F1;
    }



    await delay(1000).then(() => {
        grapAttentionActions();
    })
}


async function main() {
    const servient = new Servient()

    servient.addServer(new HttpServer())

    servient.start().then(async (WoT) => {
        let thing = await WoT.produce(td);

        await init();

        thing.setPropertyReadHandler('name', () => {
            return new Promise((resolve, reject) => {
                resolve(name);
            })
        })

        // ## property write
        thing.setPropertyWriteHandler('name', (newName) => {
            return new Promise((resolve, reject) => {
                resolve(name = newName);
            })
        })


        thing.setPropertyReadHandler('status', () => {
            return new Promise((resolve, reject) => {
                resolve(get_feeling());
            })
        })



        // ## actions
        thing.setActionHandler('game', function (value, options) {
            return new Promise((resolve, reject) => {
                interact();
                if (value == PlayOptions.PL2) {
                    resolve(ledScreenReaction[0]);
                }
                else if (value == PlayOptions.PL1) {
                    resolve(ledScreenReaction[1]);
                }
                else {
                    resolve(ledScreenReaction[2]);
                }
            })
        })

        thing.setActionHandler('highFive', function (value, options) {
            return new Promise((resolve, reject) => {
                resolve(interact());
            })
        })

        thing.setActionHandler('bringMeFood', function (value, options) {
            return new Promise((resolve, reject) => {
                resolve(serveMaster());
            })
        })

        thing.setActionHandler('charge', function (value, options) {
            return new Promise((resolve, reject) => {
                resolve(battery(value));
            })
        })

        thing.setActionHandler('maintainance', function (value, options) {
            return new Promise((resolve, reject) => {
                resolve(maintanceNeededNow());
            })
        })

        // EXPOSE
        await thing.expose();
        setInterval(async () => {
            let batteryStatus = chargeMe();
            let isMasterHungry = serveMaster();
            let almostDead = checkIfBroken();

            if (batteryStatus < 5) {
                thing.emitEvent("battery", "Time some electron shaker. Plug me in");
            }
            if (isMasterHungry > 60) {
                thing.emitEvent("serve", "keep his plate full");
            }
            if (almostDead == true) {
                thing.emitEvent("HE64t4fgLP", "meeee65gffg222eeee");
            }
        }, 1000)
    })
}

fs.readFile('myAmazingThing.json', async (err, data) => {
    td = JSON.parse(data.toString())

    await main()
})
