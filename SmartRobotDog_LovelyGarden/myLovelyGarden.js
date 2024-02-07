"use strict";
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
var axios_1 = require("axios");
var td;
var wateringON = {};
var States;
(function (States) {
    States[States["manualWatering"] = 0] = "manualWatering";
    States[States["autoWatering"] = 1] = "autoWatering";
})(States || (States = {}));
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
function getWeatherforseenParameter() {
    return __awaiter(this, void 0, void 0, function () {
        var ret, api_key, api, resp, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ret = {};
                    api_key = 'c34aa6d1fb729b7c3784e97a778e3a7f';
                    api = "https://api.openweathermap.org/data/2.5/onecall?lat=48.14206178933707&lon=11.555223956707964&units=metric&appid=".concat(api_key);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, axios_1["default"].get(api)];
                case 2:
                    resp = _a.sent();
                    return [4 /*yield*/, resp.data];
                case 3:
                    ret = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    console.log(e_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, ret];
            }
        });
    });
}
//Variables initialization. Some variables are just set to avoid errors. They may change periodically
var forseenParameter = {};
var temperature = 20;
var timeMultiplier = 0;
var soilHumidity = 50;
var hignHumThreshold = 50;
var lowHumThreshold = 20;
var state = States.autoWatering;
var periodToDrying = 3600;
var timerForDrying = periodToDrying;
var timerForcasting = 86400;
//retrieving the data and activating the main function for using it. Mainly the temperature update and the sprinkler starter/stopper status action
function init() {
    return __awaiter(this, void 0, void 0, function () {
        var totalSecsInAday;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    totalSecsInAday = 86400;
                    return [4 /*yield*/, getWeatherforseenParameter()];
                case 1:
                    forseenParameter = _a.sent();
                    temperature = forseenParameter.current.temp;
                    temperaturePeriodicVariation();
                    soilPeriodicChange();
                    sprinklerStatusChange();
                    return [2 /*return*/];
            }
        });
    });
}
//Watering beginns
function startSprinkler() {
    wateringON = true;
}
//Watering stops
function stopSprinkler() {
    wateringON = false;
}
//sets humifity value to a constant which will be used for further conditions 
function getHumidity() {
    return soilHumidity;
}
//temperature will naturally collide with the values delivered from the init()
function getTemperature() {
    return temperature;
}
//Sets humidity threshold. Value is trivial but should be plausible
function getHumidityThresh() {
    return lowHumThreshold;
}
//delivers the watering mode to use. default means that there is nothing to display in case of special errors or situational circumstances
function getState() {
    switch (state) {
        case States.autoWatering:
            return 'automaticWatering';
        case States.manualWatering:
            return 'manualWatering';
        default:
            return 'nothing to state';
    }
}
//after checking the humidity conditions and the actual state we would have to update the status of the sprinkler if needed
function setState(newState) {
    switch (newState) {
        case States.manualWatering:
            state = States.manualWatering;
            break;
        case States.autoWatering:
            state = States.autoWatering;
        default:
            break;
    }
}
// As th threashold should be set as fiyed. 
//If user identifies the need to change it we would redirect his logic to standard threshold values for humidity. 
//This parameter should be fixed and affected to lowHumThreshold
function setHumidityThresh(newThresh) {
    var threshold_use = newThresh;
    if (newThresh > 100) {
        threshold_use = 0;
    }
    if (newThresh < 0) {
        threshold_use = 0;
    }
    lowHumThreshold = threshold_use;
}
function isItWet() {
    return __awaiter(this, void 0, void 0, function () {
        var forseenParameter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getWeatherforseenParameter()];
                case 1:
                    forseenParameter = _a.sent();
                    if (forseenParameter.minutely[0].precipitation > 0) {
                        return [2 /*return*/, true];
                    }
                    else if (wateringON) {
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
//optional function. could be replaced by an intern timer implementation in the main function. It specifies the drying timer by which we can know whether the sprinkler is needed or not
function untillItDries_s(decr) {
    if (timerForDrying > decr) {
        timerForDrying -= decr;
    }
    else {
        timerForDrying = 0;
    }
}
//optional function. could be replaced by an intern timer implementation in the main function. 
function forseenParameterTimerDecrement(decr) {
    if (timerForcasting > decr) {
        timerForcasting -= decr;
    }
    else {
        timerForcasting = 0;
    }
}
//Based on the current precipitation data and the humidity reached we can determine whether it is essential to use an automatic or manual spinkling mode
function sprinklerStatusChange() {
    return __awaiter(this, void 0, void 0, function () {
        var totalSecsInAday, incrementTimePeriod;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    totalSecsInAday = 86400;
                    incrementTimePeriod = 5;
                    if (!(state == States.autoWatering)) return [3 /*break*/, 3];
                    forseenParameterTimerDecrement(incrementTimePeriod);
                    if (!(timerForcasting == 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, getWeatherforseenParameter()
                        //for the decrementing timer functions above
                    ];
                case 1:
                    forseenParameter = _a.sent();
                    //for the decrementing timer functions above
                    timerForcasting = totalSecsInAday;
                    _a.label = 2;
                case 2:
                    if (soilHumidity < lowHumThreshold) {
                        // second element is tomorrow's weather
                        if (forseenParameter.daily[1].rain > 0 || forseenParameter.daily[1].snow > 0) {
                            stopSprinkler();
                        }
                        else {
                            startSprinkler();
                        }
                    }
                    else if (soilHumidity > hignHumThreshold) {
                        stopSprinkler();
                    }
                    _a.label = 3;
                case 3: return [4 /*yield*/, delay(5000)];
                case 4:
                    _a.sent(),
                        sprinklerStatusChange();
                    return [2 /*return*/];
            }
        });
    });
}
function temperaturePeriodicVariation() {
    return __awaiter(this, void 0, void 0, function () {
        var incrementTimePeriod, tempAmplitude, tempShift, totalSecsInAday;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    incrementTimePeriod = 10;
                    tempAmplitude = 39;
                    tempShift = 20 // to ensure temperature remains between -20 and 60
                    ;
                    totalSecsInAday = 86400;
                    //Sinusoidl function in the form sin((2*pi/T)*t)+S where S allows us to shift the function above for a better and more plausible tmperature variation
                    temperature = tempAmplitude * Math.sin(((2 * Math.PI) / totalSecsInAday) * timeMultiplier) + tempShift;
                    // allows users to test the 10 seconds periodic change of the temperature
                    console.log(temperature);
                    // (Optional) our time incrementation variation scenario. It sets a secure way so that the daily second number does not have to be exceeded. This is optional as we are using a sinusoidal function allowing a periodic change of temperatures
                    // (Essential) time incrementation
                    if (timeMultiplier == totalSecsInAday) {
                        timeMultiplier = 0;
                    }
                    else {
                        timeMultiplier += incrementTimePeriod;
                    }
                    return [4 /*yield*/, delay(incrementTimePeriod * 1000).then(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                temperaturePeriodicVariation();
                                return [2 /*return*/];
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function soilPeriodicChange() {
    return __awaiter(this, void 0, void 0, function () {
        var incrementTimePeriod;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    incrementTimePeriod = 5;
                    untillItDries_s(incrementTimePeriod);
                    return [4 /*yield*/, isItWet()];
                case 1:
                    if (_a.sent()) {
                        timerForDrying = periodToDrying;
                        //Since we are using percentage an interval of plausible humidity values has to be considered.
                        //to avoid any confusion the program sets the value to a minimum or maximum percentage depending on the following scenario
                        //humidity increases by 1 percent every 5 seconds when it is being watered. Any type of rain (or snow/hail) has the exact same rate of increase as watering
                        if (soilHumidity < 100) {
                            soilHumidity++;
                        }
                        else {
                            soilHumidity = 100;
                        }
                    }
                    else {
                        if (timerForDrying == 0) {
                            timerForDrying = periodToDrying;
                            if (temperature > 10 && temperature < 20) {
                                if (soilHumidity > 0) {
                                    soilHumidity--;
                                }
                                else {
                                    soilHumidity = 0;
                                }
                            }
                            else if (temperature > 20 && temperature < 30) {
                                if (soilHumidity > 1) {
                                    soilHumidity -= 2;
                                }
                                else {
                                    soilHumidity = 0;
                                }
                            }
                            else if (temperature > 30) {
                                if (soilHumidity > 3) {
                                    soilHumidity -= 4;
                                }
                                else {
                                    soilHumidity = 0;
                                }
                            }
                        }
                    }
                    return [4 /*yield*/, delay(5000).then(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                soilPeriodicChange();
                                return [2 /*return*/];
                            });
                        }); })];
                case 2:
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
                            thing.setPropertyReadHandler('temperature', function () {
                                return new Promise(function (resolve, reject) {
                                    resolve(Math.round(getTemperature()));
                                });
                            });
                            return [4 /*yield*/, thing.setPropertyReadHandler('soilHumidity', function () {
                                    return new Promise(function (resolve, reject) {
                                        resolve(getHumidity());
                                    });
                                })];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, thing.setPropertyReadHandler('state', function () {
                                    return new Promise(function (resolve, reject) {
                                        resolve(getState());
                                    });
                                })];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, thing.setPropertyWriteHandler('state', function (newState) {
                                    return new Promise(function (resolve, reject) {
                                        resolve(setState(newState));
                                    });
                                })];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, thing.setPropertyWriteHandler('humidityThreshold', function (newThresh) {
                                    return new Promise(function (resolve, reject) {
                                        resolve(setHumidityThresh(newThresh));
                                    });
                                })];
                        case 6:
                            _a.sent();
                            return [4 /*yield*/, thing.setActionHandler('startSprinkler', function (value, options) {
                                    return new Promise(function (resolve, reject) {
                                        startSprinkler();
                                        resolve(setState(States.manualWatering));
                                    });
                                })];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, thing.setActionHandler('stopSprinkler', function (value, options) {
                                    return new Promise(function (resolve, reject) {
                                        stopSprinkler();
                                        resolve(setState(States.manualWatering));
                                    });
                                })];
                        case 8:
                            _a.sent();
                            return [4 /*yield*/, setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
                                    var humidityCheckParam, humCheckThresh;
                                    return __generator(this, function (_a) {
                                        humidityCheckParam = getHumidity();
                                        humCheckThresh = getHumidityThresh();
                                        if (humidityCheckParam < humCheckThresh) {
                                            thing.emitEvent('tooDry', {});
                                        }
                                        else if (humidityCheckParam > 90) {
                                            thing.emitEvent('tooWet', {});
                                        }
                                        return [2 /*return*/];
                                    });
                                }); }, 5000)];
                        case 9:
                            _a.sent();
                            return [4 /*yield*/, thing.expose()];
                        case 10:
                            _a.sent();
                            console.log('Wheather data ready to be tracked.');
                            return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
//program Execution beginns here
fs.readFile("myLovelyGarden.json", function (err, data) { return __awaiter(void 0, void 0, void 0, function () {
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
