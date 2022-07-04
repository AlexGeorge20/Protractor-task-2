var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var convertTimestamp = function (timestamp) {
    var d = new Date(timestamp),
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),
        dd = ('0' + d.getDate()).slice(-2),
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),
        ampm = 'AM',
        time;

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh === 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

    return time;
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    } else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    } else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};

//</editor-fold>

app.controller('ScreenshotReportController', ['$scope', '$http', 'TitleService', function ($scope, $http, titleService) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    this.warningTime = 1400;
    this.dangerTime = 1900;
    this.totalDurationFormat = clientDefaults.totalDurationFormat;
    this.showTotalDurationIn = clientDefaults.showTotalDurationIn;

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
        if (initialColumnSettings.warningTime) {
            this.warningTime = initialColumnSettings.warningTime;
        }
        if (initialColumnSettings.dangerTime) {
            this.dangerTime = initialColumnSettings.dangerTime;
        }
    }


    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };
    this.hasNextScreenshot = function (index) {
        var old = index;
        return old !== this.getNextScreenshotIdx(index);
    };

    this.hasPreviousScreenshot = function (index) {
        var old = index;
        return old !== this.getPreviousScreenshotIdx(index);
    };
    this.getNextScreenshotIdx = function (index) {
        var next = index;
        var hit = false;
        while (next + 2 < this.results.length) {
            next++;
            if (this.results[next].screenShotFile && !this.results[next].pending) {
                hit = true;
                break;
            }
        }
        return hit ? next : index;
    };

    this.getPreviousScreenshotIdx = function (index) {
        var prev = index;
        var hit = false;
        while (prev > 0) {
            prev--;
            if (this.results[prev].screenShotFile && !this.results[prev].pending) {
                hit = true;
                break;
            }
        }
        return hit ? prev : index;
    };

    this.convertTimestamp = convertTimestamp;


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };

    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.totalDuration = function () {
        var sum = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.duration) {
                sum += result.duration;
            }
        }
        return sum;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };


    var results = [
    {
        "description": "Pin and login|Amazon",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 338678,
        "browser": {
            "name": "chrome",
            "version": "103.0.5060.53"
        },
        "message": [
            "Expected 'Select your address' to match 'Thiruvana... 695004'.",
            "Failed: element click intercepted: Element <a href=\"https://www.amazon.in/ap/signin?openid.pape.max_auth_age=0&amp;openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3Fref_%3Dnav_ya_signin&amp;openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&amp;openid.assoc_handle=inflex&amp;openid.mode=checkid_setup&amp;openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&amp;openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&amp;\" class=\"nav-a nav-a-2   nav-progressive-attribute\" data-nav-ref=\"nav_ya_signin\" data-nav-role=\"signin\" data-ux-jq-mouseenter=\"true\" id=\"nav-link-accountList\" tabindex=\"0\" data-csa-c-type=\"link\" data-csa-c-slot-id=\"nav-link-accountList\" data-csa-c-content-id=\"nav_ya_signin\" data-csa-c-id=\"mwt9jw-oa7kn1-s3katc-114rc4\">...</a> is not clickable at point (791, 30). Other element would receive the click: <div class=\"a-modal-scroller a-declarative\" data-action=\"a-popover-floating-close\" style=\"padding-bottom: 0px; visibility: visible;\">...</div>\n  (Session info: chrome=103.0.5060.53)\n  (Driver info: chromedriver=103.0.5060.53 (a1711811edd74ff1cf2150f36ffa3b0dae40b17f-refs/branch-heads/5060@{#853}),platform=Linux 5.13.0-51-generic x86_64)"
        ],
        "trace": [
            "Error: Failed expectation\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:46:18)\n    at Generator.next (<anonymous>)\n    at fulfilled (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)",
            "WebDriverError: element click intercepted: Element <a href=\"https://www.amazon.in/ap/signin?openid.pape.max_auth_age=0&amp;openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3Fref_%3Dnav_ya_signin&amp;openid.identity=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&amp;openid.assoc_handle=inflex&amp;openid.mode=checkid_setup&amp;openid.claimed_id=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0%2Fidentifier_select&amp;openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&amp;\" class=\"nav-a nav-a-2   nav-progressive-attribute\" data-nav-ref=\"nav_ya_signin\" data-nav-role=\"signin\" data-ux-jq-mouseenter=\"true\" id=\"nav-link-accountList\" tabindex=\"0\" data-csa-c-type=\"link\" data-csa-c-slot-id=\"nav-link-accountList\" data-csa-c-content-id=\"nav_ya_signin\" data-csa-c-id=\"mwt9jw-oa7kn1-s3katc-114rc4\">...</a> is not clickable at point (791, 30). Other element would receive the click: <div class=\"a-modal-scroller a-declarative\" data-action=\"a-popover-floating-close\" style=\"padding-bottom: 0px; visibility: visible;\">...</div>\n  (Session info: chrome=103.0.5060.53)\n  (Driver info: chromedriver=103.0.5060.53 (a1711811edd74ff1cf2150f36ffa3b0dae40b17f-refs/branch-heads/5060@{#853}),platform=Linux 5.13.0-51-generic x86_64)\n    at Object.checkLegacyResponse (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebElement.click()\n    at Driver.schedule (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at WebElement.schedule_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:2010:25)\n    at WebElement.click (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:2092:17)\n    at actionFn (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:89:44)\n    at Array.map (<anonymous>)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:461:65\n    at ManagedPromise.invokeCallback_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2927:27Error\n    at ElementArrayFinder.applyAction_ (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:91:29)\n    at ElementFinder.<computed> [as click] (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:831:22)\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:48:50)\n    at Generator.next (<anonymous>)\n    at fulfilled (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Pin and login\") in control flow\n    at UserContext.<anonymous> (/home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:8:3)\n    at addSpecsToSuite (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:3:1)\n    at Module._compile (node:internal/modules/cjs/loader:1103:14)\n    at Module.m._compile (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1597:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1155:10)\n    at Object.require.extensions.<computed> [as .ts] (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1600:12)"
        ],
        "browserLogs": [
            {
                "level": "WARNING",
                "message": "security - Error with Permissions-Policy header: Origin trial controlled feature not enabled: 'interest-cohort'.",
                "timestamp": 1656928276949,
                "type": ""
            },
            {
                "level": "SEVERE",
                "message": "https://www.amazon.in/gp/product/sessionCacheUpdateHandler.html - Failed to load resource: the server responded with a status of 404 ()",
                "timestamp": 1656928278356,
                "type": ""
            }
        ],
        "screenShotFile": "00a40085-005c-000b-0049-008b0098009b.png",
        "timestamp": 1656928276650,
        "duration": 8384
    },
    {
        "description": "Searchbar & loop pg|Amazon",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 338678,
        "browser": {
            "name": "chrome",
            "version": "103.0.5060.53"
        },
        "message": [
            "Failed: element click intercepted: Element <input id=\"nav-search-submit-button\" type=\"submit\" class=\"nav-input nav-progressive-attribute\" value=\"Go\" tabindex=\"0\"> is not clickable at point (640, 30). Other element would receive the click: <div class=\"a-modal-scroller a-declarative\" data-action=\"a-popover-floating-close\" style=\"padding-bottom: 0px; visibility: visible;\">...</div>\n  (Session info: chrome=103.0.5060.53)\n  (Driver info: chromedriver=103.0.5060.53 (a1711811edd74ff1cf2150f36ffa3b0dae40b17f-refs/branch-heads/5060@{#853}),platform=Linux 5.13.0-51-generic x86_64)"
        ],
        "trace": [
            "WebDriverError: element click intercepted: Element <input id=\"nav-search-submit-button\" type=\"submit\" class=\"nav-input nav-progressive-attribute\" value=\"Go\" tabindex=\"0\"> is not clickable at point (640, 30). Other element would receive the click: <div class=\"a-modal-scroller a-declarative\" data-action=\"a-popover-floating-close\" style=\"padding-bottom: 0px; visibility: visible;\">...</div>\n  (Session info: chrome=103.0.5060.53)\n  (Driver info: chromedriver=103.0.5060.53 (a1711811edd74ff1cf2150f36ffa3b0dae40b17f-refs/branch-heads/5060@{#853}),platform=Linux 5.13.0-51-generic x86_64)\n    at Object.checkLegacyResponse (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/error.js:546:15)\n    at parseHttpResponse (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/http.js:509:13)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/http.js:441:30\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: WebElement.click()\n    at Driver.schedule (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:807:17)\n    at WebElement.schedule_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:2010:25)\n    at WebElement.click (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:2092:17)\n    at actionFn (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:89:44)\n    at Array.map (<anonymous>)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:461:65\n    at ManagedPromise.invokeCallback_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2927:27Error\n    at ElementArrayFinder.applyAction_ (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:459:27)\n    at ElementArrayFinder.<computed> [as click] (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:91:29)\n    at ElementFinder.<computed> [as click] (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/element.js:831:22)\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:74:54)\n    at Generator.next (<anonymous>)\n    at fulfilled (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:5:58)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: Run it(\"Searchbar & loop pg\") in control flow\n    at UserContext.<anonymous> (/home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:67:3)\n    at addSpecsToSuite (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:3:1)\n    at Module._compile (node:internal/modules/cjs/loader:1103:14)\n    at Module.m._compile (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1597:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1155:10)\n    at Object.require.extensions.<computed> [as .ts] (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1600:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "0085004f-00fc-00d5-0029-00c100a300d6.png",
        "timestamp": 1656928285203,
        "duration": 1229
    },
    {
        "description": "cick 1st item,prdt name|Amazon",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 338678,
        "browser": {
            "name": "chrome",
            "version": "103.0.5060.53"
        },
        "message": [
            "Failed: Wait timed out after 10004ms"
        ],
        "trace": [
            "TimeoutError: Wait timed out after 10004ms\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2201:17\n    at ManagedPromise.invokeCallback_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: <anonymous wait>\n    at scheduleWait (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2188:20)\n    at ControlFlow.wait (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2517:12)\n    at Driver.wait (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:934:29)\n    at run (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/browser.js:58:33)\n    at ProtractorBrowser.to.<computed> [as wait] (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/browser.js:66:16)\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:111:19)\n    at Generator.next (<anonymous>)\n    at /home/ntpl/Desktop/end-2-end-project/src/amazon.ts:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:4:12)\nFrom: Task: Run it(\"cick 1st item,prdt name\") in control flow\n    at UserContext.<anonymous> (/home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:110:3)\n    at addSpecsToSuite (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:3:1)\n    at Module._compile (node:internal/modules/cjs/loader:1103:14)\n    at Module.m._compile (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1597:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1155:10)\n    at Object.require.extensions.<computed> [as .ts] (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1600:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "00b30044-0013-001a-0087-000800260029.png",
        "timestamp": 1656928286623,
        "duration": 10007
    },
    {
        "description": "Add to cart & check|Amazon",
        "passed": false,
        "pending": false,
        "os": "Linux",
        "instanceId": 338678,
        "browser": {
            "name": "chrome",
            "version": "103.0.5060.53"
        },
        "message": [
            "Failed: Wait timed out after 10004ms"
        ],
        "trace": [
            "TimeoutError: Wait timed out after 10004ms\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2201:17\n    at ManagedPromise.invokeCallback_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:1376:14)\n    at TaskQueue.execute_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3084:14)\n    at TaskQueue.executeNext_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:3067:27)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2927:27\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:668:7\n    at runMicrotasks (<anonymous>)\n    at processTicksAndRejections (node:internal/process/task_queues:96:5)\nFrom: Task: <anonymous wait>\n    at scheduleWait (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2188:20)\n    at ControlFlow.wait (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2517:12)\n    at Driver.wait (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/webdriver.js:934:29)\n    at run (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/browser.js:58:33)\n    at ProtractorBrowser.to.<computed> [as wait] (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/built/browser.js:66:16)\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:151:19)\n    at Generator.next (<anonymous>)\n    at /home/ntpl/Desktop/end-2-end-project/src/amazon.ts:8:71\n    at new Promise (<anonymous>)\n    at __awaiter (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:4:12)\nFrom: Task: Run it(\"Add to cart & check\") in control flow\n    at UserContext.<anonymous> (/home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:94:19)\n    at attempt (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4297:26)\n    at QueueRunner.run (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4217:20)\n    at runNext (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4257:20)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4264:13\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4172:9\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/jasminewd2/index.js:64:48\n    at ControlFlow.emit (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/events.js:62:21)\n    at ControlFlow.shutdown_ (/home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2674:10)\n    at /home/ntpl/Desktop/end-2-end-project/node_modules/selenium-webdriver/lib/promise.js:2599:53\nFrom asynchronous test: \nError\n    at Suite.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:150:2)\n    at addSpecsToSuite (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1107:25)\n    at Env.describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:1074:7)\n    at describe (/home/ntpl/Desktop/end-2-end-project/node_modules/protractor/node_modules/jasmine-core/lib/jasmine-core/jasmine.js:4399:18)\n    at Object.<anonymous> (/home/ntpl/Desktop/end-2-end-project/src/amazon.ts:3:1)\n    at Module._compile (node:internal/modules/cjs/loader:1103:14)\n    at Module.m._compile (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1597:23)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1155:10)\n    at Object.require.extensions.<computed> [as .ts] (/home/ntpl/Desktop/end-2-end-project/node_modules/ts-node/src/index.ts:1600:12)"
        ],
        "browserLogs": [],
        "screenShotFile": "00630070-0011-0099-007a-008400a000d7.png",
        "timestamp": 1656928296833,
        "duration": 10006
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});

    };

    this.setTitle = function () {
        var title = $('.report-title').text();
        titleService.setTitle(title);
    };

    // is run after all test data has been prepared/loaded
    this.afterLoadingJobs = function () {
        this.sortSpecs();
        this.setTitle();
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    } else {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.afterLoadingJobs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.afterLoadingJobs();
    }

}]);

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

