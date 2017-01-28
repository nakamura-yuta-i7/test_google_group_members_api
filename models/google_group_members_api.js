var google = require('googleapis');
var googleApi = require("./google_api");

module.exports.list = function(groupKey, callback) {
  googleApi.getAuth(function(err, auth) {
    google.admin('directory_v1').members.list(
      {auth, groupKey},
      function(err, response) {
        if (err) return callback(err, [])
        callback(null, response.members)
      }
    )
  })
}
