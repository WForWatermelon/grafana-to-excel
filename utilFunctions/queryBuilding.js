const request = require('request');
const datasource = require('./getDatasource')
const Excel = require('exceljs/lib/exceljs.nodejs');
var workbook = new Excel.Workbook();
const url = require('./urlBuilding')
var query = '{"size":0,"query":{"bool":{"filter":[{"range":{"timestamp":{"gte":"1541933464474","lte":"1573469464474","format":"epoch_millis"}}},{"query_string":{"analyze_wildcard":true,"query":"*"}}]}},';



async function buildQuery(viz, filename) {
    var database;
    var datasourceID;

    console.log(typeof viz)
    console.log('datasource------------>' + viz.datasource)
    await datasource.getDatasourceList().then(result => {
        console.log(result)
        if (viz.datasource != null) {
            database = result[viz.datasource].database;
            datasourceID = result[viz.datasource].datasourceID;
        }
        else {
            Object.keys(result).forEach(element => {
                console.log(result[element].isDefault)
                if (result[element].isDefault) {
                    database = result[element].database;
                    datasourceID = result[element].id;
                }

            });
        }

    })
    var query1 = '{"search_type":"query_then_fetch","ignore_unavailable":true,"index":"' + database + '"}';
    var queryURL = 'api/datasources/proxy/' + datasourceID + '/_msearch';
    console.log(queryURL + "fffffffffffffff" + query1)
    console.log(viz.targets);
    let metaData = (viz.targets);
    let bucketAggs = metaData[0].bucketAggs;
    console.log(bucketAggs)
    let queryBody = query + '"aggs":{"' + bucketAggs[0].id + '":{"' + bucketAggs[0].type + '":{"field":"' + bucketAggs[0].field + '","size":' + bucketAggs[0].settings.size + ',"order":{"_key":"' + bucketAggs[0].settings.order + '"},"min_doc_count":' + bucketAggs[0].settings.min_doc_count + '},"aggs":{}}}}';
    console.log(query1 + '\n' + queryBody);
    var reqBody = (query1 + '\n' + queryBody + '\n');

    request(url.buildUrl(queryURL, "POST", reqBody), async (error, response, body) => {
        //console.log(response)
        if (!error && response.statusCode == 200) {
            let data = JSON.parse(body)
            var resp = (data.responses[0].aggregations['2'].buckets);
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

            var sheet = workbook.addWorksheet(viz.title, { properties: { tabColor: { argb: 'FFC0000' } } });
            sheet.pageSetup.margins = {
                left: 0.7, right: 0.7,
                top: 0.75, bottom: 0.75,
                header: 0.3, footer: 0.3
            };
            var head = bucketAggs[0].field
            console.log(typeof head)
            var colArr = [];
            var id = [];
            id.push(head)
            id.push("count")
            for (let i in id) {
                colArr.push({ header: id[i], key: id[i], width: 20 })


            }
            sheet.columns = colArr;
            console.log(resp)
            for (let i in resp) {
                sheet.addRow([resp[i].key, resp[i].doc_count])
            }
            //sheet.addRow([Object.values(resp)]);

            await workbook.xlsx.writeFile('./' + filename + '.xlsx').then(function () {
                console.log("Success");

                //res.download('./gg.xlsx')
            });

        }
        else if (error) {
            console.log(error)
            //return(error);
            //res.send(error);
        }
    })


}

exports.buildQuery = buildQuery;