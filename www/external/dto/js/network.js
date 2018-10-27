function networkCall() {
    var self = this;
    self.defaultTimeout = 60000;

    self.getJSON = function (url, data, cache) {
        if (cache === null || cache === undefined)
            cache = false;
        return new Promise(function (resolve, reject) {
            $.ajax({
                dataType: "json",
                cache: cache,
                url: url,
                data: data || {},
                timeout: self.defaultTimeout,
                success: function (data) {
                    resolve(data);
                },
                error: function (err) {
                    reject(new Error(err));
                }
            });
        });
    };

    self.post = function (url, data, blocking) {
        return new Promise(function (resolve, reject) {
            // var securityToken = document.getElementById("RequestValidationToken") ? document.getElementById("RequestValidationToken").value : null;
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                // headers: { 'X-request-validation-token': securityToken },
                timeout: this.defaultTimeout,
                success: function (data) {
                    resolve(data);
                },
                error: function (errorData) {
                    reject(new Error(errorData));
                }
            });
        });
    }


    self.postFile = function (url, data) {
        return new Promise(function (resolve, reject) {
            // var securityToken = document.getElementById("RequestValidationToken") ? document.getElementById("RequestValidationToken").value : null;
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                traditional: true,
                contentType: false,
                processData: false,
                headers: {
                    // 'X-request-validation-token': securityToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                timeout: this.defaultTimeout,
                success: function (data) {
                    resolve(data);
                },
                error: function (errorData) {
                    reject(new Error(errorData));
                }
            });
        });
    }

    self.parseFile = function (file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            fileContent = {
                contents: e.target.result,
                name: file.name,
                type: file.type
            };
            callback(fileContent);
        };
        reader.readAsDataURL(file);
    }

    self.fileUpload = function (url, file, callback) {
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            //&& file.type == "image/jpeg"
            xhr.responseType = 'json';
            // create progress bar
            //var o = $id("progress");
            //var progress = o.appendChild(document.createElement("p"));
            //progress.appendChild(document.createTextNode("upload " + file.name));


            // progress bar
            //if (progressObservable) {
            //    xhr.upload.addEventListener("progress", function (e) {
            //        var pc = parseInt(100 - (e.loaded / e.total * 100));
            //        console.log(pc);
            //        progressObservable(pc);
            //    }, false);
            //}


            // file received/failed
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState == 4) {
                    callback(xhr.response);
                }
            }
        }

        // start upload
        var formData = new FormData();
        formData.append("file", file);
        xhr.open("POST", url, true);
        xhr.setRequestHeader("X_FILENAME", file.name);
        xhr.send(formData);
    }


    self.getFilePost = function (url, params) {
        Inspections.startLoad();
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.responseType = 'arraybuffer';

        var securityToken = document.getElementById("RequestValidationToken");
        if (securityToken) {
            xhr.setRequestHeader('X-request-validation-token', securityToken.value);
        }

        xhr.onload = function () {
            Inspections.endLoad();
            if (this.status === 200) {
                var filename = "";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var type = xhr.getResponseHeader('Content-Type');

                var blob = new Blob([this.response], { type: type });
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
                    window.navigator.msSaveBlob(blob, filename);
                } else {
                    var URL = window.URL || window.webkitURL;
                    var downloadUrl = URL.createObjectURL(blob);

                    if (filename) {
                        // use HTML5 a[download] attribute to specify filename
                        var a = document.createElement("a");
                        // safari doesn't support this yet
                        if (typeof a.download === 'undefined') {
                            window.location = downloadUrl;
                        } else {
                            a.href = downloadUrl;
                            a.download = filename;
                            document.body.appendChild(a);
                            a.click();
                        }
                    } else {
                        window.location = downloadUrl;
                    }

                    setTimeout(function () { URL.revokeObjectURL(downloadUrl); }, 100); // cleanup
                }
            }
        };



        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.send($.param(params));
    };
};