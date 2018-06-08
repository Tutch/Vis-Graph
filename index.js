var loadReport = require('./app/report-loader');
var file = './reports/rule-violation-2018-06-06-16-35-49.csv';

// Carrega os dados do relatório desejado.
loadReport(file).then((parsedData) =>{
    let ruleIds = Object.keys(parsedData);
    console.log(parsedData);
    console.log(ruleIds);
}).catch(err => {
    console.log(err);
});
