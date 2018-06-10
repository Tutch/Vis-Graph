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
        <div id="rule-graph"></div>
    `,
    watch: {
        violations: function() {
            var nodes = new vis.DataSet([
                {id: 1, label: 'Node 1'},
                {id: 2, label: 'Node 2'},
                {id: 3, label: 'Node 3'},
                {id: 4, label: 'Node 4'},
                {id: 5, label: 'Node 5'}
            ]);
        
            // create an array with edges
            var edges = new vis.DataSet([
                {from: 1, to: 3},
                {from: 1, to: 2},
                {from: 2, to: 4},
                {from: 2, to: 5}
            ]);
        
            // create a network
            var container = document.getElementById('rule-graph');
        
            // provide the data in the vis format
            var data = {
                nodes: nodes,
                edges: edges
            };

            var options = {
                autoResize: true,
                height:'100%',
                width:'100%',
                physics: {
                   enabled: false 
                }
            };
        
            // initialize your network!
            var network = new vis.Network(container, data, options);
        }
    }
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