//formats millseconds to h m s
app.filter('timeFormat', function () {
    return function (tr, fmt) {
        if(tr == null){
            return "NaN";
        }

        switch (fmt) {
            case 'h':
                var h = tr / 1000 / 60 / 60;
                return "".concat(h.toFixed(2)).concat("h");
            case 'm':
                var m = tr / 1000 / 60;
                return "".concat(m.toFixed(2)).concat("min");
            case 's' :
                var s = tr / 1000;
                return "".concat(s.toFixed(2)).concat("s");
            case 'hm':
            case 'h:m':
                var hmMt = tr / 1000 / 60;
                var hmHr = Math.trunc(hmMt / 60);
                var hmMr = hmMt - (hmHr * 60);
                if (fmt === 'h:m') {
                    return "".concat(hmHr).concat(":").concat(hmMr < 10 ? "0" : "").concat(Math.round(hmMr));
                }
                return "".concat(hmHr).concat("h ").concat(hmMr.toFixed(2)).concat("min");
            case 'hms':
            case 'h:m:s':
                var hmsS = tr / 1000;
                var hmsHr = Math.trunc(hmsS / 60 / 60);
                var hmsM = hmsS / 60;
                var hmsMr = Math.trunc(hmsM - hmsHr * 60);
                var hmsSo = hmsS - (hmsHr * 60 * 60) - (hmsMr*60);
                if (fmt === 'h:m:s') {
                    return "".concat(hmsHr).concat(":").concat(hmsMr < 10 ? "0" : "").concat(hmsMr).concat(":").concat(hmsSo < 10 ? "0" : "").concat(Math.round(hmsSo));
                }
                return "".concat(hmsHr).concat("h ").concat(hmsMr).concat("min ").concat(hmsSo.toFixed(2)).concat("s");
            case 'ms':
                var msS = tr / 1000;
                var msMr = Math.trunc(msS / 60);
                var msMs = msS - (msMr * 60);
                return "".concat(msMr).concat("min ").concat(msMs.toFixed(2)).concat("s");
        }

        return tr;
    };
});


function PbrStackModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;
    ctrl.convertTimestamp = convertTimestamp;
    ctrl.isValueAnArray = isValueAnArray;
    ctrl.toggleSmartStackTraceHighlight = function () {
        var inv = !ctrl.rootScope.showSmartStackTraceHighlight;
        ctrl.rootScope.showSmartStackTraceHighlight = inv;
    };
    ctrl.applySmartHighlight = function (line) {
        if ($rootScope.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return '';
    };
}


app.component('pbrStackModal', {
    templateUrl: "pbr-stack-modal.html",
    bindings: {
        index: '=',
        data: '='
    },
    controller: PbrStackModalController
});

function PbrScreenshotModalController($scope, $rootScope) {
    var ctrl = this;
    ctrl.rootScope = $rootScope;
    ctrl.getParent = getParent;
    ctrl.getShortDescription = getShortDescription;

    /**
     * Updates which modal is selected.
     */
    this.updateSelectedModal = function (event, index) {
        var key = event.key; //try to use non-deprecated key first https://developer.mozilla.org/de/docs/Web/API/KeyboardEvent/keyCode
        if (key == null) {
            var keyMap = {
                37: 'ArrowLeft',
                39: 'ArrowRight'
            };
            key = keyMap[event.keyCode]; //fallback to keycode
        }
        if (key === "ArrowLeft" && this.hasPrevious) {
            this.showHideModal(index, this.previous);
        } else if (key === "ArrowRight" && this.hasNext) {
            this.showHideModal(index, this.next);
        }
    };

    /**
     * Hides the modal with the #oldIndex and shows the modal with the #newIndex.
     */
    this.showHideModal = function (oldIndex, newIndex) {
        const modalName = '#imageModal';
        $(modalName + oldIndex).modal("hide");
        $(modalName + newIndex).modal("show");
    };

}

