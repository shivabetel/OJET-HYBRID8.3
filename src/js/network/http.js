define(['ojs/ojcore',
    'ojs/ojmodel',
    'appConfig',
    'authSession'], function (oj, Model, appconfig, authsession) {

        const defaultApiHeaders = {
                Authorization: authsession.getAttribute("authorization"),
                'external-authorization': authsession.getAttribute("authorization"),
                'Oracle-Mobile-Backend-ID':  appconfig.dev.omh.mobile_backend
        }
        const defaultApiOptions = (options) => {
           return Object.assign({
                headers: Object.assign({}, defaultApiHeaders, (options.headers || {})),
                type: options['method']

            })
        }
        const getURL = (apiEndpoint, options) => {
            return Object.assign({ url: apiEndpoint }, { ...defaultApiOptions(options) })
        }


        function HttpLib() {
            var self = this;

            const getServerQueueModel = (apiEndpoint, options) => {
                return new (Model.Model.extend({
                    urlRoot: apiEndpoint,
                    customURL: function (operation, model) {
                        const customURL = getURL(apiEndpoint, options);
                        console.log("customURL",customURL);
                        return customURL;
                    },
                    parseSave: () => {
                      //  return Object.assign({ payload: { ...options[data] } }, commonBody);
                    },
                    parse: (response) => {
                        return response;
                    }
                    


                }))
            }

            self.get = function (apiEndpoint, options) {
                options = Object.assign(options = {}, {method: 'GET'})
                return getServerQueueModel(apiEndpoint, options).fetch({
                    "success": function (model, response, options) {
                        return new Promise((resolve) => resolve(response))
                      }, "error": function (err) {
                        return new Promise((reject) => reject(err))
                      }
                })
            }

            self.post = function (apiEndpoint, options) {
                options = Object.assign(options = {}, {method: 'POST'})
               return getServerQueueModel(apiEndpoint, options).save(undefined, {
                    "success": function (model, response, options) {
                        return new Promise((resolve) => resolve(response))
                      }, "error": function (err) {
                        return new Promise((reject) => reject(err))
                      }
                })
            }



        }

        return HttpLib;
    })