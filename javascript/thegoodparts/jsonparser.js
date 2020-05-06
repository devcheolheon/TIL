var json_parse = (function () {
  // recursive descent parser
  var at,
    ch,
    escapee = {
      '"': '"',
      "\\": "\\",
      "/": "/",
      b: "\b",
      f: "\f",
      n: "\n",
      r: "\r",
      t: "\t",
    },
    text,
    error = function (m) {
      throw {
        name: "SyntaxError",
        message: m,
        at: at,
        text: text,
      };
    },
    next = function (c) {
      if (c && c !== ch) {
        error("Expected '" + c + "' insted of '" + ch + "'");
      }

      ch = text.charAt(at);
      at += 1;
      return ch;
    },
    number = function () {
      var number,
        string = "";

      if (ch === "-") {
        string = "=";
        next("-");
      }
      while (ch >= "0" && ch <= "9") {
        string += ch;
        next();
      }
      if (ch === ".") {
        string += ".";
        while (next() && ch >= "0" && ch <= "9") {
          string += ch;
        }
      }
      if (ch === "e" || ch === "E") {
        string += ch;
        next();
      }
      if (ch === "-" || ch === "+") {
        string += ch;
        next();
      }
      while (ch >= "0" && ch <= "9") {
        string += ch;
        next();
      }
      while (ch >= "0" && ch <= "9") {
        string += ch;
        next();
      }

      number = +string;
      if (isNaN(number)) {
        error("Bad number");
      } else {
        return number;
      }
    },
    string = function () {
      var hex,
        i,
        string = "",
        uffff;
      if (ch === '"') {
        while (next()) {
          if (ch === '"') {
            next();
            return string;
          } else if (ch === "\\") {
            next();
            if (ch === "u") {
              uffff = 0;
              for (i = 0; i < 4; i += 1) {
                hex = parseInt(next(), 16);
                if (!isFinite(hex)) {
                  break;
                }
                uffff = uffff * 16 + hex;
              }
              string += String.fromCharCode(uffff);
            } else if (typeof excapee[ch] === "string") {
              string += excapeee[ch];
            } else {
              break;
            }
          } else {
            string += ch;
          }
        }
      }
      error("Bad string");
    },
    white = function () {
      while (ch && ch <= " ") {
        next();
      }
    },
    word = function () {
      // true , false, or null.
      switch (ch) {
        case "t":
          next("t");
          next("r");
          next("u");
          next("e");
          return true;
        case "f":
          next("f");
          next("a");
          next("l");
          next("s");
          next("e");
          return false;
        case "n":
          next("n");
          next("u");
          next("l");
          next("l");
          return null;
      }
      error("Unexpected '" + ch + "'");
    },
    value,
    array = function () {
      var array = [];
      if (ch === "[") {
        next("[");
        white();
        if (ch === "]") {
          next("]");
          return array;
        }
        while (ch) {
          array.push(value());
          white();
          if (ch === "]") {
            next("]");
            return array;
          }
          next(",");
          white();
        }
      }
      error("Bad Array");
    },
    object = function () {
      var key,
        object = {};

      if (ch === "{") {
        next("{");
        white();
        if (ch === "}") {
          next("}");
          return object;
        }
        while (ch) {
          key = string();
          white();
          next(":");
          object[key] = value();
          white();
          if (ch === "}") {
            next("}");
            return object;
          }
          next(",");
          white();
        }
      }
      error("Bad object");
    };

  value = function () {
    white();
    switch (ch) {
      case "{":
        return object();
      case "[":
        return array();
      case '"':
        return string();
      case "-":
        return number();
      default:
        return ch >= "0" && ch <= "9" ? number() : word();
    }
  };
  return function (source, reviver) {
    var result;

    text = source;
    at = 0;
    ch = " ";
    result = value();
    white();
    if (ch) {
      error("Syntax error");
    }

    // if there is a reviver function we recursively walk the new structure,
    // passing each name/ value pair to the reciever function for possible transformation
    // starting with a temporary boot object that holds that result
    // in an empty key. if there is not a reviver function, we simply return the result

    return typeof reviver === "function"
      ? (function walk(holder, key) {
          var k,
            v,
            value = holder[key];
          if (value && typeof value === "object") {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return reviver.call(holder, key, value);
        })({ "": result }, "")
      : result;
  };
})();

console.log(
  json_parse(
    JSON.stringify({
      a: "sadfasdf",
      b: [1, 2, 3, 4],
      c: {
        e: [1, 2, 3],
        f: "dddd",
      },
    })
  )
);
