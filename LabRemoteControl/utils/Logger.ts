import {
  Message,
  Convert,
  Affordance,
  Operation,
  Recipient,
  RecipientType
} from './LoggerTemplate';
import * as fs from 'fs';


/**
 * @class A class encapsulating logging functionality.
 */
export class Logger {
  interactionCounter: number;
  logs: Array<string>;
  /**
   * @constructor Instantiates a new Logger object
   */
  constructor() {
    this.interactionCounter = 1;
    this.logs = [];
  }

  /**
   * Logs message to console. Does NOT add it to logs list!
   * @param Message The message to log. Should be instantiated using {@link createLogMessage}
   */
  consoleLogMessage(Message: Message) {
    Message.interactionCounter = this.interactionCounter;
    const message = Convert.logMessageToJson(Message);
    console.info(message);
    this.interactionCounter = this.interactionCounter + 1;
  }
  /**
   * Adds a message to {@link Logger.logs} of the {@link Logger} class. 
   * @param Message The message that should be added to the logs array. Should be instantiated using new {@link createLogMessage}
   */
  addMessage(Message: Message) {
    Message.interactionCounter = this.interactionCounter;
    const jsonMessage = Convert.logMessageToJson(Message);
    const new_mess = JSON.stringify(JSON.parse(jsonMessage));
    this.logs.push(new_mess);
    this.interactionCounter = this.interactionCounter + 1;
  }
  /**
   * Saves the messages in the {@link Logger.logs} to a file under  `./Log/${protocol}/${scriptName}.result.json`. This method should be called once after all the messages get added to the logs.
   * @param {string} scriptName The name of the script in which this function is called.
   */
  saveMessages(scriptName: string) {
    const output = this.writeAllMessages();
    fs.writeFile(
      `./Log/${scriptName}.result.json`,
      output,
      (err): void => {
        if (err) {
          console.error(err);
          return;
        }
      });
  }

  private writeAllMessages() {
    const jsonMessages = this.logs.join(',');
    const output = `[${jsonMessages}]`;
    return output;
  }
}

export class LoggerTemplate implements Message {
  constructor(
    affordance: Affordance,
    messageId: number,
    operation: Operation,
    recipient: Recipient,
    payload?: any
  ) {
    this.interactionCounter = 0;
    this.operation = operation;
    this.affordance = affordance;
    this.payload = payload;
    this.recipient = recipient;
    this.messageId = messageId;
    this.timeStamp = new Date();
  }
  interactionCounter: number;
  operation: Operation;
  affordance: Affordance;
  payload?: any;
  recipient: Recipient;
  messageId: number;
  timeStamp: Date;
}

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
export const createLogMessage = (
  affordance: Affordance,
  messageId: number,
  operation: Operation,
  recipientType: RecipientType,
  thingTitle?: string,
  thingId?: string,
  payload?: any
): LoggerTemplate => {
  const message = new LoggerTemplate(
    affordance,
    messageId,
    operation,
    {
      type: recipientType,
      thingTitle: thingTitle,
      thingId: thingId
    },
    payload
  );
  return message;
};
