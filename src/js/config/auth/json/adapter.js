define(
    ['jquery', 'authSession', 'jsonUtil', 'jtiUser'],
    function ($, authSession, jsonUtil, jtiUser) {

        /**
         * Implementation of the JTIAuthAdapterInterface interface for 
         * exposing the Auth framework based on a JSON Configuration file
         * 
         * @see ../adapter.js
         */
        class JTIAuthAdapterInterfaceJSON {

            /**
             * Default Constructor
             * 
             * @override
             * @see ../adapter.js
             */
            constructor() {
                this.cTypeApplicationJSON = 'application/json';
                this.cTypeADFResourceItemJSON = 'application/vnd.oracle.adf.resourceitem+json';
            }

            /**
             * Tries a log in authentication attempt.
             * 
             * If the authentication is successful, the implementation has to set up 
             * the AuthSession object with their required data as part of the implementation
             * 
             * 
             * 
             * @param username <string> the username
             * @param password <string> the password
             * 
             * @returns {Promise} The promise will return and object with just a 
             * property (result) with true or false as values if the promise is resolved, 
             * or the error in case the promise is rejected
             * 
             * @override
             * @see ../adapter.js
             */
            authenticate(username, password) {

                var users = [ "john", "ana", "dino", "larisa", "fabrice" ]

                var serviceUrl = "js/data/login/authentication.xml"

                var defer = $.Deferred();
                $.ajax({
                    type: 'GET',
                    dataType: 'xml',
                    url: serviceUrl,
                    success: function (data) {
                        if ( users.indexOf ( username ) > -1 && username === password ){
                            let userToken = null
                            let responseText = $(data).find("authenticationToken").text()
                            if (null !== responseText) {
                                let json = JSON.parse(responseText);
                                userToken = json.userToken
                            }
                            if (null !== userToken) {
                                authSession.setAttribute("username", username)
                                authSession.setAttribute("userToken", userToken)
                                authSession.setAttribute("authorization", "Basic ZG9yaW4uYmVuZUBvcmFjbGUuY29tOmRvcmluMFNDJA==")
                                defer.resolve({
                                    result: true
                                })
                            } else {
                                defer.resolve({
                                    result: false
                                })
                            }                                
                        } else {
                            defer.resolve({
                                result: false
                            })
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.error(xhr);
                        defer.reject(xhr);
                    }
                });

                return $.when(defer);

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
             * @override
             * @see ../adapter.js
             */
            authorize() {
                var serviceUrl = "js/data/login/users.json"

                var defer = $.Deferred();          
                $.ajax({
                    type: 'GET',
                    url: serviceUrl,
                    success: function (data) {
                        let dataJson = jsonUtil.responseToArray(data, [])                        
                        let validUser = dataJson.filter( obj =>{
                            return obj.FakeUsername === authSession.getAttribute("username")
                        })
                        if (validUser.length > 0){
                            console.log (validUser)
                            jtiUser.setResourceProfileId( validUser[0].ResourceProfileId )
                            jtiUser.setPartyId( validUser[0].PartyId )
                            jtiUser.setPartyNumber( validUser[0].PartyNumber )
                            jtiUser.setPartyName( validUser[0].PartyName )
                            jtiUser.setPersonFirstName( validUser[0].PersonFirstName )
                            jtiUser.setPersonLastName( validUser[0].PersonLastName )
                            jtiUser.setLocale( validUser[0].Locale )
                            jtiUser.setRole( validUser[0].Role )
                            jtiUser.setPersonProfileImage( validUser[0].ProfileImage );
                            jtiUser.setMarket( validUser[0].__ORACO__DistributionCentre_c );
                            jtiUser.setuserManagerFullName(validUser[0].ResourceManagerName);
                            defer.resolve({
                                result: true
                            })
                        } else {
                            defer.resolve({
                                result: false
                            })
                        }
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        console.error(xhr);
                        defer.reject(xhr);
                    }
                });
                return $.when(defer);
            }

        }

        return JTIAuthAdapterInterfaceJSON;

    }
);