

export interface Message {
  /**
   * Type of Affordance and name
   */
  affordance: Affordance;
  /**
   * A simple counter that should be incremented at each message of an operation
   */
  interactionCounter: number;
  /**
   * ID of a request/response pair or a single request
   */
  messageId: number;
  /**
   * op value used for the interaction
   */
  operation: Operation;
  /**
   * Payload supplied or returned serialized into JSON
   */
  payload?: any;
  /**
   * Thing that receives the message or Mashup controller
   */
  recipient: Recipient;
  /**
   * Time registered when message was sent or received
   */
  timeStamp: Date;
}

/**
 * Type of Affordance and name
 * @property {string} name Name of the affordance
 * @property {AffordanceType} type Type of the affordance - see: {@link AffordanceType}
 */ 
export interface Affordance {
  /**
   * Name of the affordance as the key in the JSON
   */
  name: string;
  type: AffordanceType;
}

export enum AffordanceType {
  Action = 'action',
  Event = 'event',
  Property = 'property'
}

/**
 * op value used for the interaction
 */
export enum Operation {
  Invokeaction = 'invokeaction',
  Observeproperty = 'observeproperty',
  Readallproperties = 'readallproperties',
  Readproperty = 'readproperty',
  Subscribeevent = 'subscribeevent',
  Unobserveproperty = 'unobserveproperty',
  Unsubscribeevent = 'unsubscribeevent',
  Writeallproperties = 'writeallproperties',
  Writeproperty = 'writeproperty',
  Readmultipleproperties = 'readmultipleproperties',
  Writemultipleproperties = 'writemultipleproperties'
}

/**
 * Thing that receives the message or Mashup controller
 * @property {string} [thingId] The id of the recipient
 * @property {string} [thingTitle] The title of the recipient
 * @property {RecipientType} [type] The type of the recipient - see: {@link RecipientType}
 */
export interface Recipient {
  /**
   * id field found in the TD
   */
  thingId?: string;
  /**
   * title field found in the TD
   */
  thingTitle?: string;
  type?: RecipientType;
}

/**
 * Types of recipients/receivers of the logged request/response.
 */
export enum RecipientType {
  Controller = 'controller',
  Thing = 'thing'
}

/** 
 * Converts JSON strings to/from your types
 * and asserts the results of JSON.parse at runtime
 */ 
export class Convert {
  public static logMessageToJson(value: Message): string {
    return JSON.stringify(uncast(value, r('LogMessage')), null);
  }
}

function invalidValue(val: any, typ: any, key: any = ''): never {
  throw Error(`Invalid value!`);
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
     // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue('array', val);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue('Date', val);
    }
    return d;
  }

  function transformObject(
    props: { [k: string]: any },
    additional: any,
    val: any
  ): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue('object', val);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key)
        ? val[key]
        : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, prop.key);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === 'object' && typ.ref !== undefined) {
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props')
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  LogMessage: o(
    [
      { json: 'affordance', js: 'affordance', typ: r('Affordance') },
      { json: 'interactionCounter', js: 'interactionCounter', typ: 0 },
      { json: 'operation', js: 'operation', typ: r('Operation')},
      { json: 'messageId', js: 'messageId', typ: 0 },
      { json: 'payload', js: 'payload', typ: u(undefined, 'any') },
      { json: 'recipient', js: 'recipient', typ: r('Recipient') },
      { json: 'timeStamp', js: 'timeStamp', typ: Date }
    ],
    false
  ),
  Affordance: o(
    [
      { json: 'name', js: 'name', typ: '' },
      { json: 'type', js: 'type', typ: r('AffordanceType') }
    ],
    'any'
  ),
  Recipient: o(
    [
      { json: 'thingId', js: 'thingId', typ: u(undefined, '') },
      { json: 'thingTitle', js: 'thingTitle', typ: u(undefined, '') },
      { json: 'type', js: 'type', typ: u(undefined, r('RecipientType')) }
    ],
    'any'
  ),
  AffordanceType: ['action', 'event', 'property'],
  Operation: [
    'invokeaction',
    'observeproperty',
    'readallproperties',
    'readmultipleproperties',
    'readproperty',
    'subscribeevent',
    'unobserveproperty',
    'unsubscribeevent',
    'writeallproperties',
    'writemultipleproperties',
    'writeproperty'
  ],
  RecipientType: ['controller', 'thing']
};
