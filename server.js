const grafanaBaseURL = 'http://localhost:3000/';
const dashboardUID='agx8OjAZz';
const apiKey='Bearer eyJrIjoiNTFtRjNsZzNZUnA4SjZjMG5OemRvS3pWSE9YWk05Rm0iLCJuIjoiYWRtaW4iLCJpZCI6MX0=';
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

const options = {
    url: grafanaBaseURL+'api/dashboards/uid/'+ dashboardUID,
    headers: {
        "Authorization": apiKey,
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
};


app.get('/', function (req, res) {
    request(options, (error, response, body)=>{
        if (!error && response.statusCode == 200) {
            var viz=(JSON.parse(body).dashboard.panels);
            viz.forEach(panel => {
                //console.log(element.type)
                if(panel.type=='table' && panel.datasource=='Elasticsearch'){

                    //console.log(panel.targets);
                    
                    
                }
                
            });            
        }
    })
    //console.log('works');
    res.write("works")
    
    
});
 
app.listen(8080);