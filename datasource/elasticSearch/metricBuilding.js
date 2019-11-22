// var metricId;
// var metricType;
// var metricField;
//metric structure
var metric = {
   body: {
      metricId: {
         metricType: {
            "field": metricField
         }
      }
   }
}

function constructMetric(metricId, metricType, metricField) {
   metric.body.metricId = metricId;
   metric.body.metricId.metricType = metricType;
   metric.body.metricId.metricType.field = metricField;

   return metric

}