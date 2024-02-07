"use strict";
exports.__esModule = true;
exports.Convert = exports.RecipientType = exports.Operation = exports.AffordanceType = void 0;
var AffordanceType;
(function (AffordanceType) {
    AffordanceType["Action"] = "action";
    AffordanceType["Event"] = "event";
    AffordanceType["Property"] = "property";
})(AffordanceType = exports.AffordanceType || (exports.AffordanceType = {}));
/**
 * op value used for the interaction
 */
var Operation;
(function (Operation) {
    Operation["Invokeaction"] = "invokeaction";
    Operation["Observeproperty"] = "observeproperty";
    Operation["Readallproperties"] = "readallproperties";
    Operation["Readproperty"] = "readproperty";
    Operation["Subscribeevent"] = "subscribeevent";
    Operation["Unobserveproperty"] = "unobserveproperty";
    Operation["Unsubscribeevent"] = "unsubscribeevent";
    Operation["Writeallproperties"] = "writeallproperties";
    Operation["Writeproperty"] = "writeproperty";
    Operation["Readmultipleproperties"] = "readmultipleproperties";
    Operation["Writemultipleproperties"] = "writemultipleproperties";
})(Operation = exports.Operation || (exports.Operation = {}));
/**
 * Types of recipients/receivers of the logged request/response.
 */
var RecipientType;
(function (RecipientType) {
    RecipientType["Controller"] = "controller";
    RecipientType["Thing"] = "thing";
})(RecipientType = exports.RecipientType || (exports.RecipientType = {}));
/**
 * Converts JSON strings to/from your types
 * and asserts the results of JSON.parse at runtime
 */
var Convert = /** @class */ (function () {
    function Convert() {
    }
    Convert.logMessageToJson = function (value) {
        return JSON.stringify(uncast(value, r('LogMessage')), null);
    };
    return Convert;
}());
exports.Convert = Convert;
function invalidValue(val, typ, key) {
    if (key === void 0) { key = ''; }
    throw Error("Invalid value!");
}
function jsToJSONProps(typ) {
    if (typ.jsToJSON === undefined) {
        var map_1 = {};
        typ.props.forEach(function (p) { return (map_1[p.js] = { key: p.json, typ: p.typ }); });
        typ.jsToJSON = map_1;
    }
    return typ.jsToJSON;
}
function transform(val, typ, getProps, key) {
    if (key === void 0) { key = ''; }
    function transformPrimitive(typ, val) {
        if (typeof typ === typeof val)
            return val;
        return invalidValue(typ, val, key);
    }
    function transformUnion(typs, val) {
        var l = typs.length;
        for (var i = 0; i < l; i++) {
            var typ_1 = typs[i];
            try {
                return transform(val, typ_1, getProps);
            }
            catch (_) { }
        }
        return invalidValue(typs, val);
    }
    function transformEnum(cases, val) {
        if (cases.indexOf(val) !== -1)
            return val;
        return invalidValue(cases, val);
    }
    function transformArray(typ, val) {
        // val must be an array with no invalid elements
        if (!Array.isArray(val))
            return invalidValue('array', val);
        return val.map(function (el) { return transform(el, typ, getProps); });
    }
    function transformDate(val) {
        if (val === null) {
            return null;
        }
        var d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue('Date', val);
        }
        return d;
    }
    function transformObject(props, additional, val) {
        if (val === null || typeof val !== 'object' || Array.isArray(val)) {
            return invalidValue('object', val);
        }
        var result = {};
        Object.getOwnPropertyNames(props).forEach(function (key) {
            var prop = props[key];
            var v = Object.prototype.hasOwnProperty.call(val, key)
                ? val[key]
                : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, prop.key);
        });
        Object.getOwnPropertyNames(val).forEach(function (key) {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key);
            }
        });
        return result;
    }
    if (typ === 'any')
        return val;
    if (typ === null) {
        if (val === null)
            return val;
        return invalidValue(typ, val);
    }
    if (typ === false)
        return invalidValue(typ, val);
    while (typeof typ === 'object' && typ.ref !== undefined) {
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ))
        return transformEnum(typ, val);
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
    if (typ === Date && typeof val !== 'number')
        return transformDate(val);
    return transformPrimitive(typ, val);
}
function uncast(val, typ) {
    return transform(val, typ, jsToJSONProps);
}
function a(typ) {
    return { arrayItems: typ };
}
function u() {
    var typs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        typs[_i] = arguments[_i];
    }
    return { unionMembers: typs };
}
function o(props, additional) {
    return { props: props, additional: additional };
}
function m(additional) {
    return { props: [], additional: additional };
}
function r(name) {
    return { ref: name };
}
var typeMap = {
    LogMessage: o([
        { json: 'affordance', js: 'affordance', typ: r('Affordance') },
        { json: 'interactionCounter', js: 'interactionCounter', typ: 0 },
        { json: 'operation', js: 'operation', typ: r('Operation') },
        { json: 'messageId', js: 'messageId', typ: 0 },
        { json: 'payload', js: 'payload', typ: u(undefined, 'any') },
        { json: 'recipient', js: 'recipient', typ: r('Recipient') },
        { json: 'timeStamp', js: 'timeStamp', typ: Date }
    ], false),
    Affordance: o([
        { json: 'name', js: 'name', typ: '' },
        { json: 'type', js: 'type', typ: r('AffordanceType') }
    ], 'any'),
    Recipient: o([
        { json: 'thingId', js: 'thingId', typ: u(undefined, '') },
        { json: 'thingTitle', js: 'thingTitle', typ: u(undefined, '') },
        { json: 'type', js: 'type', typ: u(undefined, r('RecipientType')) }
    ], 'any'),
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
