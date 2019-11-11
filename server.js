const grafanaBaseURL = 'http://localhost:3000/';
const dashboardURL='api/dashboards/uid/agx8OjAZz';
const apiKey='Bearer eyJrIjoiNTFtRjNsZzNZUnA4SjZjMG5OemRvS3pWSE9YWk05Rm0iLCJuIjoiYWRtaW4iLCJpZCI6MX0=';
const query='{"search_type":"query_then_fetch","ignore_unavailable":true,"index":"kibana*"}\n{"size":0,"query":{"bool":{"filter":[{"range":{"timestamp":{"gte":"1573426912394","lte":"1573448512395","format":"epoch_millis"}}},{"query_string":{"analyze_wildcard":true,"query":"*"}}]}},';
const queryURL='api/datasources/proxy/7/_msearch';
const express = require('express');
var bodyParser = require('body-parser');

const app = express();
const request = require('request');
app.use(bodyParser.json({
   limit: '10mb',
   parameterLimit: 10000
}));
app.use(bodyParser.urlencoded({
   limit: '10mb',
   parameterLimit: 10000,
   extended: true
}));
function requestHeaders(url,method,formData){
    var options = {
        method:method,
        url: grafanaBaseURL+url,
        headers: {
            "Authorization": apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        formData:formData
    };
    return options;
}


app.get('/', function (req, res) {
    request(requestHeaders(dashboardURL,"GET"), (error, response, body)=>{
        if (!error && response.statusCode == 200) {
            var viz=(JSON.parse(body).dashboard.panels);
            // viz.forEach(panel => {
            //     //console.log(element.type)
            //     if(panel.type=='table' && panel.datasource=='Elasticsearch'){

                   
                    
                    
            //     }
                
            // }); 
            //var datasourceID=(viz[3].id);
            var metaData=(viz[0].targets);
            var bucketAggs=metaData[0].bucketAggs;
            console.log(bucketAggs)
            var c=query+'"aggs":{"'+bucketAggs[0].id+'":{"'+bucketAggs[0].type+'":{"field":"'+bucketAggs[0].field+'","size":'+bucketAggs[0].settings.size+',"order":{"_key":"'+bucketAggs[0].settings.order+'"},"min_doc_count":'+bucketAggs[0].settings.min_doc_count+'},"aggs":{}}}}\n';
            console.log(c)
            
            request(requestHeaders(queryURL,"POST",c),(error, response, body)=>{
                if (!error && response.statusCode == 200) {
                    Console.log("ggggg");
                    res.send(JSON.parse(body));
                }
                else{
                    console.log(error)
                    res.send(error);
                }
            })
            


        }
    })

   // res.write('works');
    
    
    
});
 
app.listen(8080);