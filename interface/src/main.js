// Selecionar regra
Vue.component('pick-rule', {
    template: '<div>select</div>'
})

// Gráfico
Vue.component('rule-graph', {
    template: '<div>graph</div>'
})

// App
var app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!'
    },
    created() {
        this.getRuleViolations();
    },
    methods: {
        getRuleViolations: function() {
            this.$http.get('http://localhost:6060/reports/rule-violations')
            .then(response => {
                console.log(JSON.parse(response.bodyText));     
            })
            .catch(error => {
                console.log(error.statusText)
            });
        }
    }
})
