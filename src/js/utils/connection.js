define(['ojs/ojcore'
], function(oj) {
    
    function NetworkMonitor() {

        console.log("Netwrok monitor")
        function onlineHandler(){
            console.log("online ")
        }

        function offlineHandler(){
            console.log("offline ")
        }

        window.addEventListener('offline', offlineHandler, false)
        window.addEventListener('online', onlineHandler, false)

    }

    return NetworkMonitor
    
});