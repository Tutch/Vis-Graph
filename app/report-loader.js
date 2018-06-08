var csv = require('fast-csv');
var ReportConfig = require('./report-config');

var ruleViolationConf = ReportConfig.ruleViolationConfig;

// Constrói um object os dados de cada entrada.
// A primeira coluna do csv (id da regra) é usada como chave.
// Cada contém o array com o resto das informações.
function buildObj(csvdata) {
    let ruleViolations = {};

    csvdata.forEach(entry => {
        let ruleId = entry[ruleViolationConf['id']];
    
        if(!Object.keys(ruleViolations).includes(ruleId)) {
            ruleViolations[ruleId] = []
        }
        
        ruleViolations[ruleId].push(entry);
    });

    return ruleViolations;
}

// Carrega os dados do CSV do relatório e
// organiza um objeto que tem como chaves os
// ids das regras
function loadReport(path) {
    return new Promise((resolve, reject) => {
        let loadedData = [];
        csv.fromPath(path, {delimiter:';', headers:true})
        .on('data', (data) => {
            loadedData.push(data);
        })
        .on('end', () => {
            resolve(buildObj(loadedData));
        })
        .on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = loadReport;