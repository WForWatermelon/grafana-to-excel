const url = require('./urlBuilding')
const request = require('request');
var datasourceList = {};
function getDatasourceList() {
    return new Promise((resolve, reject) => {
        request(url.buildUrl("api/datasources", "GET", ""), (error, response, body) => {
            if (error) {
                reject(error);
            }
            else {
                var data = (JSON.parse(body));

                data.forEach(element => {
                    datasourceList[element.name] = {
                        "id": element.id,
                        "isDefault": element.isDefault,
                        "database": element.database,
                        "type": element.type,
                        "url": element.url
                    }

                });
                resolve(datasourceList)
            }


        });
    })
}
exports.getDatasourceList = getDatasourceList;