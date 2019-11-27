//TODO: Externalize the below const's

const ExcelJS = require('exceljs');
const Excel = require('exceljs/lib/exceljs.nodejs')
const makeMetadata = require('./datasource/elasticSearch/metadata');
var dashboardURL = 'api/dashboards/uid/';
const get_Esquery = require('./datasource/elasticSearch/queryBuilding');
const url = require('./utilFunctions/urlBuilding')
const datasource = require('./utilFunctions/getDatasource')
const queryBuilding = require('./utilFunctions/queryBuilding')
const express = require('express');
var bodyParser = require('body-parser');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerui = require('swagger-ui-express');
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'QueryBuilding',
            description: 'Query building for elastic search in grafana'
        },
        servers: ["http://localhost:8080"]
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

/**
 * @swagger
 * /auth:
*   post:
 *     description: Get API key from user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: key
 *         description: API key
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              apiKey:
 *                  type: string
 *     responses:
 *       200:
 *         description: success
 *         
 *
 */
var apiKey = 'Bearer '; //eyJrIjoicFhveTAwU0tWR0FGelk1VkY5N3lkTmJJWnp2RjRDMEoiLCJuIjoiYWRtaW4iLCJpZCI6MX0=
app.post('/auth', function (req, res) {

    if (req.body['apiKey'] != null) {
        apiKey += req.body['apiKey'];
        exports.apiKey = apiKey;
        res.send("api key added.");
    }
    else {
        console.log(req.body)
        res.send("error");
    }

});


/**
 * @swagger
 * /configure/url:
*   post:
 *     description: Configuring grafana base URL 
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: baseUrl
 *         description: Grafana base URL
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              baseUrl:
 *                  type: string
 *     responses:
 *       200:
 *         description: success
 *         
 *
 */
var grafanaBaseURL;
app.post('/configure/url', function (req, res) {
    if (req.body['baseUrl'] != null) {
        grafanaBaseURL = req.body['baseUrl'];
        console.log(grafanaBaseURL);
        exports.grafanaBaseURL = grafanaBaseURL;
        res.send("Base URL for grafana added.");
    }
    else {
        console.log(req.body)
        res.send("error");
    }

});


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
app.get('/dashboards', function (req, res) {
    var getDashboardsURL = 'api/search?query=%';
    //console.log(apiKey)
    request(url.buildUrl(getDashboardsURL, "GET", ""), (error, response, body) => {
        if (!error && response.statusCode == 200) {
            dashboardObjectList = JSON.parse(body)
            //res.send(body)
            var uidList = {};
            dashboardObjectList.forEach(element => {
                uidList[element.uid] = element.title
                // console.log(element)
                // uidList.push(element.uid);    
            });
            res.send(uidList);
        }
        else if (error) {
            res.send(error)
            console.log("error");
        }
    });

});
/**
 * @swagger
 * /configure/dashboard:
*   post:
 *     description: Set dashboard UID
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: UID
 *         description: Unique ID of the dashboard
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              uid:
 *                  type: string
 *     responses:
 *       200:
 *         description: success
 *         
 *
 */
var dashboardURL;
var thisPanel = {};
var panels;
var metaDataList;
app.post('/configure/dashboard', function (req, res) {
    dashboardURL = 'api/dashboards/uid/';
    if (req.body['uid'] != null) {
        dashboardURL += req.body['uid'];
        console.log(dashboardURL)
        exports.dashboardURL = dashboardURL;
        request(url.buildUrl(dashboardURL, "GET", ""), async (error, response, body) => {
            //console.log(dashboardURL)
            if (!error && response.statusCode == 200) {
                metaDataList = []
                metaDataList = await makeMetadata([], dashboardURL);
                panels = (JSON.parse(body).dashboard.panels);
                console.log(typeof panels)
                panels.forEach(element => {
                    thisPanel[element.id] = element.title
                })
                res.send(thisPanel);
            }
            else if (error) {
                res.send(error)
                console.log("error");

            }
        })
        //res.send("dashboard added.");
    }
    else {
        console.log(req.body)
        res.send("error");
    }

});
/**
 * @swagger
 * /datasource:
*   get:
 *     description: get all datasources
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: file
 *
 */
app.get('/datasource', function (req, res) {

    datasource.getDatasourceList().then(result => {
        res.send(result);
    })
});


/**
 *
 * /build/metadata:
*   get:
 *     description: Build Metadata for elasticsearch
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: success
 *         schema:
 *           type: object
 *
 */

// app.get('/build/metadata', async function (req, res) {
//     metaDataList = [];
//     //console.log("EXPORT FUNCTION")
//     //console.log(dashboardURL)
//     metaDataList = await makeMetadata([], dashboardURL);
//     //console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", metaDataList);
//     res.send(metaDataList);

//     // res.write('works');



// });
/**
 * @swagger
 * /configure/panel:
*   post:
 *     description: Set panels to be exported
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: UID
 *         description: viz ID's
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *              value:
 *                  type: array
 *                  items:
 *                      type: integer
 *     responses:
 *       200:
 *         description: success
 *
 *
 */
app.post('/configure/panel', async function (req, res) {
    metaDataList = []
    // console.log(req.body)
    var selectivePanels = []
    //var i = 0;
    pList = req.body.value;
    var i;
    panels.map(async element => {
        //await console.log("####################", req.body.value)
        //console.log(element.id == req.body.value[i])

        for (i = 0; i < pList.length; i++) {

            if (element.id == req.body.value[i]) {
                //console.log(element.id, req.body.value[i])
                //await console.log(element.title);
                await selectivePanels.push(element);
            }
        }

    })
    metaDataList = await makeMetadata(selectivePanels, dashboardURL);

    res.send(selectivePanels)


})

/**
 * @swagger
 * /export/excel:
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
app.get('/export/excel', async function (req, res) {
    var workbook = new Excel.Workbook();
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
    var result = metaDataList.map(metadata => {
        return get_Esquery(metadata, 'excel', workbook);
    });
    Promise.all(result).then(val => {
        let flag = true;
        for (let i = 0; i < val.length; i++) {
            if (val[i].status != 'success') {
                flag = false;
            }
        }
        if (flag == true) {
            console.log("File successfully Downloaded in ", val[0].path);
            res.download('./test.xlsx');
        }
        else {
            console.log('File cannot be downloaded');
        }
    })


    //res.download('./Reports/test.xlsx')


})




app.listen(process.env.PORT || 8082);