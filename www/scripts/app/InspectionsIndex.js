

// CommunicationsManager - window level definition used in by library /dto/dtoFramework.js
// Required for all root level viewmodels
var InitComMngr = function(vm) {
    return {
        submitData: function(url, data) {
            // this is the current applicationDataModle (dataManager target) that is saving
            this.data.deepComplete();
            return vm.saveDataToCache();
        }
    }
}