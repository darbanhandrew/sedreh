
// global so we can remove it later
var map;

var geojson;
// layers
var positionLayers = {};

var pollutantLayer = new ol.layer.Tile({
    visible: false
});

var roudBaseMapLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        attributions: 'Google Maps',
        url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    }),
});

var satelliteBaseMapLayer = new ol.layer.Tile({
    visible: false,
    source: new ol.source.XYZ({
        attributions: 'Google Satellite',
        url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    }),
});

var favoritePointLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/test/wms?format=image/png&tiled=true&layers=test:arse_z1',
    })
});

var favoriteRegionLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/test/wms?format=image/png&tiled=true&layers=test:arse_z2',
    })
}); 

var drawLayer = new ol.layer.Vector({
    source: new ol.source.Vector({wrapX: false})
});


// toggle layers
function ToggleLayer(layer, checked) {
    layer.setVisible(checked);
}

function ToggleSelectBaseMap() {
    if (roudBaseMapLayer.getVisible()) {
        ToggleLayer(roudBaseMapLayer, false);
        ToggleLayer(satelliteBaseMapLayer, true);
        $('#baseMapeButton').html("<ion-icon src='/static/my/icons/satellite.svg'></ion-icon>");
    } else {
        ToggleLayer(roudBaseMapLayer, true);
        ToggleLayer(satelliteBaseMapLayer, false);
        $('#baseMapeButton').html("<ion-icon src='/static/my/icons/map.svg'></ion-icon>");
    }
}

function ToggleFavoritePointLayer(checked) {
    ToggleLayer(favoritePointLayer, checked);
}

function ToggleFavoriteRegionLayer(checked) {
    ToggleLayer(favoriteRegionLayer, checked);
}

function TogglePosintionLayer(name, url, checked) {
    if (positionLayers[name]) {
        ToggleLayer(positionLayers[name], checked)
    } else if (checked) {
        $.get(url, function (geoserver_url) {
            
            var layer = new ol.layer.Tile({
                source: new ol.source.TileWMS({
                    url: geoserver_url,
                })
            });
            map.addLayer(layer);
            
            positionLayers[name] = layer;

        });
    }
}

function TogglePollutantLayer(url) {
    $.get(url, function (geoserver_url) {
        
        map.removeLayer(pollutantLayer);
        pollutantLayer = new ol.layer.Tile({
            source: new ol.source.TileWMS({
                url: geoserver_url,
            })
        });
        map.addLayer(pollutantLayer);

        ToggleLayer(pollutantLayer, true);
    });
}


// draw interaction
var draw;
function GetDrawSource() {
    return drawLayer.getSource()
}

function GetFavoritePointDrawStyle() {
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            src: '/static/my/icons/favorite-place.png',
        }),
    })
}

function GetFavoritePolygonDrawStyle() {
    return undefined
}

function GetFavoriteDrawStyle(type) {
    if (type !== 'None') {
        if (type == 'Point') {
            return GetFavoritePointDrawStyle()
        }
        if (type == 'Polygon' || type == 'Box') {
            return GetFavoritePolygonDrawStyle()
        }
    }
}

function GetGeometryFunction(type) {
    return type == 'Box' ? ol.interaction.Draw.createBox() : undefined
}

function ClearMapfromDrawLayer() {
    GetDrawSource().clear()
    map.removeInteraction(draw);
}

function AddDrawInteraction(type) {
    ClearMapfromDrawLayer()

    if (type) {
        var style = GetFavoriteDrawStyle(type)

        drawLayer.setStyle(style)
        draw = new ol.interaction.Draw({
            source: GetDrawSource(),
            type: type == 'Box' ? 'Circle' : type,
            style: style,
            geometryFunction: GetGeometryFunction(type),
            condition: function(e) {
                // when the point's button is 1(leftclick), allows drawing
                if (e.pointerEvent.buttons === 1) { 
                  return true;
                }
                return false;
              }
        });

        draw.on('drawend', function(e) {
            var writer = new ol.format.GeoJSON();
           //pass the feature as an array
           var geojsonStr = writer.writeFeaturesObject([e.feature]);
           geojson = geojsonStr;
            modal_new_feature(geojsonStr["features"][0]["geometry"])
            ClearMapfromDrawLayer()
        }, this);

        map.addInteraction(draw);
    }
};


