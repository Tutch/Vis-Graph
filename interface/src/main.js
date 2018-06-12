// Legenda do gráfico
Vue.component('graph-legend', {
    props:[],
    template:`
        <legend>
            <div id="legend-box">
                <h4>Criticality</h4>
                <div class="legend-wrapper" id="legend-crit">
                    <span>Lower</span>
                    <div id ="legend-square-wrapper">
                        <div class="legend-square crit-low"></div>
                        <div class="legend-square crit-medium"></div>
                        <div class="legend-square crit-high"></div>
                        <div class="legend-square crit-extreme"></div>
                    </div>
                    <span>Higher</span>
                </div>
            </div>
            <div id="legend-box">
                <h4>Violations</h4>
                <div class="legend-wrapper" id="legend-violations">
                    <div>
                        <dt><hr class="signaling"/></dt><dd>Signaling</dd>
                    </div>
                    <div>
                        <dt><hr class="throwing"/></dt><dd>Throwing</dd>
                    </div>
                    <div>
                        <dt><hr class="handling"/></dt><dd>Handling</dd>
                    </div>
                </div>
            </div>
        </legend>
    `
})

// Selecionar regra
Vue.component('pick-rule', {
    props: ['items'],
    template: `
        <div>
            <select v-model="choosenRule" @change="pickedRule">
                <option disabled value="">Choose violation rule</option>
                <option v-for="item in items">{{item}}</option>
            </select>
        </div>
    `,
    data() {
        return {
            choosenRule:''
        }
    },
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
            // Recebi uma nova regra!
            this.loadGraph();
        }
    },
    methods: {
        loadGraph: function() {
            var nodes = new vis.DataSet([]);
            var edges = new vis.DataSet([]);

            let nodes_in_graph = this.violations.nodes;
            let edges_in_graph = this.violations.edges;

            let max = 0;
            edges_in_graph.forEach(edge => {
                if(edge.count > max) {
                    max = edge.count;
                }
            })

            console.log(max);
            console.log(nodes_in_graph);

            // Adding nodes to dataset
            nodes_in_graph.forEach(n => {
                nodes.add(n);
            })

            let low_break = Math.ceil(max * Throughtput.low.cut);
            let high_break = max - Math.ceil(max * Throughtput.high.cut);

            edges_in_graph.forEach(e => {
                this.setupEdge(e, edges, low_break, high_break);
            })

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
                   enabled: true 
                },
                nodes: {
                    shape: 'box',
                    margin: 10
                },
                edges: {
                    arrows:'to',
                    length: 500
                }
            };
        
            // initialize your network!
            var network = new vis.Network(container, data, options);
            network.on("stabilizationIterationsDone", function () {
                network.setOptions( { physics: false } );
            });
        },
        setupEdge(edge, edges_dataset, low_break, high_break) {
            let violation_type = ViolationTypes[edge.type];
            let criticality = edge.criticality;
            let factor = null;

            if(edge.count <= low_break) {
                factor = Throughtput.low.factor;
            }else if(edge.count > high_break) {
                factor = Throughtput.high.factor;
            }else {
                factor = Throughtput.medium.factor;
            }

            line = [violation_type.dash * factor, 
                    violation_type.gap * factor];

            edges_dataset.add({
                from:edge.from, 
                to:edge.to,
                color: {
                    color: Criticality[criticality].color
                },
                arrowStrikethrough: false,
                dashes: line,
                width: factor
            });
        }
    }
})

// App
var app = new Vue({
    el: '#app',
    data: {
        violations_from_rule: [],
        rule_violations: {},
        violation_headers: []
    },
    created() {
       this.getRuleViolations();
    },
    methods: {
        getRuleViolations: function() {
            this.$http.get('http://localhost:6060/reports/rule-violations')
            .then(response => {
                let violations = JSON.parse(response.bodyText); 
                this.precomputeGraph(violations)
            })
            .catch(error => {
                console.log(error.statusText)
            });
        },
        precomputeGraph: function(violations) {
            this.violation_headers = Object.keys(violations);
            Object.keys(violations).forEach(rule => {
                if(!Object.keys(this.rule_violations).includes(rule)) {
                    this.rule_violations[rule] = {nodes:[], edges:[], max:0};
                }

                violations[rule].forEach(v => {
                    this.insertViolation(v, this.rule_violations[rule]);
                });
            });
        },
        insertViolation: function(violation, rule_violation_obj) {
            let origin = this.createOriginNode(violation);    
            let target = this.createTargetNode(violation);
            let current_nodes = rule_violation_obj.nodes;
            let current_edges = rule_violation_obj.edges;
            
            if(current_nodes.filter(n => n.id == origin.id).length == 0) {
                current_nodes.push(origin);
            }

            if(current_nodes.filter(n => n.id == target.id).length == 0) {
                current_nodes.push(target);
            }

            this.createEdge(origin.id, target.id, current_edges, violation);
        },
        createEdge: function(origin_id, target_id, current_edges, violation) {
            let violation_type = violation['Violation Kind'];
            let criticality = violation['Criticality'];
            
            let newedge = {
                from:origin_id, 
                to:target_id, 
                type:violation_type,
                criticality:criticality
            };

            if(!this.checkIfEdgeExists(newedge, current_edges)) {
                newedge.count = 1;
                current_edges.push(newedge);
            }else {
                current_edges.forEach(edge => {
                    if(edge.from == newedge.from &&
                       edge.to == newedge.to && 
                       edge.type == newedge.type) {
                           edge.count += 1;
                       }
                });
            }
        },
        checkIfEdgeExists: function(edge, edge_list) {
            for(let i=0; i<edge_list.length; i++) {
                let index_edge = edge_list[i];

                if(index_edge.from == edge.from &&
                   index_edge.to == edge.to &&
                   index_edge.type == edge.type) {
                    return true;       
                }
            }

            return false;
        },
        createOriginNode: function(violation) {
            return {
                id: violation['FomUnit Id'], 
                label: violation['FomUnit Id']
            }
        },
        createTargetNode: function(violation) {
            return {
                id: violation['ToUnit Id'], 
                label: violation['ToUnit Id']
            }
        },
        ruleFromPickRule: function(rulename) {
            this.choosen_rule = rulename;
            this.violations_from_rule = this.rule_violations[rulename];
        }
    }
})