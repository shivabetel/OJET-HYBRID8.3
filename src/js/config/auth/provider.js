define(
    [ "./config/auth/json/adapter" ], 
    function (adapterImpl) {
        "use strict";

        var instance = null;

        /**
         * Provider of the AuthProvider services.
         *
         * It loads the provider adapter based on the requireJS dependencies
         * specified in the define block.
         *
         * All the Adapters implementatioms must abide the Adapter interface
         * specified and documented
         */
        class AuthProvider {
    
            /**
             * Default Constructor
             */
            constructor() {
                console.log("Creating an instance of the  AuthProvider class");
                this._adapter = new adapterImpl();
            }

            /**
             * Gets an instance of the current adapter for the service
             *
             * @return object an instance of the adapter for this service
             */
            getProvider() {
                console.log("Retrieving the cached instance of the Auth implementation");
                return this._adapter;
            }
        }
    
        if ( null === instance ){
            instance = new AuthProvider();
        }
    
        return instance.getProvider();
    

    }
);
