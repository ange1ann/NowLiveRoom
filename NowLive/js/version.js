/// <reference path="libs/yepnope.js" />
/// <reference path="libs/lscache.js" />
/*
yepnope([{
    // Load jquery from a 3rd party CDN
    load: '//ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',
    callback: function (url, result, key) {
        // The boss doesn't trust the jQuery CDN, so you have to have a fallback
        // So here you can check if your file really loaded (since callbacks will still
        // fire after an error or a timeout)
        if (!window.jQuery) {
            // Load jQuery from our local server
            // Inject it into the middle of our order of scripts to execute
            // even if other scripts are listed after this one, and are already
            // done loading.
            yepnope('js/libs/jquery-1.7.2.min.js');
        }
    }
}]);
*/

//应用程序版本控制
var appversion = function () {
    var debugMode = false;

    //服务器整体版本号,更新此版本号，将忽略具体版本号，全部脚本更新
    var scriptServerVersion = '0.5';

    //脚本具体版本号，不更新整体版本号时，可对每个具体的脚本进行版本控制
    var version = {
        "yepnope": {
            num: 201208101048,
            path: "js/libs/yepnope.js"
        },
        "jquery": {
            num: 201208101045,
            path: "js/libs/jquery-1.7.2.min.js"
        },
        "handlebars": {
            num: 201208101045,
            path: "js/libs/handlebars-1.0.0.beta.6.js"
        },
        "ember": {
            num: 201208101045,
            path: "js/libs/ember-1.0.pre.js"
        },
        "lscache": {
            num: 201208101045,
            path: "js/libs/lscache.js"
        },
        "app": {
            num: 201208101045,
            path: "js/app.js"
        }
    };

    //获取本地缓存脚本版本，若返回Null, 则需要更新整个版本
    function getServerVersion() {
        return lscache.get('serverVersion');
    }

    //设置本地缓存脚本版本
    function setServerVersion() {
        lscache.set('serverVersion', scriptServerVersion);
    }

    //获取本地单独文件缓存
    function getSingleVersion() {
        return lscache.get('singleVersion');
    }

    //设置本地文件缓存
    function setSingleVersion() {
        lscache.set('singleVersion', version);
    }

    //获取所有资源集合
    function loadResource() {
        var files = [];
        for (var key in version) {
            files.push(version[key].path);
        }
        return files;
    }

    //判断是否需要整体更新
    function isNeedUpdate() {
        if (debugMode) return true;//Debug 模式下进行整体更新
        var localVersion = getServerVersion();
        if (localVersion == null || localVersion < scriptServerVersion) return true;
        return false;
    }

    //判断服务器版本不变的情况下，单独文件是否需要更新
    function isSingleUpdate() {
        var files = [];
        var localVersion = getSingleVersion();
        if (localVersion == null) return loadResource();
        if (localVersion.length != version.length) return loadResource();
        for (var key in localVersion) {
            var local = localVersion[key];
            var server = version[key];
            if (local.num != server.num) {
                files.push(server.path);
            }
        }
        console.log(files);
        return files;
    }

    function filesUpdate(files) {
        setSingleVersion();
        yepnope([{
            load: files,
            callback: function (url) {
                console.log(url + ' is update');
            },
            complete:function () {
                console.log('all files are loaded');
                //  yepnope('js/app.js');
            }
        }]);
    }

    function serverUpdate() {
        lscache.flush();
        setServerVersion();
        filesUpdate(loadResource());
    }

    return {
        //判断是否需要整体更新
        check: function () {
            if (isNeedUpdate()) {
                //update all files
                console.log('isNeedUpdate');
                serverUpdate();
            }
            else {
                var files = isSingleUpdate();
                if (files.length > 0) {
                    //update single files
                    console.log('isSingleUpdate');
                    filesUpdate(files);

                }
            }
        }
    };
}();