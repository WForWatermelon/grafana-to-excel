//TODO: Externalize the below const's

const buildMetadata = require('./datasource/elasticSearch/metadata');
var dashboardURL = 'api/dashboards/uid/agx8OjAZz';

const url = require('./utilFunctions/urlBuilding')
const datasource = require('./utilFunctions/getDatasource')
const queryBuilding = require('./utilFunctions/queryBuilding')
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

app.post('/configure/dashboard', function (req, res) {
    if (req.body['uid'] != null) {
        dashboardURL += req.body['uid'];
        exports.dashboardURL = dashboardURL;
        res.send("dashboard added.");
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
app.get('/export', async function (req, res) {
    //console.log("EXPORT FUNCTION")
    //console.log(dashboardURL)
    await request(url.buildUrl(dashboardURL, "GET", ""), async (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var panels = [];
            panels = (JSON.parse(body).dashboard.panels);
            //console.log(JSON.parse(body).meta.slug)
            var filename = JSON.parse(body).meta.slug;
            //console.log(panels)
            var metaDataList = [];
            // for (let i = 0; i < 1; i++) {
            var i = 0
            var datasourceInfo = await datasource.getDatasourceList();


            await panels.map(viz => {

                //console.log(viz, 'This iteration is-------------->', i)

                if (viz.datasource != null && datasourceInfo[viz.datasource].type == 'elasticsearch') {
                    buildMetadata(viz).then(val => {
                        metaDataList.push(val);
                        console.log('111111111111111', val)
                    })

                    // console.log('111111111111111', buildMetadata(viz))
                    //console.log(viz)
                }

                else if (viz.datasource == null) {
                    Object.keys(datasourceInfo).forEach(async element => {
                        //console.log(datasourceInfo[element].isDefault)
                        if (datasourceInfo[element].isDefault && datasourceInfo[element].type == 'elasticsearch') {
                            buildMetadata(viz).then(val => {
                                metaDataList.push(val);
                                console.log('22222222222222', val)
                            })
                            // console.log('22222222222222222', buildMetadata(viz))
                        }

                    });
                }
                //await queryBuilding.buildQuery(viz, filename)
            });
            //await queryBuilding.buildQuery(viz[0], filename);
            // }



            //res.download('./' + filename + '.xlsx')
            setTimeout(() => {
                console.log('555555555555555555555555555', metaDataList)
                res.send(metaDataList)
            }, 1000)
        }
        else if (error) {
            console.log(error)
            res.send(error)
        }
    })

    // res.write('works');



});



app.listen(8082);