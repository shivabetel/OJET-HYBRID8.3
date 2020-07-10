define(
    ['jquery', 'authSession', 'jtiUser', 'dbProvider', 'dateUtil'],
    function ($, authSession, jtiUser, dbProvider, dateUtil) {

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

                // username = "dorin.bene@oracle.com";
                //  password = "dorin0SC$";

                var defer = $.Deferred();

                function make_base_auth(user, password) {
                    return "Basic " + btoa(user + ':' + password);
                }

                var settings = {
                    "async": true,
                    "url": "https://fa-eobg-test-saasfaprod1.fa.ocs.oraclecloud.com/km/api/latest/auth/authorize",
                    "method": "POST",
                    "dataType": "xml",
                    "headers": {
                        "Content-Type": this.cTypeApplicationJSON,
                        "Authorization": make_base_auth(username, password)
                    },
                    "data": {}
                }

                $.ajax(settings)
                    .done(function (response, textStatus, jqXHR) {
                        let userToken = null
                        let responseText = $(response).find("authenticationToken").text()
                        if (null !== responseText) {
                            let json = JSON.parse(responseText);
                            userToken = json.userToken
                        }
                        if (null !== userToken) {
                            authSession.setAttribute("username", username)
                            authSession.setAttribute("userToken", userToken)
                            authSession.setAttribute("authorization", make_base_auth(username, password))
                            defer.resolve({
                                result: true
                            })
                        } else {
                            defer.resolve({
                                result: false
                            })
                        }
                    })
                    .fail(function (xhr, ajaxOptions, thrownError) {
                        if (xhr.status === 401) {
                            defer.resolve({
                                result: false
                            })
                        } else {
                            defer.reject(xhr)
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
                var defer = $.Deferred();
                $.ajax({
                    type: 'GET',
                    url: 'https://fa-eobg-test-saasfaprod1.fa.ocs.oraclecloud.com/crmRestApi/resources/latest/resourceUsers?q=Username=' + authSession.getAttribute("username"),
                    // url: "https://fa-eobg-test-saasfaprod1.fa.ocs.oraclecloud.com/crmRestApi/resources/11.13.18.05/resources?q=EmailAddress=utkarsh.deniz@oracle.com&onlyData=true",
                    beforeSend: function (request) {
                        request.setRequestHeader('Authorization', 'Basic SlRJX0FQSV9VU0VSOmp0aUAxMjM0');
                    },
                    success: function (data) {

                        defer.resolve(data);
                        let dataJson = data.items;
                        let validUser = dataJson.filter(obj => {
                            return obj.Username === authSession.getAttribute("username")
                        })
                        if (validUser.length > 0) {
                            // push data to sqlite
                            console.log('calling create or inseret')
                            dbProvider.insertOrUpdate('CREATE', 'resource', validUser[0], 'GET', true, `ResourceProfileId =${validUser[0].ResourceProfileId}`).then(function (success) {
                                console.log(success);
                            }, function (err) {
                                console.log(err);
                            })

                            jtiUser.setResourceProfileId(validUser[0].ResourceProfileId)
                            jtiUser.setResourcePartyId(validUser[0].ResourcePartyId)
                            jtiUser.setPartyId(validUser[0].PartyId)
                            jtiUser.setPartyNumber(validUser[0].PartyNumber)
                            jtiUser.setPartyName(validUser[0].PartyName)
                            jtiUser.setPersonFirstName(validUser[0].PersonFirstName)
                            jtiUser.setPersonLastName(validUser[0].PersonLastName)
                            //jtiUser.setUserName(validUser[0].Username)
                            jtiUser.setLocale(validUser[0].Locale || 'en')
                            jtiUser.setRole(validUser[0].ResourceOrgRoleCode || 'Trade Marketer')
                            jtiUser.setPersonProfileImage(validUser[0].ProfileImage || "css/images/avatar_1.jpg");
                            jtiUser.setuserManagerFullName(validUser[0].ResourceManagerName);
                            //jtiUser.setMarket(validUser[0].__ORACO__DistributionCentre_c || "DC_Dutch_Market")
                            jtiUser.setMarket(validUser[0].__ORACO__Segment_c);
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