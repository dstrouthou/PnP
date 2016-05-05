﻿var sample = {

    getUrlParamByName: function (name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
        var results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    },

    appWebUrl: function () {
        return this.getUrlParamByName("SPAppWebUrl");
    },

    hostWebUrl: function () {
        return this.getUrlParamByName("SPHostUrl");
    },

    init: function (f) {

        var self = this;

        var hostWebUrl = self.hostWebUrl();
        var appWebUrl = self.appWebUrl();

        // grab the code we are executing on the page
        var rawCode = $("#page-script").html().replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // show that code to the user
        var pageCode = rawCode;
        $("#sample-code").empty().append(pageCode);

        // manipulate the embed code so it will work when pasted in
        var embedCode = rawCode.replace("crossDomainWeb(appWebUrl, hostWebUrl)", "web").replace(/"\.\.\/scripts/g, "\"" + appWebUrl + "/scripts");
        embedCode = "    &lt;script type=\"text/javascript\" src=\"" + appWebUrl + "/scripts/embedsample.js\"&gt;&lt;/script&gt;" + embedCode;
        embedCode = "    &lt;script type=\"text/javascript\" src=\"" + appWebUrl + "/scripts/jquery-1.9.1.min.js\"&gt;&lt;/script&gt;\n" + embedCode;
        embedCode = embedCode.replace("(hostWebUrl, appWebUrl)", "()");
        embedCode += "   &lt;div id=\"pnp-sample-result\"&gt;&lt;/div&gt;";
        $("#embed-code").empty().append(embedCode);

        // ensure we are showing the sample container
        $("#sampleContainer").show();

        // execute the example script
        f(self.hostWebUrl(), self.appWebUrl());
    },

    show: function (data) {
        $("#sample-show").empty().append(JSON.stringify(data));
    },

    append: function (data) {
        $("#sample-show").append("<hr />").append(JSON.stringify(data));
    },

    appendSPQueryToUrl: function (/*string*/ url) {

        // we already have the SPHostUrl param from somewhere else, just give back the url
        if (url.indexOf('SPHostUrl=') > -1) {
            return url;
        }

        // add the required parameters
        var urlPart = url.indexOf('?') > -1 ? '&' : '?';
        urlPart += 'SPHostUrl=' + encodeURIComponent(this.getUrlParamByName('SPHostUrl'));
        urlPart += '&SPAppWebUrl=' + encodeURIComponent(this.getUrlParamByName('SPAppWebUrl'));
        urlPart += '&SPLanguage=' + encodeURIComponent(this.getUrlParamByName('SPLanguage'));
        urlPart += '&SPClientTag=' + encodeURIComponent(this.getUrlParamByName('SPClientTag'));
        urlPart += '&SPProductNumber=' + encodeURIComponent(this.getUrlParamByName('SPProductNumber'));

        var index = url.indexOf("#") 
        if (index> -1) {
            url = url.substring(0, index) + urlPart + url.substring(index, url.length);
        } else {
            url += urlPart;
        }

        return url;
    },

    getAuthorityFromUrl: function (/*string*/ url) {
        if (url) {
            var match = /^(?:https:\/\/|http:\/\/|\/\/)([^\/\?#]+)(?:\/|#|$|\?)/i.exec(url);
            if (match) {
                return match[1].toUpperCase();
            }
        }
        return null;
    },

    ensureContextQueryString: function () {

        // remove the redirect flag
        var SPHasRedirectedToSharePointParam = "&SPHasRedirectedToSharePoint=1";
        var queryString = window.location.search;
        if (queryString.indexOf(SPHasRedirectedToSharePointParam) >= 0) {
            window.location.search = queryString.replace(SPHasRedirectedToSharePointParam, "");
        }

        this.ensureSPHostUrlInLinks($('a.directLink'));
    },

    ensureSPHostUrlInLinks: function (/*jquery*/ parentNode) {

        var self = this;

        var currentAuthority = self.getAuthorityFromUrl(window.location.href);

        parentNode.filter(function () {
            var authority = self.getAuthorityFromUrl(this.href);
            if (!authority && /^#|:/.test(this.href)) {
                // Filters out anchors and urls with other unsupported protocols.
                return false;
            }
            return authority != null && authority.toUpperCase() == currentAuthority;
        }).each(function () {
            this.href = self.appendSPQueryToUrl(this.href);
        });
    },

};