// kml/kmz file

//-- Create functions to extract KML and icons from KMZ array buffer,
//-- which must be done synchronously.

var zip = new JSZip();

function getKMLData(buffer) {
  var kmlData;
  zip.load(buffer);
  var kmlFile = zip.file(/.kml$/i)[0];
  if (kmlFile) {
    kmlData = kmlFile.asText();
  }
  return kmlData;
}

function getKMLImage(href) {
  var url = href;
  var path = window.location.href;
  path = path.slice(0, path.lastIndexOf('/') + 1);
  if (href.indexOf(path) === 0) {
    var regexp = new RegExp(href.replace(path, '') + '$', 'i');
    var kmlFile = zip.file(regexp)[0];
    if (kmlFile) {
      url = URL.createObjectURL(new Blob([kmlFile.asArrayBuffer()]));
    }
  }
  return url;
}

//-- Define a KMZ format class by subclassing ol/format/KML
var KML = ol.format.KML;

var KMZ = /*@__PURE__*/(function (KML) {
  function KMZ(opt_options) {
    var options = opt_options || {};
    options.iconUrlFunction = getKMLImage;
    KML.call(this, options);
  }

  if ( KML ) KMZ.__proto__ = KML;
  KMZ.prototype = Object.create( KML && KML.prototype );
  KMZ.prototype.constructor = KMZ;

  KMZ.prototype.getType = function getType () {
    return 'arraybuffer';
  };

  KMZ.prototype.readFeature = function readFeature (source, options) {
    var kmlData = getKMLData(source);
    return KML.prototype.readFeature.call(this, kmlData, options);
  };

  KMZ.prototype.readFeatures = function readFeatures (source, options) {
    var kmlData = getKMLData(source);
    return KML.prototype.readFeatures.call(this, kmlData, options);
  };

  return KMZ;
}(KML));

function GetFileExtension(file) {
    return file['name'].split('.').pop();
}

function AddKmlFileAsDraw(file) {
    ClearMapfromDrawLayer()

    if (file) {
        var extension = GetFileExtension(file)
        
        var format = new KML();
        if ( extension == 'kmz') {
            format = new KMZ();
        } else if (extension != 'kml') {
            return
        }

        var reader = new FileReader();
        // reader.onload = function () {
        //     var source = new ol.source.Vector({
        //         url: reader.result,
        //         format: format,
        //     });

        //     GetDrawSource().addFeatures(source.getFeatures())
        
        // }
        reader.onload = function (event) {

            var source = new ol.source.Vector({
                url: event.target.result,
                format: format
            });

            GetDrawSource().addFeatures(ol.format.KML.KML.readFeatures(source))
        };
        reader.readAsDataURL(file);
    }

    // map.getView().fit(GetDrawSource().getExtent());
};

var dragAndDropInteraction = new ol.interaction.DragAndDrop({
    formatConstructors: [KMZ, KML],
});

dragAndDropInteraction.on('addfeatures', function (event) {
    var vectorSource = new ol.source.Vector({
        features: event.features,
    });
    map.addLayer(
        new ol.layer.Vector({
            source: vectorSource,
        })
    );
    map.getView().fit(vectorSource.getExtent());
});


// mouse position
var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(4),
    projection: 'EPSG:4326',
    className: 'custom-mouse-position',
    target: document.getElementById('mouse-position'),
    undefinedHTML: '&nbsp;',
});


// view
var view = new ol.View({
    center: ol.proj.fromLonLat([53, 32]),
    zoom: 5
})

