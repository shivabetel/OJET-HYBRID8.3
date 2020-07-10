define(['../../js/network/http',
    'appConfig',
    'authSession'], function (HttpLib, appconfig, authSession) {
        'use strict';

        const omhBaseUrl = appconfig['dev']['omh']['baseUrl']
        const omhCustomUrl = appconfig['dev']['omh']['customUrl']
        const crmServiceHost = appconfig.dev.oec.crmUrl;

        class JtiServices {

            authenticate(payload = {}) {
                const http = new HttpLib();
                return http.get(`${omhBaseUrl}${omhCustomUrl}/customLogin?q=Username=${payload['username']}`)
            }

            getEmployeeInfo({ resourceProfileId = '' }) {
                const http = new HttpLib()
                var serviceURL = `${crmServiceHost}/EmployeeAdditionalInfo_c?q=OraZcxOwner_Id_c=${resourceProfileId}`;
                return http.get(serviceURL)

            }

            getLovs(lookUpCode) {
                let serviceURL = `${omhBaseUrl}${omhCustomUrl}`;
                if (lookUpCode === 'countries') {
                    serviceURL += `/fndTerritories`
                } else if (lookUpCode === 'currency') {
                    serviceURL += `/preferredCurrenciesLOV`
                } else if (lookUpCode === 'PARTY_SITE_USE_CODE') {
                    serviceURL += encodeURI(`/fndStaticLookups?finder=LookupTypeIsActiveEnabledFinder;BindLookupType=${lookUpCode}&q=Tag="SALES_CLOUD"&fields=LookupCode,Meaning,Tag&onlyData=true&limit=250`);
                } else {
                    serviceURL += `/fndStaticLookups?finder=LookupTypeIsActiveEnabledFinder;BindLookupType=${lookUpCode}&fields=LookupCode,Meaning&onlyData=true&limit=250`
                }
                const http = new HttpLib()
                return http.get(serviceURL, {});
            }

            getAccountProps() {
                let serviceURL = `${crmServiceHost}/accounts/describe`;
                const http = new HttpLib()
                return http.get(serviceURL);
            }

            getAccounts(accountsFields) {

                var serviceURL = `${omhBaseUrl}${omhCustomUrl}/accounts?q=RecordSet=MYSUBORDTEAMTERRACCTS&limit=50&onlyData=true`
                if (accountsFields) {
                    serviceURL = serviceURL + '&fields=' + accountsFields
                }
                const http = new HttpLib()
                return http.get(serviceURL);
            }

            getAssortmentPlans(currentDate) {
                var serviceURL = `${crmServiceHost}/__ORACO__AssortmentPlan_c?q=__ORACO__Segment_c="WWDF";;__ORACO__Status_c=ORA_ACO_ASSORT_PL_STAT_ACT;__ORACO__StartDate_c<=${currentDate}; __ORACO__EndDate_c>=${currentDate}&limit=50&onlyData=true`;

                let options = {}

                options['headers'] = {
                    'Authorization': 'Basic SlRJX0FQSV9VU0VSOmp0aUAxMjM0'
                }

                const http = new HttpLib()
                return http.get(encodeURI(serviceURL, options));
            }

            getAssortmentLines(assortmentPlanId) {
                var serviceURL = `${crmServiceHost}/__ORACO__ProdAssortmentLine_c?q=AssortmentPlan_Id___ORACO__AssortmentPlanLine=${assortmentPlanId}&limit=200`;
                const http = new HttpLib()
                return http.get(serviceURL, {});
              }
        }

        return JtiServices

    });