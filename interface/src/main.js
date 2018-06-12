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
            console.log(this.violations);    

            var nodes = new vis.DataSet([]);
            var edges = new vis.DataSet([]);

            // id dos nodos no grafo
            let nodes_in_graph = [];
            let edges_in_graph = [];

            this.violations.forEach(v => {
               this.insertViolation(v, nodes_in_graph, edges_in_graph, nodes, edges);
            });

            let max = 0;

            edges_in_graph.forEach(edge => {
                if(edge.count > max) {
                    max = edge.count;
                }
            })

            console.log(edges_in_graph);
            console.log(max);
            console.log(nodes_in_graph);

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
        createEdge: function(origin_id, target_id, current_edges, violation, vis_edges) {
            let violation_type = violation['Violation Kind'];
            let criticality = violation['Criticality'];
            
            line = [violation_type.dash, violation_type.gap];

            let newedge = {
                from:origin_id, 
                to:target_id, 
                type:violation_type,
            };

            if(this.checkIfEdgeExists(newedge, current_edges) == undefined) {
                newedge.count = 1;

                vis_edges.add({
                    from:origin_id, 
                    to:target_id,
                    color: {
                        color: Criticality[criticality].color
                    },
                    arrowStrikethrough: false,
                    dashes: line
                });

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
                    return edge;       
                }
            }

            return undefined;
        },
        buildBoxText: function() {
            
        },
        insertViolation: function(violation, current_nodes, current_edges, vis_nodes, vis_edges) {
            let origin = this.createOriginNode(violation);    
            let target = this.createTargetNode(violation);

            if(!current_nodes.includes(origin.id)) {
                vis_nodes.add(origin)
                current_nodes.push(origin.id);
            }

            if(!current_nodes.includes(target.id)) {
                vis_nodes.add(target)
                current_nodes.push(target.id);
            }

            this.createEdge(origin.id, target.id, current_edges, violation, vis_edges);
        }
    }
})

// App
var app = new Vue({
    el: '#app',
    data: {
        violations_from_rule: [],
        rule_violations: [],
        violation_headers: []
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
                this.calculateDivisions(this.rule_violations);
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