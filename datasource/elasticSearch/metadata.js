const express = require('express');
const app = express();
const request = require('request');
const url = require('../../utilFunctions/urlBuilding');
const datasource = require('../../utilFunctions/getDatasource')
app.use('/', express.static('app', { redirect: false }));
var a = {
   "targets": [
      {
         "bucketAggs": [
            {
               "fake": true,
               "field": "timestamp",
               "id": "5",
               "settings": {
                  "interval": "1d",
                  "min_doc_count": 0,
                  "trimEdges": 0
               },
               "type": "date_histogram"
            },
            {
               "fake": true,
               "field": "DestCityName",
               "id": "6",
               "settings": {
                  "min_doc_count": 1,
                  "order": "desc",
                  "orderBy": "1",
                  "size": "10"
               },
               "type": "terms"
            },
            {
               "fake": true,
               "field": "FlightDelay",
               "id": "7",
               "settings": {
                  "interval": 1000,
                  "min_doc_count": 1
               },
               "type": "histogram"
            },
            {
               "fake": true,
               "field": "DestLocation",
               "id": "4",
               "settings": {
                  "precision": 3
               },
               "type": "geohash_grid"
            }
         ],
         "metrics": [
            {
               "field": "AvgTicketPrice",
               "id": "1",
               "meta": {},
               "settings": {},
               "type": "max"
            },
            {
               "field": "DistanceKilometers",
               "id": "3",
               "meta": {},
               "settings": {},
               "type": "sum"
            }
         ],
         "refId": "A",
         "timeField": "timestamp"
      }
   ],
   "timeFrom": null,
   "timeShift": null,
   "title": "table",
   "transform": "table",
   "type": "table"
}


//buildMetadata(a);

function isArray(array) {
   if (Array.isArray(array)) {
      array.forEach(arr => {
         return isArray(arr);
      })
   } else if (typeof array == 'object') {
      return array;
   }

   return array;
}

async function buildMetadata(viz, esUrl) {
   var panel = []
   var aggs = {
      'title': viz.title,
      'esUrl': esUrl,
      'aggs': []
   };

   return new Promise(async (resolve, reject) => {
      // var result = [],
      buckets = [],
         metrics = [];
      var buckets = viz.targets.map(async targets => {
         return await bucketBuilding(targets.bucketAggs);
      });
      var metrics = viz.targets.map(async targets => {
         return await metricBuilding(targets.metrics);
      });
      Promise.all(buckets).then(result => {
         result[0].forEach(val => {
            aggs.aggs.push(val);
         });
      });
      Promise.all(metrics).then(result => {
         result[0].forEach(val => {
            aggs.aggs.push(val);
         });
      });

      resolve(aggs);
   })
}
var bucketData = [];
async function bucketBuilding(bucket) {
   return new Promise(async (resolve, reject) => {
      bucketData = bucket.map(element => {
         switch (element.type) {
            case 'date_histogram':
               //console.log("*************************")
               params = {
                  'field': element.field,
                  'timeRange': {
                     'from': 'now - ' + element.settings.interval,
                     'to': 'now'
                  },
                  "useNormalizedEsInterval": true,
                  "interval": "auto",
                  "drop_partials": false,
                  "min_doc_count": 0,
                  "extended_bounds": {}

               }
               break;
            case 'terms':
               params = {
                  "field": element.field,
                  "missingBucket": false,
                  "missingBucketLabel": "Missing",
                  "order": element.settings.order,
                  "orderBy": element.settings.orderBy,
                  "otherBucket": false,
                  "otherBucketLabel": "Other",
                  "size": element.settings.size
               }
               break;
            case 'geohash_grid':
               params = {
                  "field": element.field,
                  "autoPrecision": true,
                  "precision": element.settings.precision,
                  "useGeocentroid": true,
                  "isFilteredByCollar": true,
                  "mapZoom": 2,
                  "mapCenter": [
                     0,
                     0
                  ]
               }
               break;
            case 'histogram':
               params = {
                  "field": element.field,
                  "interval": element.settings.interval,
                  "min_doc_count": false,
                  "has_extended_bounds": false,
                  "extended_bounds": {
                     "min": "",
                     "max": ""
                  }
               }
               break;
         }

         bucketMetadata = {
            "enabled": true,
            "id": element.id,
            "schema": "bucket",
            "type": element.type,
            "params": params
         };
         return bucketMetadata
      });
      console.log('444444444444444', bucketData)
      resolve(bucketData);
   })
}
var metricData = [];
async function metricBuilding(metric) {
   return new Promise(async (resolve, reject) => {
      metricData = await metric.map(data => {
         var metricMetadata = {
            'id': data.id,
            'enabled': 'true',

            'type': data.type,
            'schema': 'metric',
            'params': {}
         }
         if (data.type != 'count') {
            Object.assign(metricMetadata.params, { 'field': data.field })
         }
         return metricMetadata;
         //metricData.push(metricMetadata);
         //console.log("+++++++" + JSON.stringify(metricData))
      });
      //console.log('metricList-----------', metricData)
      resolve(metricData);
   });
}

function makeMetadata(panels, dashboardURL) {
   return new Promise(async (resolve, reject) => {
      request(url.buildUrl(dashboardURL, "GET", ""), async (error, response, body) => {
         console.log(dashboardURL)
         if (!error && response.statusCode == 200) {
            if (panels == undefined || panels.length == 0) {
               panels = [];
               panels = (JSON.parse(body).dashboard.panels);
            }//console.log(JSON.parse(body).meta.slug)
            var filename = JSON.parse(body).meta.slug;
            //console.log(panels)
            metaDataList = [];
            // for (let i = 0; i < 1; i++) {
            var i = 0
            var datasourceInfo = await datasource.getDatasourceList();


            await panels.forEach(viz => {
               console.log(viz.datasource)
               //console.log(viz, 'This iteration is-------------->', i)
               if (viz.datasource == null) {
                  Object.keys(datasourceInfo).forEach(async element => {
                     //console.log(datasourceInfo[element].isDefault)

                     if (datasourceInfo[element].isDefault && datasourceInfo[element].type == 'elasticsearch') {
                        var value = await buildMetadata(viz, datasourceInfo[element].url);
                        console.log('55555555555555555555555', JSON.stringify(value, null, 1));
                        metaDataList.push(value);
                     }

                  });
               }

               else if (viz.datasource != null && datasourceInfo[viz.datasource].type == 'elasticsearch') {
                  // console.log(datasourceInfo[viz.datasource].url)
                  var value = buildMetadata(viz, datasourceInfo[element].url);
                  console.log('6666666666666666666666', JSON.stringify(value));
                  metaDataList.push(value);

                  // console.log('111111111111111', buildMetadata(viz))
                  //console.log(viz)
               }


               //await queryBuilding.buildQuery(viz, filename)
            });
            //await queryBuilding.buildQuery(viz[0], filename);
            // }



            //res.download('./' + filename + '.xlsx')
            setTimeout(() => {
               console.log('555555555555555555555555555', metaDataList)
               //exports.metaDataList = metaDataList;
               resolve(metaDataList);
            }, 1000)
         }
         else if (error) {
            console.log(error)
            reject(error);
         }
      })
   })
}



module.exports = makeMetadata;

