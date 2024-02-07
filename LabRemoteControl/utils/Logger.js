"use strict";
exports.__esModule = true;
exports.createLogMessage = exports.LoggerTemplate = exports.Logger = void 0;
var LoggerTemplate_1 = require("./LoggerTemplate");
var fs = require("fs");
/**
 * @class A class encapsulating logging functionality.
 */
var Logger = /** @class */ (function () {
    /**
     * @constructor Instantiates a new Logger object
     */
    function Logger() {
        this.interactionCounter = 1;
        this.logs = [];
    }
    /**
     * Logs message to console. Does NOT add it to logs list!
     * @param Message The message to log. Should be instantiated using {@link createLogMessage}
     */
    Logger.prototype.consoleLogMessage = function (Message) {
        Message.interactionCounter = this.interactionCounter;
        var message = LoggerTemplate_1.Convert.logMessageToJson(Message);
        console.info(message);
        this.interactionCounter = this.interactionCounter + 1;
    };
    /**
     * Adds a message to {@link Logger.logs} of the {@link Logger} class.
     * @param Message The message that should be added to the logs array. Should be instantiated using new {@link createLogMessage}
     */
    Logger.prototype.addMessage = function (Message) {
        Message.interactionCounter = this.interactionCounter;
        var jsonMessage = LoggerTemplate_1.Convert.logMessageToJson(Message);
        var new_mess = JSON.stringify(JSON.parse(jsonMessage));
        this.logs.push(new_mess);
        this.interactionCounter = this.interactionCounter + 1;
    };
    /**
     * Saves the messages in the {@link Logger.logs} to a file under  `./Log/${protocol}/${scriptName}.result.json`. This method should be called once after all the messages get added to the logs.
     * @param {string} scriptName The name of the script in which this function is called.
     */
    Logger.prototype.saveMessages = function (scriptName) {
        var output = this.writeAllMessages();
        fs.writeFile("./Log/" + scriptName + ".result.json", output, function (err) {
            if (err) {
                console.error(err);
                return;
            }
        });
    };
    Logger.prototype.writeAllMessages = function () {
        var jsonMessages = this.logs.join(',');
        var output = "[" + jsonMessages + "]";
        return output;
    };
    return Logger;
}());
exports.Logger = Logger;
var LoggerTemplate = /** @class */ (function () {
    function LoggerTemplate(affordance, messageId, operation, recipient, payload) {
        this.interactionCounter = 0;
        this.operation = operation;
        this.affordance = affordance;
        this.payload = payload;
        this.recipient = recipient;
        this.messageId = messageId;
        this.timeStamp = new Date();
    }
    return LoggerTemplate;
}());
exports.LoggerTemplate = LoggerTemplate;
/**
 * Creates a new log message that can then be added to the {@link Logger.logs}
 * @param affordance an object containing the name and type of the affordance
 * @param messageId The id of the message
 * @param operation The operation that is being done
 * @param recipientType The type of request/respones recipient
 * @param thingTitle The title of the thing
 * @param thingId The id of the thing
 * @param payload The payload of request/response
 * @returns A message object
 */
var createLogMessage = function (affordance, messageId, operation, recipientType, thingTitle, thingId, payload) {
    var message = new LoggerTemplate(affordance, messageId, operation, {
        type: recipientType,
        thingTitle: thingTitle,
        thingId: thingId
    }, payload);
    return message;
};
exports.createLogMessage = createLogMessage;
