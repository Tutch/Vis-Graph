var express = require('express');
var app = express();

class ReportServer {
    constructor(port, options={}){
        this.reports = {};
        
        this.serveInterface(options);
        
        app.listen(port, () => {
            console.log(`im alive at port ${port}`);
        })

        app.get('/reports/rule-violations', (req, res) => {
            res.send(this.reports['rule-violations']);
        });
    }

    serveInterface(options) {
        // if(options['interface-folder'] == undefined) {
        //     app.use(express.static(options['interface-folder']));
        // }else {
            app.use(express.static('interface'));
        // }
    }

    setRuleViolations(data) {
        this.reports['rule-violations'] = data;
    }
}



module.exports = ReportServer;