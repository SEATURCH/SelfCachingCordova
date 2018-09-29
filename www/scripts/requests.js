// Requests Api Page
var domain = "http://10.21.10.104:59360";


var getTemplates = function () {
	return Promise.all([
		powertech.post(domain + "/Template/Templates", {}),
		powertech.post(domain + "/Template/ModelConfig", {})
	]).then(function(values){
		return {
			html: values[0],
			json: values[1]
		}
	});
};
var getVersion = function () {
    return powertech.post(domain + "/Template/Version", {});
};

var upload = function () {
    return powertech.post(domain + "/Template/Version", {});
};

var download = function () {
    return powertech.post(domain + "/Template/SampleData", {});
};

module.exports = {
	getTemplates: getTemplates,
	getVersion: getVersion,
	download: download,
	upload: upload
}