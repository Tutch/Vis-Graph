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
                    length: 300
                }
            };
        
            // initialize your network!
            var network = new vis.Network(container, data, options);
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
            let newedge = {
                from:origin_id, 
                to:target_id, 
                type:violation_type
            };

            if(!this.checkIfEdgeExists(newedge, current_edges)) {
                vis_edges.add({
                    from:origin_id, 
                    to:target_id,
                    color: {
                        color: ViolationTypes[violation_type].color
                    }
                });
                current_edges.push(newedge);
            }

            console.log(current_edges);
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