var RULE_VIOLATION = {
    id:'Rule Id',
    rule_label:'Rule Label',
    desc:'Rule Description',
    level:'Criticality',
    violation:'Violation Kind',
    violation_label:'Violation Label',
    from_unit:'FomUnit Id',
    to_unit:'ToUnit Id'
}

class Reportconfig {
    static get ruleViolationConfig() {
        return RULE_VIOLATION;
    }
}

module.exports = Reportconfig;