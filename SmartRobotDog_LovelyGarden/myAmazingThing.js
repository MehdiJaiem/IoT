"use strict";
// For this Thing Project I got inspired by a game
// I used to play when I was 14, the first time I got
//my favceboook account active. The game is called Pet Society
//In this case instead following the trend of cleaning feedind etc, I chose
//to go for a domestic robot friend. 
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var binding_http_1 = require("@node-wot/binding-http");
var core_1 = require("@node-wot/core");
var fs = require("fs");
var td;
var delay = function (ms) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(function () { return resolve(); }, ms); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
var chargingInS = 0.027777777; // 100%/3600 if we supposed that a robot is chargeable in 1 hour
var userHungryforcastInS = 0.5;
var postChargingStatus;
(function (postChargingStatus) {
    postChargingStatus["PCS1"] = "H.A.P.P.Y";
    postChargingStatus["PCS2"] = "S.U.P.E.R.H.A.P.P.Y";
    postChargingStatus["PCS3"] = "M.E.H";
})(postChargingStatus || (postChargingStatus = {}));
var ledScreenReaction = ["GOTCHA",
    "CHEATER", "LALALAND VIBE"];
var Feelings;
(function (Feelings) {
    //Displayed feelings. LED-face interface
    Feelings["F1"] = "joyfull";
    Feelings["F2"] = "sad";
    Feelings["F3"] = "unsatisfied";
    Feelings["F4"] = "worried";
    Feelings["F5"] = "interested";
    Feelings["F6"] = "neutral";
    Feelings["F7"] = "pleased";
})(Feelings || (Feelings = {}));
var Charge;
(function (Charge) {
    //Charging Method
    Charge["CM1"] = "cablecharging";
    Charge["CM2"] = "wirecharging";
    Charge["CM3"] = "do nothing";
})(Charge || (Charge = {}));
var PlayOptions;
(function (PlayOptions) {
    PlayOptions["PL1"] = "chess";
    PlayOptions["PL2"] = "ball";
    PlayOptions["PL3"] = "dance";
})(PlayOptions || (PlayOptions = {}));
var lonelynessMaxTimeThreshold = 120; //in secs
var actualTime = Date.now();
var name = "";
var PostChargingState = postChargingStatus.PCS3; //initialize PostChargingState. can vary depending on the status later
var feeling = Feelings.F3; //initialize feeling. can vary depending on the status later
var batteryStatus = 0; // battery level of the robot
var masterHungerLevel = 0; //
var actualTime = 0;
var maintainanceNeeded = false;
function init() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, grapAttentionActions()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function get_feeling() {
    return feeling;
}
function chargeMe() {
    return batteryStatus;
}
function serveMaster() {
    return masterHungerLevel;
}
function checkIfBroken() {
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
function battery(charge) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = charge;
                    switch (_a) {
                        case Charge.CM3: return [3 /*break*/, 1];
                        case Charge.CM1: return [3 /*break*/, 2];
                        case Charge.CM2: return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 6];
                case 1:
                    batteryStatus += 0;
                    PostChargingState = postChargingStatus.PCS3;
                    return [3 /*break*/, 7];
                case 2: return [4 /*yield*/, delay(1 * 1000)];
                case 3:
                    _b.sent();
                    batteryStatus += 100;
                    PostChargingState = postChargingStatus.PCS2;
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, delay(1 * 1000)];
                case 5:
                    _b.sent();
                    batteryStatus += 50;
                    PostChargingState = postChargingStatus.PCS1;
                    return [3 /*break*/, 7];
                case 6: return [3 /*break*/, 7];
                case 7:
                    //avoid error since battery status level can only be positiv
                    if (batteryStatus > 100) {
                        batteryStatus = 100;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function maintanceNeededNow() {
    if (Math.random() > 0.8) {
        maintainanceNeeded = true;
    }
    else {
        maintainanceNeeded = false;
    }
}
function grapAttentionActions() {
    return __awaiter(this, void 0, void 0, function () {
        var emotionCounterTimer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    batteryStatus += (batteryStatus <= (100 - chargingInS) ? chargingInS : 0);
                    masterHungerLevel += (masterHungerLevel <= (100 - userHungryforcastInS) ? userHungryforcastInS : 0);
                    emotionCounterTimer = Date.now();
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
                    return [4 /*yield*/, delay(1000).then(function () {
                            grapAttentionActions();
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var servient;
        var _this = this;
        return __generator(this, function (_a) {
            servient = new core_1.Servient();
            servient.addServer(new binding_http_1.HttpServer());
            servient.start().then(function (WoT) { return __awaiter(_this, void 0, void 0, function () {
                var thing;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, WoT.produce(td)];
                        case 1:
                            thing = _a.sent();
                            return [4 /*yield*/, init()];
                        case 2:
                            _a.sent();
                            thing.setPropertyReadHandler('name', function () {
                                return new Promise(function (resolve, reject) {
                                    resolve(name);
                                });
                            });
                            // ## property write
                            thing.setPropertyWriteHandler('name', function (newName) {
                                return new Promise(function (resolve, reject) {
                                    resolve(name = newName);
                                });
                            });
                            thing.setPropertyReadHandler('status', function () {
                                return new Promise(function (resolve, reject) {
                                    resolve(get_feeling());
                                });
                            });
                            // ## actions
                            thing.setActionHandler('game', function (value, options) {
                                return new Promise(function (resolve, reject) {
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
                                });
                            });
                            thing.setActionHandler('highFive', function (value, options) {
                                return new Promise(function (resolve, reject) {
                                    resolve(interact());
                                });
                            });
                            thing.setActionHandler('bringMeFood', function (value, options) {
                                return new Promise(function (resolve, reject) {
                                    resolve(serveMaster());
                                });
                            });
                            thing.setActionHandler('charge', function (value, options) {
                                return new Promise(function (resolve, reject) {
                                    resolve(battery(value));
                                });
                            });
                            thing.setActionHandler('maintainance', function (value, options) {
                                return new Promise(function (resolve, reject) {
                                    resolve(maintanceNeededNow());
                                });
                            });
                            // EXPOSE
                            return [4 /*yield*/, thing.expose()];
                        case 3:
                            // EXPOSE
                            _a.sent();
                            setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                var batteryStatus, isMasterHungry, almostDead;
                                return __generator(this, function (_a) {
                                    batteryStatus = chargeMe();
                                    isMasterHungry = serveMaster();
                                    almostDead = checkIfBroken();
                                    if (batteryStatus < 5) {
                                        thing.emitEvent("battery", "Time some electron shaker. Plug me in");
                                    }
                                    if (isMasterHungry > 60) {
                                        thing.emitEvent("serve", "keep his plate full");
                                    }
                                    if (almostDead == true) {
                                        thing.emitEvent("HE64t4fgLP", "meeee65gffg222eeee");
                                    }
                                    return [2 /*return*/];
                                });
                            }); }, 1000);
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
fs.readFile('myAmazingThing.json', function (err, data) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                td = JSON.parse(data.toString());
                return [4 /*yield*/, main()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
