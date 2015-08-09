cordova.define("com.jcesarmobile.IDFVPlugin.IDFVPlugin", function(require, exports, module) {  (function(window) {
  var IDFVPlugin = function() {
  
  }
  
  IDFVPlugin.prototype = {
  
    getIdentifier: function(callback, errCallbac) {
        cordova.exec(callback, errCallbac, "IDFVPlugin", "getIdentifier",[]);
    }
  };
  
  cordova.addConstructor(function() {
    window.IDFVPlugin = new IDFVPlugin();
  });
  
})(window);

});
