var async = require("async");
var groupMembers = require("../models/google_group_members_api");

var PARALLEL_REQUEST_COUNT = 300;
var EXECUTE_COUNT = 3;
var testTargetGroupKey = "a-group@gnkmr.com";

var n = 0;
async.whilst(
  function() { return n < EXECUTE_COUNT; },
  function(next) {
    n++;
    membersParallelRequest(
      PARALLEL_REQUEST_COUNT,
      function(err, result) {
        if (err) return next(err);
        // 処理レポート
        console.log("OK数: ",      result.OKs.length );
        console.log("NG数: ",      result.NGs.length );
        console.log("NG種別一覧: ", result.errorKinds.uniq() );
        next();
      }
    );
  },
  function(err) {
    if (err) throw err;
    console.log("complete.");
  }
);



function membersParallelRequest(paralellCount, callback) {
  var i = 0;
  var requestTmpArr = [];
  while( true ) {
    i++;
    // console.log({i});
    requestTmpArr.push({i, func: requestMembers});
    if ( i == PARALLEL_REQUEST_COUNT ) break;
  }
  
  var OKs = [];
  var NGs = [];
  async.each(requestTmpArr, function(data, next) {
    var i = data.i;
    var requestMembers = data.func;
    requestMembers(i, function(err) {
      if (err) {
        NGs.push({i, err});
      } else {
        OKs.push(i);
      }
      next(); 
    });
    
  }, function complete(err) {
    // すべてのリクエストが完了したら
    if (err) {
      // 想定外のエラーがあれば
      return callback(err);
    }
    // 起きたエラーの種類
    var errorKinds = [];
    NGs.forEach(function(data) {
      var err = data.err;
      errorKinds.push(err.message);
    });
    callback(null, {OKs, NGs, errorKinds});
  });
}

function requestMembers(i, callback) {
  groupMembers.list(testTargetGroupKey, function(err, members) {
    // console.log({
    //   i,
    //   err,
    //   // 'err.errors': (function() {
    //   //   if ( ! err ) return "";
    //   //   return err.errors;
    //   // })(),
    //   membersCount: (function() {
    //   return members ? members.length : 0
    // })()});
    callback(err);
  });
}

Array.prototype.uniq = function() {
  tmp = {};tmp_arr = [];
  for( var i=0;i<this.length;i++){tmp[this[i]] = i;}
  for( i in tmp){tmp_arr.push(i);}
  return tmp_arr;
};

