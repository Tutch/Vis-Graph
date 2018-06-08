var loadReport = require('./app/report-loader');
var ReportServer = require('./app/report-server');
var file = './reports/rule-violation-2018-06-06-16-35-49.csv';

var server = new ReportServer(6060);

// Carrega os dados do relatório desejado.
loadReport(file).then((parsedData) =>{
    server.setRuleViolations(parsedData);
}).catch(err => {
    console.log(err);
});
