// ==UserScript==
// @id iitc-bookmarks-draw-all-to-one
// @name IITC Plugin: Draw All To One.
// @category Controls
// @version 0.0.2
// @namespace https://github.com/Donchurru/Plugins-IITC/tree/master/iitc-bookmarks-draw-all-to-one
// @updateURL      https://github.com/Donchurru/Plugins-IITC/blob/master/iitc-bookmarks-draw-all-to-one/iitc-bookmarks-draw-all-to-one.js
// @downloadURL    https://raw.githubusercontent.com/Donchurru/Plugins-IITC/master/iitc-bookmarks-draw-all-to-one/iitc-bookmarks-draw-all-to-one.js
// @author Donchurru
// @description Draw one portal to others portal in the same folder
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

// Wrapper function that will be stringified and injected
// into the document. Because of this, normal closure rules
// do not apply here.
function wrapper(plugin_info) {
  // Make sure that window.plugin exists. IITC defines it as a no-op function,
  // and other plugins assume the same.
  if(typeof window.plugin !== 'function') window.plugin = function() {};

  // Name of the IITC build for first-party plugins
  plugin_info.buildName = 'Draw All To One';

  // Datetime-derived version of the plugin
  plugin_info.dateTimeVersion = '20190227161000';

  // ID/name of the plugin
  plugin_info.pluginId = 'iitc-bookmarks-draw-all-to-one';

  // The entry point for this plugin.
  function setup() {
    //alert('Hello, IITC!');
    window.plugin.bookmarks.drawOriginal = window.plugin.bookmarks.draw;
    window.plugin.bookmarks.draw = function (view) {
        var latlngs = [];
        var uuu = $('#bkmrksAutoDrawer a.bkmrk.selected').each(function(i) {
            var tt = $(this).data('latlng');
            latlngs[i] = tt;
        });
        var layer, layerType;
        if(latlngs.length == 1) {
            $('#bkmrksAutoDrawer a.bkmrk.selected').siblings().each(function(i) {
                var latlngsbr = [];
                var tt = $(this).data('latlng');
                latlngsbr[0] = tt;
                latlngsbr[1] = latlngs[0];
                layer = L.geodesicPolyline(latlngsbr, window.plugin.drawTools.lineOptions);
                layerType = 'polyline';
                map.fire('draw:created', {
                    layer: layer,
                    layerType: layerType
                });
            });

            if($('#bkmrkClearSelection').prop('checked')){
                $('#bkmrksAutoDrawer a.bkmrk.selected').removeClass('selected');
            }

            if(window.plugin.bookmarks.isSmart) {
                window.show('map');
            }

            // Shown the layer if it is hidden
            if(!map.hasLayer(window.plugin.drawTools.drawnItems)) {
                map.addLayer(window.plugin.drawTools.drawnItems);
            }

            if(view) {
                map.fitBounds(layer.getBounds());
            }

        } else {
            window.plugin.bookmarks.drawOriginal(view);
        }
    }

    window.plugin.bookmarks.autoDrawOnSelectOriginal = window.plugin.bookmarks.autoDrawOnSelect;
    window.plugin.bookmarks.autoDrawOnSelect = function () {
        if ($('#bkmrksAutoDrawer a.bkmrk.selected').length == 0) {
            $('#bkmrksAutoDrawer p')
                .html("You must select 1, 2 or 3 portals!")
                .css("color", "red");
        } else if ($('#bkmrksAutoDrawer a.bkmrk.selected').length == 1) {

            var text = "We are going to draw " + $('#bkmrksAutoDrawer a.bkmrk.selected').siblings().length + ' links to ' + $('#bkmrksAutoDrawer a.bkmrk.selected').text();

            $('#bkmrksAutoDrawer p')
                .html(text)
                .css("color", "");

        } else {
            window.plugin.bookmarks.autoDrawOnSelectOriginal();
        }
    }

    window.plugin.bookmarks.dialogDrawerOriginal =  window.plugin.bookmarks.dialogDrawer;
    window.plugin.bookmarks.dialogDrawer = function () {
      window.plugin.bookmarks.dialogDrawerOriginal();
        var btnFolder = '<button type="button" onclick="window.plugin.bookmarks.drawFolder(this);return false;" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only" role="button" style="float: right;margin: 0 3px 3px 0;"><span class="ui-button-text">Draw All</span></button>'
        $('div.bookmarkFolder').each(function() {
            $(this).prepend(btnFolder);
        });
    }

    window.plugin.bookmarks.drawFolder = function (btn) {
      if ($('#bkmrksAutoDrawer a.bkmrk.selected').length == 0 || $('#bkmrksAutoDrawer a.bkmrk.selected').length > 2) {
        $('#bkmrksAutoDrawer p')
            .html("You must select 1 or 2 portals.")
            .css("color", "red");
        alert("You must select 1 or 2 portals.");
      } else {
        var originalColor = window.plugin.drawTools.currentColor;
        $('#bkmrksAutoDrawer a.bkmrk.selected').each(function() {
            var tt = $(this).data('latlng');
            $(btn).siblings('div').find('a.bkmrk').each(function() {
                var latlngsbr = [];
                latlngsbr[0] = tt;
                latlngsbr[1] = $(this).data('latlng');
                var layer = L.geodesicPolyline(latlngsbr, window.plugin.drawTools.lineOptions);
                var layerType = 'polyline';
                map.fire('draw:created', {
                    layer: layer,
                    layerType: layerType
                });
            });
            if (originalColor != "#4aa8c3") {
                window.plugin.drawTools.setDrawColor("#4aa8c3");
            }
        });
        window.plugin.drawTools.setDrawColor(originalColor);
      }
    }
  }

  // Add an info property for IITC's plugin system
  setup.info = plugin_info;

  // Make sure window.bootPlugins exists and is an array
  if (!window.bootPlugins) window.bootPlugins = [];
  // Add our startup hook
  window.bootPlugins.push(setup);
  // If IITC has already booted, immediately run the 'setup' function
  if (window.iitcLoaded && typeof setup === 'function') setup();
}

// Create a script element to hold our content script
var script = document.createElement('script');
var info = {};

// GM_info is defined by the assorted monkey-themed browser extensions
// and holds information parsed from the script header.
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}

// Create a text node and our IIFE inside of it
var textContent = document.createTextNode('('+ wrapper +')('+ JSON.stringify(info) +')');
// Add some content to the script element
script.appendChild(textContent);
// Finally, inject it... wherever.
(document.body || document.head || document.documentElement).appendChild(script);