app.component('pbrScreenshotModal', {
    templateUrl: "pbr-screenshot-modal.html",
    bindings: {
        index: '=',
        data: '=',
        next: '=',
        previous: '=',
        hasNext: '=',
        hasPrevious: '='
    },
    controller: PbrScreenshotModalController
});

app.factory('TitleService', ['$document', function ($document) {
    return {
        setTitle: function (title) {
            $document[0].title = title;
        }
    };
}]);


app.run(
    function ($rootScope, $templateCache) {
        //make sure this option is on by default
        $rootScope.showSmartStackTraceHighlight = true;
        
  $templateCache.put('pbr-screenshot-modal.html',
    '<div class="modal" id="imageModal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="imageModalLabel{{$ctrl.index}}" ng-keydown="$ctrl.updateSelectedModal($event,$ctrl.index)">\n' +
    '    <div class="modal-dialog modal-lg m-screenhot-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="imageModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="imageModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <img class="screenshotImage" ng-src="{{$ctrl.data.screenShotFile}}">\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <div class="pull-left">\n' +
    '                    <button ng-disabled="!$ctrl.hasPrevious" class="btn btn-default btn-previous" data-dismiss="modal"\n' +
    '                            data-toggle="modal" data-target="#imageModal{{$ctrl.previous}}">\n' +
    '                        Prev\n' +
    '                    </button>\n' +
    '                    <button ng-disabled="!$ctrl.hasNext" class="btn btn-default btn-next"\n' +
    '                            data-dismiss="modal" data-toggle="modal"\n' +
    '                            data-target="#imageModal{{$ctrl.next}}">\n' +
    '                        Next\n' +
    '                    </button>\n' +
    '                </div>\n' +
    '                <a class="btn btn-primary" href="{{$ctrl.data.screenShotFile}}" target="_blank">\n' +
    '                    Open Image in New Tab\n' +
    '                    <span class="glyphicon glyphicon-new-window" aria-hidden="true"></span>\n' +
    '                </a>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

  $templateCache.put('pbr-stack-modal.html',
    '<div class="modal" id="modal{{$ctrl.index}}" tabindex="-1" role="dialog"\n' +
    '     aria-labelledby="stackModalLabel{{$ctrl.index}}">\n' +
    '    <div class="modal-dialog modal-lg m-stack-modal" role="document">\n' +
    '        <div class="modal-content">\n' +
    '            <div class="modal-header">\n' +
    '                <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n' +
    '                    <span aria-hidden="true">&times;</span>\n' +
    '                </button>\n' +
    '                <h6 class="modal-title" id="stackModalLabelP{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getParent($ctrl.data.description)}}</h6>\n' +
    '                <h5 class="modal-title" id="stackModalLabel{{$ctrl.index}}">\n' +
    '                    {{$ctrl.getShortDescription($ctrl.data.description)}}</h5>\n' +
    '            </div>\n' +
    '            <div class="modal-body">\n' +
    '                <div ng-if="$ctrl.data.trace.length > 0">\n' +
    '                    <div ng-if="$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer" ng-repeat="trace in $ctrl.data.trace track by $index"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                    <div ng-if="!$ctrl.isValueAnArray($ctrl.data.trace)">\n' +
    '                        <pre class="logContainer"><div ng-class="$ctrl.applySmartHighlight(line)" ng-repeat="line in $ctrl.data.trace.split(\'\\n\') track by $index">{{line}}</div></pre>\n' +
    '                    </div>\n' +
    '                </div>\n' +
    '                <div ng-if="$ctrl.data.browserLogs.length > 0">\n' +
    '                    <h5 class="modal-title">\n' +
    '                        Browser logs:\n' +
    '                    </h5>\n' +
    '                    <pre class="logContainer"><div class="browserLogItem"\n' +
    '                                                   ng-repeat="logError in $ctrl.data.browserLogs track by $index"><div><span class="label browserLogLabel label-default"\n' +
    '                                                                                                                             ng-class="{\'label-danger\': logError.level===\'SEVERE\', \'label-warning\': logError.level===\'WARNING\'}">{{logError.level}}</span><span class="label label-default">{{$ctrl.convertTimestamp(logError.timestamp)}}</span><div ng-repeat="messageLine in logError.message.split(\'\\\\n\') track by $index">{{ messageLine }}</div></div></div></pre>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '            <div class="modal-footer">\n' +
    '                <button class="btn btn-default"\n' +
    '                        ng-class="{active: $ctrl.rootScope.showSmartStackTraceHighlight}"\n' +
    '                        ng-click="$ctrl.toggleSmartStackTraceHighlight()">\n' +
    '                    <span class="glyphicon glyphicon-education black"></span> Smart Stack Trace\n' +
    '                </button>\n' +
    '                <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
    '            </div>\n' +
    '        </div>\n' +
    '    </div>\n' +
    '</div>\n' +
     ''
  );

    });
