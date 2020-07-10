define(
    ['jtiUser'],
    function (jtiUser) {

        "use strict";
        let instance = null;

        /**
         * Object that holds the session data required for the user journey and perform
         * additional request to the backend
         */
        class AuthSession {

            constructor() {
                //this.config = [ ]
            }

            /**
             * Checks if the user is logged in or not
             * 
             * @returns true or false, based in if the configuration is empty or not
             */
            isLoggedIn() {
                return localStorage.length > 0; //this.config.length > 0
            }

            /**
             * Invalidates the session.
             * 
             * It will clear the session config, the username, and the jtiuser data
             * 
             * @see ../jtiuser.js
             */
            invalidate() {
                //this.config = [ ]
                jtiUser.clearUser();
                //localStorage.clear();
                let keysToRemove = ["authorization", "username"];

                keysToRemove.forEach(k =>
                    localStorage.removeItem(k))
            }

            /**
             * Retrieves a value from the configuration
             * 
             * @param key <string> the key of the attribute
             * 
             * @returns <any> the value of the attribute, or undefined if the key is not found
             */
            getAttribute(key) {
                return localStorage.getItem(key); //this.config[ key ]; 
            }

            /**
             * Removes an item from the configuration based on its key
             * 
             * If the key is the latest one, and the session has not been YET invalidated, 
             * it will add a flag for identifying its a valid session
             * 
             * @param key <string> the key of the attribute to delete
             */
            removeAttribute(key) {
                let exists = localStorage.hasOwnProperty(key);
                if (exists) {
                    localStorage.removeItem(key);
                }
                if (localStorage.length === 0) {
                    localStorage.setItem("___VALID___", true)
                }
            }

            /**
             * Sets a value in the configuration
             * 
             * @param key <string> the key of the property
             * @param value <any> the value of the property
             */
            setAttribute(key, value) {
                if (typeof key === 'string' && null !== value) {
                    //this.config [ key ] = value
                    localStorage.setItem(key, value)
                }
            }
        }

        if (!instance) {
            instance = new AuthSession();
        }

        return instance;
    }
);