define(
    [],     
    function () {

        /**
         * The Object that will implement this interface MUST
         * honour the following signature, so all the implementations
         * shall implement this "interface"
         * 
         * The implementations MUST implement the following methods
         * - authenticate (string, string) : promise
         * - authorize () : promise
         * 
         * Those three methods are the ONLY ones that the app code shall 
         * invoke, the other ones that might exists inside the implementations
         * must be considered as part of the implementation, but not public
         * 
         * All the implementations must have to keep in condiratiomn the role
         * of the user for returning the specific data according JTI's configuration
         * 
         */
        class JTIAuthAdapterInterface {

            /**
             * Default Constructor
             * 
             * As this is the interface, we don't want to get actually an instance of this
             */
            constructor() {
                throw Error("Can't construct a reference interface");
            }
         
           /**
            * Tries a log in authentication attempt.
            * 
            * If the authentication is successful, the implementation has to set up 
            * the AuthSession object with their required data as part of the implementation
            * 
            * @param username <string> the username
            * @param password <string> the password
            * 
            * @returns {Promise} The promise will return and object with just a 
            * property (result) with true or false if the promise is resolved, 
            * or the error in case the promise is rejected
            * 
            * @see ./session.js
            */
            authenticate( username, password ) { 
            }

            /**
             * Proceeds with the autorization of the user in the systm. 
             * 
             * This method has to use the AuthSession object for gathering the required information
             * from the user for performing the authorization, so the username | email, the token or
             * any other property required for further requests has to be setted in the authenticate()
             * method.
             * 
             * The implementation is also in charge of setting up accordingly the JTIUser object with 
             * all the required data 
             * 
             * @returns {Promise} The promise will return and object with just a 
             * property (result) with true or false as values if the promise is resolved, 
             * or the error in case the promise is rejected
             * 
             * @see ./session.js
             * @see ../jtiuser.js
             */
            authorize() {
            }

        }

        /* 
         * Explosing the class. We don't want to return an instance, as the provider will build it for us
         */
        return JTIAuthAdapterInterface;

    }
);