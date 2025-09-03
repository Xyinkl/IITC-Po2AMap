// ==UserScript==
// @id 	 iitc-Po2AMap
// @name 	 IITC Plugin: Portal to AMap
// @namespace 	 https://github.com/Xyinkl/IITC-Po2AMap
// @version 	 0.0.6
// @updateURL 	 https://github.com/Xyinkl/IITC-Po2AMap/raw/refs/heads/main/Po2AMap.user.js
// @downloadURL 	 https://github.com/Xyinkl/IITC-Po2AMap/raw/refs/heads/main/Po2AMap.user.js
// @description 	 Just a iitc plugin to convert Portal location to Chinese Map Provider AMAP. With this you can get precise portal location in AMAP, and just navigate to it! And do whatever you want. 
// @author 	 Xyinkl
// @match	   https://intel.ingress.com/*
// @include 	 /https?:\/\/.*\.ingress\.com\/?((intel|mission)?(\/?(\?|#).*)?)?/
// @category 	 Tweaks
// @grant 	 none
// ==/UserScript==
function wrapper(plugin_info) {
    if(typeof window.plugin !== 'function') window.plugin = function(){};
    window.plugin.portal2amap = function(){};
    var self = window.plugin.portal2amap;
    self.id = 'portal2amap';
    self.title = '打开高德链接';
    self.version = '0.6';
    self.author = 'Xyinkl';
    self.outOfChina = function(lat, lon) {
        return (lon < 72.004 || lon > 137.8347) || (lat < 0.8293 || lat > 55.8271);
    };
    self.transformLat = function(x, y) {
        var pi = Math.PI;
        var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
        ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
        return ret;
    };
    self.transformLon = function(x, y) {
        var pi = Math.PI;
        var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
        ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
        ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
        ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0 * pi)) * 2.0 / 3.0;
        return ret;
    };
    self.wgs84togcj02 = function(lon, lat) {
        var pi = Math.PI;
        var a = 6378245.0;
        var ee = 0.00669342162296594323;
        if (self.outOfChina(lat, lon)) {
            return [lon, lat];
        }
        var dLat = self.transformLat(lon - 105.0, lat - 35.0);
        var dLon = self.transformLon(lon - 105.0, lat - 35.0);
        var radLat = lat / 180.0 * pi;
        var magic = Math.sin(radLat);
        magic = 1 - ee * magic * magic;
        var sqrtMagic = Math.sqrt(magic);
        dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
        dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
        var mgLat = lat + dLat;
        var mgLon = lon + dLon;
        return [mgLon, mgLat];
    };
    self.addAmapButton = function() {
        window.jQuery('#amap-float-btn').remove();
    var imgBtn = window.jQuery('<div id="amap-float-btn" style="position:fixed;left:10px;top:66%;transform:translateY(-50%);z-index:9999;width:32px;height:32px;cursor:pointer;border-radius:24px;box-shadow:0 2px 8px rgba(0,0,0,0.2);background:#fff;display:flex;align-items:center;justify-content:center;" title="打开高德">'
        + '<svg t="1756825167038" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8713" width="30" height="30"><path d="M970.666667 512q0 11.264-0.554667 22.485333-0.554667 11.264-1.664 22.485334-1.109333 11.178667-2.730667 22.314666-1.706667 11.136-3.84 22.186667-2.218667 11.050667-4.949333 21.973333t-5.973333 21.717334q-3.328 10.752-7.082667 21.333333-3.84 10.624-8.106667 21.034667-4.309333 10.410667-9.130666 20.565333-4.821333 10.197333-10.112 20.138667-5.333333 9.898667-11.093334 19.584-5.802667 9.642667-12.074666 18.986666-6.229333 9.386667-12.928 18.432-6.741333 9.045333-13.866667 17.749334-7.168 8.704-14.72 17.066666-7.552 8.32-15.530667 16.256-7.936 7.978667-16.298666 15.530667-8.32 7.552-17.066667 14.72-8.661333 7.125333-17.706667 13.866667-9.045333 6.698667-18.432 12.928-9.344 6.272-18.986666 12.074666-9.685333 5.76-19.626667 11.093334-9.898667 5.290667-20.053333 10.112-10.24 4.821333-20.608 9.130666-10.410667 4.266667-20.992 8.106667-10.624 3.754667-21.376 7.04-10.794667 3.285333-21.717334 5.973333-10.922667 2.773333-21.973333 4.949334-11.050667 2.218667-22.186667 3.84-11.093333 1.706667-22.314666 2.773333-11.221333 1.109333-22.485334 1.664-11.221333 0.554667-22.485333 0.554667t-22.485333-0.554667q-11.264-0.554667-22.485334-1.664-11.178667-1.109333-22.314666-2.730667-11.136-1.706667-22.186667-3.84-11.093333-2.218667-21.973333-4.949333-10.922667-2.730667-21.717334-5.973333-10.752-3.328-21.333333-7.082667-10.624-3.84-21.034667-8.106667-10.410667-4.309333-20.565333-9.130666-10.197333-4.821333-20.138667-10.112-9.898667-5.333333-19.584-11.093334-9.642667-5.802667-18.986666-12.074666-9.386667-6.229333-18.432-12.928-9.045333-6.741333-17.749334-13.866667-8.704-7.168-17.066666-14.72-8.32-7.552-16.256-15.530667-7.978667-7.936-15.530667-16.298666-7.552-8.32-14.72-17.066667-7.125333-8.661333-13.824-17.706667-6.741333-9.045333-12.970667-18.432-6.272-9.344-12.074666-18.986666-5.76-9.685333-11.093334-19.626667-5.290667-9.898667-10.112-20.053333-4.821333-10.24-9.130666-20.608-4.266667-10.410667-8.106667-20.992-3.797333-10.624-7.04-21.376-3.285333-10.794667-5.973333-21.717334-2.773333-10.922667-4.949334-21.973333-2.218667-11.050667-3.84-22.186667-1.706667-11.093333-2.773333-22.314666-1.109333-11.221333-1.706667-22.485334-0.512-11.221333-0.512-22.485333t0.554667-22.485333q0.554667-11.264 1.664-22.485334 1.109333-11.178667 2.730667-22.314666 1.706667-11.136 3.84-22.186667 2.218667-11.093333 4.949333-21.973333 2.730667-10.922667 5.973333-21.717334 3.285333-10.752 7.082667-21.333333 3.84-10.624 8.106667-21.034667 4.309333-10.410667 9.130666-20.565333 4.821333-10.197333 10.112-20.138667 5.333333-9.898667 11.093334-19.584 5.802667-9.642667 12.074666-18.986666 6.229333-9.386667 12.970667-18.432 6.698667-9.045333 13.824-17.749334 7.168-8.704 14.72-17.066666 7.552-8.32 15.530667-16.256 7.936-7.978667 16.298666-15.530667 8.32-7.552 17.066667-14.72 8.661333-7.125333 17.706667-13.824 9.045333-6.741333 18.432-12.970667 9.344-6.272 18.986666-12.074666 9.685333-5.76 19.626667-11.093334 9.898667-5.290667 20.053333-10.112 10.24-4.821333 20.608-9.130666 10.410667-4.266667 20.992-8.106667 10.624-3.797333 21.376-7.04 10.794667-3.285333 21.717334-5.973333 10.922667-2.773333 21.973333-4.949334 11.050667-2.218667 22.186667-3.84 11.093333-1.706667 22.314666-2.773333 11.221333-1.109333 22.485334-1.706667 11.221333-0.512 22.485333-0.512t22.485333 0.554667q11.264 0.554667 22.485334 1.664 11.178667 1.109333 22.314666 2.730667 11.136 1.706667 22.186667 3.84 11.050667 2.218667 21.973333 4.949333t21.717334 5.973333q10.752 3.285333 21.333333 7.082667 10.624 3.84 21.034667 8.106667 10.410667 4.309333 20.565333 9.130666 10.197333 4.821333 20.138667 10.112 9.898667 5.333333 19.584 11.093334 9.642667 5.802667 18.986666 12.074666 9.386667 6.229333 18.432 12.970667 9.045333 6.698667 17.749334 13.824 8.704 7.168 17.066666 14.72 8.32 7.552 16.256 15.530667 7.978667 7.936 15.530667 16.298666 7.552 8.32 14.72 17.066667 7.125333 8.661333 13.866667 17.706667 6.698667 9.045333 12.928 18.432 6.272 9.344 12.074666 18.986666 5.76 9.685333 11.093334 19.626667 5.290667 9.898667 10.112 20.053333 4.821333 10.24 9.130666 20.608 4.266667 10.410667 8.106667 20.992 3.754667 10.624 7.04 21.376 3.285333 10.794667 5.973333 21.717334 2.773333 10.922667 4.949334 21.973333 2.218667 11.050667 3.84 22.186667 1.706667 11.093333 2.773333 22.314666 1.109333 11.221333 1.664 22.485334 0.554667 11.221333 0.554667 22.485333z" fill="#1296db" p-id="8714" data-spm-anchor-id="a313x.search_index.0.i2.30e73a81e1Uf7e" class="selected"></path><path d="M436.266667 748.245333l-43.861334-123.904a10.666667 10.666667 0 0 0-6.485333-6.528l-123.904-43.818666c-63.872-22.613333-67.072-111.786667-4.949333-138.837334l389.546666-169.813333c62.208-27.136 125.44 36.053333 98.304 98.261333l-169.813333 389.546667c-27.093333 62.122667-116.224 58.965333-138.837333-4.906667z" fill="#F9F9F9" p-id="8715"></path></svg></div>');
        imgBtn.on('click', function(){
            var portalGuid = window.selectedPortal;
            var portalObj = portalGuid && window.portals && window.portals[portalGuid];
            var lat, lon;
            if (portalObj && portalObj._latlng) {
                lat = portalObj._latlng.lat;
                lon = portalObj._latlng.lng;
            } else if (portalObj && portalObj.options && portalObj.options.latLng) {
                lat = portalObj.options.latLng.lat;
                lon = portalObj.options.latLng.lng;
            }
            if (typeof lat !== 'number' || typeof lon !== 'number') {
                alert('未检测到Portal坐标');
                return;
            }
            var gcj = self.wgs84togcj02(lon, lat);
            var amapUrl = 'https://uri.amap.com/marker?position=' + gcj[0] + ',' + gcj[1];
            console.log('[portal2amap] amap url:', amapUrl);
            window.open(amapUrl, '_blank');
        });
        window.jQuery('body').append(imgBtn);
    };
    self.setup = function() {
        if ('pluginloaded' in self) return;
        self.pluginloaded = true;
        self.addAmapButton();
        window.addHook('portalDetails', function(){
            self.addAmapButton();
        });
    };
    var setup = function() {
        console.log('[portal2amap] global setup called, window.iitcLoaded:', window.iitcLoaded);
        if(window.iitcLoaded) {
            self.setup();
        } else {
            window.addHook('iitcLoaded', function(){
                console.log('[portal2amap] iitcLoaded hook triggered');
                self.setup();
            });
        }
                    console.log('[portal2amap] addAmapButton: document.body.innerHTML snippet:', document.body.innerHTML.slice(0, 1000));
                    console.log('[portal2amap] addAmapButton: window.selectedPortal:', window.selectedPortal);
                    console.log('[portal2amap] addAmapButton: window.portals:', window.portals);
    };
    setup.info = plugin_info;
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    if(window.iitcLoaded && typeof setup === 'function') setup();
}
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
