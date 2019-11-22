var bucket = {
   id: {
      bucketType: {
         "field": bucketField,
         "size": size,
         "order": {
            orderBy: orderType
         },
         "min_doc_count": min_doc_count
      },
      "aggs": aggs
   }
}

function bucketBuilding(bucketAggs) {
   var masterBucket = {}
   bucketAggs.forEach((val, key, arr) => {
      if (!(Object.is(arr.length - 1))) {
         bucket.id = val.id;
         bucket.id.bucketType = val.type;
      }

   });
}