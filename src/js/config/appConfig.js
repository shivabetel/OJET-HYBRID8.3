define([], function (){
    return Object.freeze({
        app: {
            appId: 'jti.tme.connect.alfa',
            version: '4.2.6',
            appName: 'TME Connect Alfa',
            //: cordova.file.dataDirectory
        },
        dev: {
            oec: {
                baseUrl: "",
                crmUrl: 'https://fa-eobg-dev1-saasfaprod1.fa.ocs.oraclecloud.com/crmRestApi/resources/latest',
                hcmUrl: '',
                superUser: "Basic SlRJX0FQSV9VU0VSOmp0aUAxMjM0",
                loggedInuSer: ""
            },
            omh: {
                baseUrl: "https://6CAB3C35392D4ADC9276BF294ADE27B8.mobile.ocp.oraclecloud.com",
                customUrl: "/mobile/custom",
                platformUrl: "",
                mobile_backend: "551e7b20-930d-43b4-b07d-5460dc64e1cb",
                anonymous_key: ""
            }
        }
    })
})