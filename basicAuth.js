const auth = require('basic-auth');
const compare = require("tsscmp");
const userDb = require("./userpw.json")

const basicAuth = (req, res, next) => {
  const credentials = auth(req);

  if (credentials && check(credentials.name, credentials.pass)) {
    return next();
  }
  res.statusCode = 401
  res.setHeader('WWW-Authenticate', 'Basic realm="example"')
  res.end('Access denied')
};

   

  
/*
Add a file called userpw.json to the root of the project after cloning with this content:
{
  "name":"XXXXXXX",
  "pass":"YYYYYYY"
}
*/
function check(name, pass) {
  var valid = true

  // Simple method to prevent short-circut and use timing-safe compare
  valid = compare(name, userDb.name)
  valid = compare(pass, userDb.pass) && valid

  return valid
}

module.exports = basicAuth;