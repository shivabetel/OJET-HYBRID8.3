define(['dbProvider',
    'offline/datamodels/pushqueue',
    'jtiSqlServices',
    'jtiServices',
    'authSession',
    'text!config/tableDTO/syncDTO.json',
    'jsZipUtil',
    'jszip',
    'dateUtil'], function (dbProvider, PushQueue, jtiSqlServices, JtiServices,
        authSession, syncDTOJSON, jsZipUtils, jszip, dateUtil) {
    'use strict';

    const jtiServices = new JtiServices()

    let transaction = null

    class SyncDown {

        constructor() {
            this.pushQueue = new PushQueue()
            this.batchStatementsPromises = {}
        }

        createPushQueue() {
            return dbProvider.create({
                tableName: this.pushQueue['table'],
                cols: this.pushQueue['item']
            })
        }

        initializeSync() {

            return new Promise((resolve, reject) => {
                // dbProvider.getTransaction(tx => {
                //     transaction = tx;
                //     Promise.all(this.dropTables())
                //         .then(() => Promise.all([this.getAssortmentFiles()]))//this.getAccounts(),this.getLovs(),
                //         .then(resolve)
                //         .catch(error => reject(error))
                // }, error => reject(`error opening transaction ${error}`))

                Promise.all([this.getAssortmentFiles(), this.getAssortmentPlans()])//this.getAssortmentPlans()
                    .then((values) => {
                        
                        dbProvider.getTransaction(tx => {
                            transaction = tx
                            this.batchStatementsPromises['dropTables'] = this.dropTables()
                            this.batchStatementsPromises['assortmentFiles'] = jtiSqlServices.insertOrUpdate({
                                tableName: values[0].tableName,
                                tableData: values[0].tableData,
                                isOecEntity: values[0].isOecEntity

                            }, transaction)

                            this.batchStatementsPromises['assortment_plans'] = new Promise((resolveFn, rejectFn) => {
                                if (values[1] && values[1]['assortment_plans'] && values[1]['assortment_plans'].tableData &&
                                    Array.isArray(values[1]['assortment_plans'].tableData)) {

                                    let _assortmentPlanPromises = values[1]['assortment_plans'].tableData.map(row => {
                                        return new Promise((rFn, rejRn) => {
                                            jtiSqlServices.insertOrUpdate({
                                                tableName: values[1]['assortment_plans'].tableName,
                                                tableData: row,
                                                isOecEntity: values[1]['assortment_plans'].isOecEntity

                                            }, transaction)
                                                .then((result) => {
                                                    let assortmentLinesTableDataPerPlanId = values[1]['assortment_lines']['tableData']
                                                        .filter(dataRow => Object.keys(dataRow)[0] == row['Id'])

                                                    let _assortmentLinesInsertPromises = assortmentLinesTableDataPerPlanId
                                                        .map(lineRow =>
                                                            jtiSqlServices.insertOrUpdate({
                                                                tableName: values[1]['assortment_lines'].tableName,
                                                                tableData: lineRow[Object.keys(lineRow)[0]],
                                                                isOecEntity: values[1]['assortment_lines'].isOecEntity,
                                                                parentDetails: {
                                                                    type: 'assortment_plans',
                                                                    id: row['Id'],
                                                                    localId: result[0]['insertId']
                                                                }
                                                            }, transaction)
                                                        )

                                                    Promise.all(_assortmentLinesInsertPromises)
                                                        .then(rFn, () => rejRn('error while inserting to assortment_lines'))
                                                }, () => rFn('error while inserting to assortment_plans'))
                                        })




                                    })

                                    Promise.all(_assortmentPlanPromises)
                                        .then(resolveFn)
                                        .catch(error => rejectFn(error))

                                }
                            })



                            //...this.batchStatementsPromises['assortment_lines']



                            Promise.all(this.batchStatementsPromises['dropTables'])
                                .then(() => Promise.all([this.batchStatementsPromises['assortmentFiles'], this.batchStatementsPromises['assortment_plans']]))
                                .then(resolve)
                                .catch(error => reject(error))

                        }, error => reject(`error opening transaction ${error}`))

                    })
            })


        }

        getAssortmentFiles() {
            if ((device.platform.toLowerCase() == "android") || (device.platform.toLowerCase() == "ios")) {
                return this.getAssortmentFiles_mobile();
            } else {
                return this.getAssortmentFiles_web();
            }

        }

        getAssortmentFiles_mobile() {
            return new Promise((resolve, reject) => resolve())
        }

        getAssortmentFiles_web() {
            return new Promise((resolve, reject) => {
                jsZipUtils.getBinaryContent("https://objectstorage.eu-frankfurt-1.oraclecloud.com/n/jtiblueprintlab/b/mobile-bucket/o/Archive.zip", (error, data) => {
                    

                    jszip.loadAsync(data)
                        .then(zip => {
                            Object.keys(zip.files).forEach(fileName => {
                                if (fileName.endsWith('products.json')) {
                                    zip['files'][fileName]
                                        .async("string")
                                        .then(fileContents => {
                                            let entityName = fileName.replace(/^.*[\\\/]/, '').split('.')[0];
                                            const data = JSON.parse(fileContents)
                                            
                                            // jtiSqlServices.insertOrUpdate({
                                            //     tableName: entityName,
                                            //     tableData: data,
                                            //     isOecEntity: true

                                            // }, transaction).then(resolve, error => reject(`Error while inserting products data ${error}`))
                                            resolve({
                                                tableName: entityName,
                                                tableData: data,
                                                isOecEntity: true
                                            })

                                        })

                                }
                            })
                        }, error => reject(`error on reading zip file ${error}`))
                })
            })
        }

        getAssortmentPlans() {
            return new Promise((resolve, reject) => {
                let currentDate = dateUtil.getCurrentDate(dateUtil.DF6)
                jtiServices.getAssortmentPlans(currentDate).then(data => {

                    let returnObj = {
                        'assortment_plans': {
                            tableName: 'assortment_plans',
                            tableData: data['items'],
                            isOecEntity: true
                        }
                    }

                    if (data && data['items'] && Array.isArray(data['items'])) {
                        let _promises = data['items'].map(assortmentPlan => {
                            return new Promise((resolveFn, rejectFn) => {
                                jtiServices.getAssortmentLines(assortmentPlan['Id'])
                                    .then(resolveFn({
                                        [assortmentPlan['Id']]: data && data['items'] || []
                                    }), error => rejectFn(error))
                            })
                        })

                        Promise.all(_promises)
                            .then(values => resolve(Object.assign(returnObj, {
                                'assortment_lines': {
                                    tableName: 'assortment_lines',
                                    tableData: values,
                                    isOecEntity: true
                                }
                            })))
                            .catch(error => reject(error))
                    }


                    resolve(returnObj)
                })
                    .catch(error => reject(error))
            })
        }

        getAssortmentLines() {

        }

        getAccounts() {
            return new Promise((resolve, reject) => {
                jtiServices.getAccountProps().then((responseData) => {
                    const accountProps = (responseData && responseData['Resources']
                        && responseData['Resources']['accounts']
                        && responseData['Resources']['accounts']['attributes']) || []

                    let tableColumns = accountProps.reduce((colsStr, accountProp) => colsStr ? `${colsStr}, ${accountProp['name']} ${accountProp['type']}` : `${accountProp['name']} ${accountProp['type']}`, "")
                    const syncDataPropsArr = JSON.parse(syncDTOJSON)
                    tableColumns = syncDataPropsArr.reduce((colsStr, key) => colsStr ? `${colsStr}, ${key}` : `${key}`, tableColumns)
                    
                    dbProvider.getStatement({
                        operationType: 'CREATE',
                        tableName: 'accounts',
                        tableColumns
                    })

                    dbProvider.create({
                        tableName: 'accounts',
                        cols: tableColumns
                    })
                        .then(() => jtiServices.getAccounts("PartyId,PartyNumber,OrganizationName,PrimaryContactName,FormattedPhoneNumber,FormattedFaxNumber,OwnerName,ParentAccountName,CurrencyCode,CorpCurrencyCode,EmailAddress,CreatedBy,CreationDate,AddressNumber,AddressLine1,AddressLine2,AddressLine3,AddressLine4,Building,City,Country,County,FloorNumber,PostalCode,PostalPlus4Code,Province,State,Description,AddressType,PhoneNumber,OrganizationDEO_Status_c,OrganizationDEO_AccountType_c,OrganizationDEO_AccountClass_c,OrganizationDEO_MarketChannel_c,OrganizationDEO_GlobalChannel_c,OrganizationDEO_TradeSegment_c,OrganizationDEO_ReasonForInactivation_c,OrganizationDEO_VisitRequired_c,OrganizationDEO_Status_c,OrganizationDEO_ConsumerSegmentPr_c,OrganizationDEO_CustomerSince_c,OrganizationDEO_VisitFrequency_c,OrganizationDEO_ConsumerSegmentSec_c,OrganizationDEO_BrandFocus_c,OrganizationName,OrganizationTypeCode,OrganizationDEO_LastVisitDate_c,OrganizationDEO_InactivatedSince_c,OrganizationDEO___ORACO__Distributor_c,OrganizationDEO___ORACO__PriorityPortfolio_c,OrganizationDEO_IATA_c,SalesProfileStatus"))
                        .then(response => {
                            
                            resolve(response)
                        })
                        .catch(error => reject(error))


                }).catch(error => reject(error))
            })
        }

        getLovs() {
            return new Promise((resolve, reject) => {
                let lovArr = ['JTI_SALES_ORGANIZATION', 'countries', 'currency', 'PARTY_SITE_USE_CODE', 'JTI_MARKETCHANNEL', 'JTI_TRADESEGMENT', 'JTI_ACCOUNTCLASS', 'JTI_GLOBALCHANNEL', 'JTI_ACCOUNTTYPE', 'JTI_ACCOUNTSTATUS', 'JTI_REASONFORINACTIVATION', 'JTI_ACCOUNTCONSUMERSEGMENTSEC', 'JTI_ACCOUNTCONSUMERSEGMENTPR', 'JTI_NOTE_TYPE', 'ZCA_ACCOUNT_TYPE', 'ORA_ACO_VISIT_STATUS', 'JTI_BRAND_FAMILY', 'JTI_MANUFACTURER', 'JTI_PRODUCT_TYPE', 'ORA_ACO_TASK_REASON_CODE', 'ZCA_SALES_ACCOUNT_STATUS', 'ZCA_CONTACT_TYPE', 'ORA_HZ_CONTACT_ROLE', 'RESPONSIBILITY', 'CONTACT_TITLE', 'JTI_TASK_CATEGORY', 'JTI_AVAILABILITY', 'JTI_PRODUCT_PRIORITY', 'ORA_ACO_SURVEY_TPL_STATUS', 'ORA_ACO_SURVEY_FREQ'];
                //let lovArr = [ 'PARTY_SITE_USE_CODE'];

                function successCB(data, lov, resolveFn) {
                    let lovValues = data && data['items']
                    if (lovValues) {
                        if (lov == 'countries' || lov == 'currency') {
                            authSession.setAttribute(lov, JSON.stringify(data.items));
                            resolveFn()
                        }
                        else {
                            let tableName = (lov === 'JTI_SALES_ORGANIZATION') ? `lov_${lov}` : 'lovs'
                            let tableData = (lov === 'JTI_SALES_ORGANIZATION') ? lovValues : `'', '${lov}', '${JSON.stringify(lovValues)}'`
                            let condition = (lov === 'JTI_SALES_ORGANIZATION') ? null : `lovType='${lov}'`
                            let tableColumns = (lov === 'JTI_SALES_ORGANIZATION') ? lovValues : 'country, lovType, data'

                            if (lov === 'JTI_SALES_ORGANIZATION') {
                                resolveFn()
                            } else {
                                jtiSqlServices.insertOrUpdate({
                                    tableName,
                                    tableData,
                                    isOecEntity: false,
                                    condition,
                                    tableColumns
                                }).then(resolveFn)
                            }
                        }
                    }
                }
                let _promises = lovArr.map(lov => new Promise((resolve, reject) => {
                    jtiServices.getLovs(lov)
                        .then((data) => successCB(data, lov, resolve))
                        .catch(error => reject(error))
                }))


                Promise.all(_promises)
                    .then(resolve)
                    .catch(error => reject(error))
            })


        }

        dropTables() {
            let tables = ["accounts", "visits", "account_notes", "account_addresses", "contacts", "routes", "routes_details", "store_visit_tasks", "audit_details", "account_attachments", "visit_attachments", "visit_notes", "assortment_plans", "account_assortment_plans", "assortment_lines", "products", "planograms", "audit_history", "adhoc_task_list", "visit_templates", "task_templates", "account_survey_template", "survey_template", "lov_JTI_SALES_ORGANIZATION", 'survey_page_question', 'survey_details', 'survey_executor'];
            let _promises = tables.map(tableName => dbProvider.dropTable(tableName, transaction))
            return _promises
            //return jtiSqlServices.deleteMultipleTables(...tables);
        }
        checkForSync() {
            return new Promise((resolve, reject) => {
                this.createPushQueue()
                    .then(() => dbProvider.getData("SELECT * FROM push_queue WHERE status = 'pending' OR status = 'pushed' or status = 'hold' OR (status = 'error' AND ((httpCode >= 500 OR httpCode = 404 OR httpCode != '')  ))"))
                    .then(result => {
                        

                        if (result && result['count'] <= 0) {
                            this.initializeSync().then(resolve, error => reject(error))
                        } else {
                            resolve()
                        }


                    })
                    .catch(error => reject("Error while sync down"))

            })
        }


    }

    return new SyncDown()

});