define([
    'ojs/ojcore',
    'knockout',
    'appConfig',
    'jtiSqlServices',
    'ojs/ojtranslation',
    'jtiServices',
    'authSession',
    'jtiUser',
    'syncDown',
    'ojs/ojinputtext',
    'ojs/ojformlayout',
    'ojs/ojbutton'
], function (oj, ko, AppConfig, jtiSqlServices, Translations, JtiServices,
    authSession, jtiUser, syncDown) {
    'use strict';

    console.log("AppConfig", AppConfig)

    const jtiServices = new JtiServices()


    // const createResources = (data) => {
    //     return new Promise((resolve, reject) => {
    //         jtiSqlServices.deleteMultipleTables('resource', 'employee_info').then(() => Promise.all(
    //             [jtiSqlServices.insertOrUpdate(
    //                 {
    //                     tableName: 'resource',
    //                     tableData: data,
    //                     isOecEntity: true,
    //                     condition: `ResourceProfileId =${data.ResourceProfileId}`
    //                 }),
    //             jtiServices.getEmployeeInfo({ resourceProfileId: data.ResourceProfileId })
    //                 .then((employeeRecord) => {
    //                     let employeeInfo = (employeeRecord && employeeRecord['items'] && employeeRecord['items'][0])
    //                     return employeeInfo ? jtiSqlServices.insertOrUpdate(
    //                         {
    //                             tableName: 'employee_info',
    //                             tableData: employeeInfo,
    //                             isOecEntity: true,
    //                             condition: `Id =${employeeInfo['Id']}`
    //                         }) : new Promise.resolve()

    //                 })
    //             ]
    //         ))
    //             .then(() => resolve())
    //             .catch(error => reject(error))
    //     })
    // }

    function LoginViewModel(params) {
        console.log("params", params)
        var self = this;
        params = params || {}
        self.router = params['parentRouter']
        self.obsUsername = ko.observable()
        self.obsPassword = ko.observable()
        self.versionNumber = ko.observable(AppConfig.app.version)
        self.appName = ko.observable(AppConfig.app.appName)
        self.lngStrings = {
            username: Translations.getTranslatedString('login.username') || 'Username',
            password: Translations.getTranslatedString('login.password') || 'Password',
            login: Translations.getTranslatedString('login.login') || 'Login'
        }

    }

    LoginViewModel.prototype.connected = function () {
        let self = this;
        self.eventLoginBtnClicked = self.eventLoginBtnClicked.bind(this)
    }

    LoginViewModel.prototype.syncDownData = function () {
        return syncDown.checkForSync()
    }

    LoginViewModel.prototype.eventLoginBtnClicked = function (event, data, bindingContext) {
        event.preventDefault()
        console.log(event, data, bindingContext)
        const self = this
        // document.getElementById('loginContainer')
        // .dispatchEvent(new CustomEvent('jtiNotification', {
        //     bubbles: true
        // } )
        // )

        //console.log( document.getElementsByTagName("jti-loader")[0])
        document.getElementsByTagName("jti-loader")[0].start();

        //oj.OffcanvasUtils.open({selector: '#connectionDrawer', modality: 'modaless', displayMode: 'overlay', content: '#pageContent'});

        //Database.create({tableName: 'customer', cols: 'customerId, firstName, lastName, emailId' })
        // Database.executeQuery("SELECT * from customer").then(res => console.log("result**",res), 
        // (error) => console.log("error",error))
        authSession.setAttribute("authorization", 'Basic ' + btoa(self.obsUsername() + ':' + self.obsPassword()))
        authSession.setAttribute("username", self.obsUsername().toUpperCase())
        jtiServices.authenticate({
            username: self.obsUsername()
        }).then(response => {
            response && response['items'] &&
                jtiSqlServices.createResources(response['items'][0]).then(() => {
                    jtiUser.setResourceProfileId(data.ResourceProfileId);
                    jtiUser.setResourcePartyId(data.ResourcePartyId)
                    jtiUser.setPartyId(data.ResourcePartyId);
                    jtiUser.setPartyNumber(data.PartyNumber);
                    jtiUser.setPartyName(data.PartyName);
                    jtiUser.setPersonFirstName(data.FirstName);
                    jtiUser.setPersonLastName(data.LastName);
                    // jtiUser.setLocale(data.Locale)// it is missing in response
                    if (data.Language_c == "en_US")
                        jtiUser.setLocale("en-US" || 'en');
                    if (data.Language_c == "it_IT")
                        jtiUser.setLocale("it-IT" || 'en');
                    // jtiUser.setRole(data.Role) IndividualRoleCode is there instead of role
                    jtiUser.setRole(data.ResourceOrgRoleCode);
                    jtiUser.setRoleName(data.ResourceOrgRoleName);
                    jtiUser.setPersonProfileImage(data.ProfileImage || `css/images/${data.Username}.jpg`);
                    //jtiUser.setPersonProfileImage(data.ProfileImage) image is missing
                    jtiUser.setMarket(data.__ORACO__Segment_c);
                    jtiUser.setuserManagerFullName(data.ResourceManagerName);

                    self.syncDownData().then(() => {
                        self.router.go("dashboard")
                        document.getElementsByTagName("jti-loader")[0].stop();
                    })
                        .catch((error) => {
                            console.log("login error", error)
                            document.getElementsByTagName("jti-loader")[0].stop()
                        })

                })
        })
            .catch(error => console.log("login error", error))

    }


    console.log("LoginViewModel", LoginViewModel)
    return LoginViewModel

});