function FlyTo(location, zoom, done) {
    var duration = 2000;
    var parts = 2;
    var called = false;
    function callback(complete) {
        --parts;
        if (called) {
            return;
        }
        if (parts === 0 || !complete) {
            called = true;
            done(complete);
        }
    }
    view.animate(
        {
            center: location,
            duration: duration,
        },
        callback
    );
    view.animate(
        {
            zoom: zoom > 12 ? zoom - 3 : zoom - 1,
            duration: duration / 2,
        },
        {
            zoom: zoom,
            duration: duration / 2,
        },
        callback
    );
};


function ZoomToLayer(layer) {
    var zoom;
    var location;

    FlyTo(location, zoom, function(){})
}
var blur = document.getElementById('blur');
var radius = document.getElementById('radius');
var heat_vector = new ol.layer.Heatmap({
  source: new ol.source.Vector({
    url: '/static/kml/aerosol.kml',
    format: new ol.format.KML({
      extractStyles: false,
    }),
  }),
    visible:false,
    blur: parseInt(blur.value, 10),
    radius: parseInt(radius.value, 10),
    opcaity:0.8,
  weight: function (feature) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    var description = feature.get('description');
    var magnitude = parseFloat(description);
    return magnitude;
  },
});
var blurHandler = function () {
  heat_vector.setBlur(parseInt(blur.value, 10));
};
blur.addEventListener('input', blurHandler);
blur.addEventListener('change', blurHandler);
function handleChange(src) {
    var source=new ol.source.Vector({
    url: '/static/kml/'+src.value+'.kml',
    format: new ol.format.KML({
      extractStyles: false,
    }),
  })
  heat_vector.setSource(source)
  heat_vector.setVisible(true)
  console.log(heat_vector.getSource())
  }
var radiusHandler = function () {
  heat_vector.setRadius(parseInt(radius.value, 10));
};
radius.addEventListener('input', radiusHandler);
radius.addEventListener('change', radiusHandler);
// initial map
map = new ol.Map({
    controls: ol.control.defaults().extend([
        new ol.control.FullScreen(),
        mousePositionControl
    ]),
    interactions: ol.interaction.defaults().extend([dragAndDropInteraction]),
    target: 'map',
    layers: [
        roudBaseMapLayer,
        satelliteBaseMapLayer,
        pollutantLayer,
        favoritePointLayer,
        favoriteRegionLayer,
        drawLayer,
        heat_vector,
    ],
    view: view
});

map.on('singleclick', function () {
    $('#layer-items').slideUp('slow')
})

// ------------------------------------------------------------------


document.getElementById('input-kml').addEventListener('change', function () {
    var file = document.getElementById("input-kml").files[0];

    AddKmlFileAsDraw(file)
});


document.getElementById('export-map').addEventListener('click', function () {
    map.once('rendercomplete', function () {
      var mapCanvas = document.createElement('canvas');
      var size = map.getSize();
      mapCanvas.width = size[0];
      mapCanvas.height = size[1];
      var mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(
        document.querySelectorAll('.ol-layer canvas'),
        function (canvas) {
          if (canvas.width > 0) {
            var opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            var transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            var matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
            // Apply the transform to the export map context
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        }
      );
      if (navigator.msSaveBlob) {
        // link download attribuute does not work on MS browsers
        navigator.msSaveBlob(mapCanvas.msToBlob(), 'map.png');
      } else {
        var link = document.getElementById('export-map-download');
        link.href = mapCanvas.toDataURL();
        link.click();
      }
    });
    map.renderSync();
});
map.ol.source.Vector.getSource().on('addfeature', function(event){
    console.log("Hello");
});

function modal_new_feature(geojsonStr) {
    $(".modal").modal('toggle');
    $(".modal-title").html("ثبت موقعیت جدید");
    $(".modal-body").html(get_new_feature_modal_body());
    $(".modal-body form").append("<input name='geojson' type='hidden' value='"+JSON.stringify(geojsonStr)+"' style='display:none'/>")
    SetModalSize("modal-lg");
}

// problems:
// ------------------------------------------------------
// kml
// screenshot
// get extent of a tile layer (ZoomTolayer)
// show list of favorite
// show location
// go to location
//* legend
//* popup --> Status Summary of pollutant layer
// ------------------------------------------------------
// submit favorite location/region
