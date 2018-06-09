// Selecionar regra
Vue.component('pick-rule', {
    props: ['items'],
    data() {
        return {
            choosenRule:''
        }
    },
    template: `
        <div>
            <select v-model="choosenRule" @change="pickedRule">
                <option disabled value="">Choose violation rule</option>
                <option v-for="item in items">{{item}}</option>
            </select>
        </div>
    `,
    methods: {
        pickedRule: function() {
            this.$emit('violation-rule-picked', this.choosenRule);
        }
    }
})

// Gráfico
Vue.component('rule-graph', {
    props: ['violations'],
    template: `
        <div>{{violations}}</div>
    `
})

// App
var app = new Vue({
    el: '#app',
    data: {
        violations_from_rule: [],
        rule_violations: [],
        violation_headers: [],
    },
    created() {
       this.getRuleViolations();
    },
    methods: {
        getRuleViolations: function() {
            this.$http.get('http://localhost:6060/reports/rule-violations')
            .then(response => {
                this.rule_violations = JSON.parse(response.bodyText); 
                this.violation_headers = Object.keys(JSON.parse(response.bodyText));    
            })
            .catch(error => {
                console.log(error.statusText)
            });
        },
        ruleFromPickRule: function(rulename) {
            this.choosen_rule = rulename;
            this.violations_from_rule = this.rule_violations[rulename];
        }
    }
})
