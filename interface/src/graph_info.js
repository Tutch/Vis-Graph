var Throughtput = {
    low: {
        cut:0.20,
        factor:2
    },
    medium: {
        factor:2
    },
    high: {
        cut:0.3,
        factor:2
    }
}

var Criticality = {
    LOW: {
        color: 'yellow'
    },
    MEDIUM: {
        color: 'orange'
    },
    HIGH: {
        color: 'red'
    }
}

var ViolationTypes = {
    SIGNALING: {
        dash:1, 
        gap:2
    },
    RAISING: {
        dash:4, 
        gap:2
    },
    HANDLING: {
        dash:0,
        gap:0
    }
};