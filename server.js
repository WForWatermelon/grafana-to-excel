//TODO: Externalize the below const's
const grafanaBaseURL = 'http://localhost:3000/';
const dashboardURL='api/dashboards/uid/agx8OjAZz';
const apiKey='Bearer eyJrIjoiNTFtRjNsZzNZUnA4SjZjMG5OemRvS3pWSE9YWk05Rm0iLCJuIjoiYWRtaW4iLCJpZCI6MX0=';
const query='{"size":0,"query":{"bool":{"filter":[{"range":{"timestamp":{"gte":"1541933464474","lte":"1573469464474","format":"epoch_millis"}}},{"query_string":{"analyze_wildcard":true,"query":"*"}}]}},';
const queryPart='{"search_type":"query_then_fetch","ignore_unavailable":true,"index":"kibana*"}'
const queryURL='api/datasources/proxy/7/_msearch';



const express = require('express');
var bodyParser = require('body-parser');
//const ExcelJS = require('exceljs');
const Excel = require('exceljs/lib/exceljs.nodejs');
var workbook = new Excel.Workbook();
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');
const swaggerOptions = {
   swaggerDefinition: {
      info: {
         title: 'QueryBuilding',
         description: 'Query building index:".data*"from kibana'
      },
      servers: ["http://localhost:3035"]
   },
   apis: ["server.js"]
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);


const app = express();
const request = require('request');
app.use('/', express.static('app', { redirect: false }));
app.use('/api-docs', swaggerui.serve, swaggerui.setup(swaggerDocs));
app.use(bodyParser.json({
   limit: '10mb',
   parameterLimit: 10000
}));
app.use(bodyParser.urlencoded({
   limit: '10mb',
   parameterLimit: 10000,
   extended: true
}));
function requestHeaders(url,method,body){
    var options = {
        method:method,
        url: grafanaBaseURL+url,
        headers: {
            "Authorization": apiKey,
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body:body
    };
    return options;
}
/**
 * @swagger
 * /dashboards:
*   get:
 *     description: get all dashboards
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: file
 *
 */
app.get('/dashboards',function (req,res){
    var getDashboardsURL='api/search?query=%';
    request(requestHeaders(getDashboardsURL,"GET", ""), (error,response,body)=>{
        if (!error && response.statusCode == 200) {
            res.send(body)
            body.forEach(element => {
                var i=0;
                var dashboardList=element[i].uid;
                i++;
                
            });
            res.send(dashboardList);
        }
    });

});
/**
 * @swagger
 * /export:
*   get:
 *     description: get excel
 *     produces:
 *       - application/xlsx
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: file
 *
 */
app.get('/export', function (req, res) {
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
            var c=query+'"aggs":{"'+bucketAggs[0].id+'":{"'+bucketAggs[0].type+'":{"field":"'+bucketAggs[0].field+'","size":'+bucketAggs[0].settings.size+',"order":{"_key":"'+bucketAggs[0].settings.order+'"},"min_doc_count":'+bucketAggs[0].settings.min_doc_count+'},"aggs":{}}}}';
            console.log(queryPart + '\n' + c);
            var reqBody=(queryPart + '\n' + c + '\n');
            
            request(requestHeaders(queryURL,"POST",reqBody),(error, response, body)=>{
                console.log(!error && response.statusCode == 200)
                if (!error && response.statusCode == 200) {
                    let data = JSON.parse(body)
                    var resp=(data.responses[0].aggregations['2'].buckets);
                    workbook.creator = 'Me',
                    workbook.lastModifiedBy = 'Him',
                    workbook.created = new Date(2019, 10, 3),
                    workbook.modified = new Date(),
                    workbook.lastPrinted = new Date(2019, 10, 1),
                    workbook.views = [
                       {
                          x: 0, y: 0, width: 10000, height: 20000,
                          firstSheet: 0, activeTab: 1, visibility: 'visible'
                       }
                    ]
                    var sheet = workbook.addWorksheet('My Sheet', { properties: { tabColor: { argb: 'FFC0000' } } });
                    sheet.pageSetup.margins = {
                        left: 0.7, right: 0.7,
                        top: 0.75, bottom: 0.75,
                        header: 0.3, footer: 0.3
                    };
                    var head=bucketAggs[0].field
                    console.log(typeof head)
                    var colArr=[];
                    var id =[];
                    id.push(head)
                    id.push("count")
                    for(let i in id){
                        colArr.push({ header:id[i] , key:id[i], width: 20 })
                        
                    
                    }
                    sheet.columns = colArr;
                    console.log(resp)
                    for(let i in resp){
                        sheet.addRow([resp[i].key,resp[i].doc_count])
                    }
                    //sheet.addRow([Object.values(resp)]);
                    workbook.xlsx.writeFile('./gg.xlsx').then(function () {
                        console.log("Success");
                        res.download('./gg.xlsx')
                    });
                     
                }
                else if(error){
                    console.log(error)
                    res.send(error);
                }
            })
            


        }
    })

   // res.write('works');
    
    
    
});
 
app.listen(8080);