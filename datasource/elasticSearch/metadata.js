const express = require('express');
const app = express();
const request = require('request');
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

async function buildMetadata(viz) {
   var panel = []
   var aggs = {
      'aggs': []
   };

   await viz['targets'].forEach(async targets => {
      //console.log(viz["targets"])
      bucket = await bucketBuilding(targets.bucketAggs);
      metric = await metricBuilding(targets.metrics);
      //console.log("BUCKET", bucket);
      bucket.forEach(async data => {
         await aggs.aggs.push(data);
      });
      metric.forEach(async element => {
         await aggs.aggs.push(element);
      });

      //panel.push(aggs);
      //console.log("AGGS------------->" + JSON.stringify(aggs))
   });
   //console.log(panel)
   // 
   //console.log("This is the final aggs" + JSON.stringify(aggs))
   return aggs;
}

function bucketBuilding(bucket) {
   var bucketData = [];
   //console.log('buckets', bucket)
   bucket.forEach(element => {
      bucketMetadata = {
         "enabled": true,
         "id": element.id,
         "schema": "bucket",
         "type": element.type,
         "params": {}
      };
      switch (element.type) {
         case 'date_histogram':
            //console.log("*************************")
            Object.assign(bucketMetadata.params, {
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

            })
            break;
         case 'terms':
            Object.assign(bucketMetadata.params, {
               "field": element.field,
               "missingBucket": false,
               "missingBucketLabel": "Missing",
               "order": element.settings.order,
               "orderBy": element.settings.orderBy,
               "otherBucket": false,
               "otherBucketLabel": "Other",
               "size": element.settings.size
            })
            break;
         case 'geohash_grid':
            Object.assign(bucketMetadata.params, {
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
            })
            break;
         case 'histogram':
            Object.assign(bucketMetadata.params, {
               "field": element.field,
               "interval": element.settings.interval,
               "min_doc_count": false,
               "has_extended_bounds": false,
               "extended_bounds": {
                  "min": "",
                  "max": ""
               }
            })
            break;

      }
      //Object.assign(bucketData, bucketMetadata);
      bucketData.push(bucketMetadata);
      //console.log("++++++++" + JSON.stringify(bucketMetadata));
   });
   // 
   // console.log('bucketList-----------', bucketData);

   return (bucketData)
}
function metricBuilding(metric) {
   var metricData = [];
   //console.log(metric)
   metric.forEach(async element => {
      var metricMetadata = {
         'id': element.id,
         'enabled': 'true',
         'type': element.type,
         'schema': 'metric',
         'params': {
            'field': element.field
         }
      }
      await metricData.push(metricMetadata);
      //console.log("+++++++" + JSON.stringify(metricData))
   });
   //console.log('metricList-----------', metricData)
   return metricData;
}
//buildMetadata(a);
app.get("/metadata", async (req, res) => {

   var met = await buildMetadata(a);

   var list = []
   list.push(met)

   // console.log("metadata------------------------->" + (list))
   res.send(list);

})



module.exports = buildMetadata;

