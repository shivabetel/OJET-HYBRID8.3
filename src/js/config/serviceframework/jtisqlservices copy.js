define(['dbProvider',
    'authSession',
    'dateUtil'], function (dataBaseProvider, authSession, dateUtil) {
        'use strict';

        function getAuditColumns({
            operationType = "SELECT",
            pAuditDetails,
            httpMethod = 'GET'

        }) {
            let date = dateUtil.getCurrentDate();
            let obj = {}
            obj.SyncLocalId = '';
            if (pAuditDetails) {
                obj.SyncParentType = pAuditDetails.type;
                obj.SyncParentId = pAuditDetails.id;
                obj.SyncParentLocalId = pAuditDetails.localId ? pAuditDetails.localId : null;
            } else {
                obj.SyncParentType = null;
                obj.SyncParentId = null;
                obj.SyncParentLocalId = null;
            }

            obj.SyncOperation = httpMethod;
            obj.SyncData = "";//data;
            obj.SyncCreationDate = null
            if (operationType === 'INSERT' || httpMethod === 'POST') {
                obj.SyncCreationDate = date;
                obj.SyncUpdateDate = date;
            } else {
                obj.SyncUpdateDate = date;
            }
            obj.SyncUser = authSession.getAttribute("username")
            obj.SyncDeltaFlag = false;
            return obj;
        }

        class JtiSqlService {
            constructor() { }

            insertOrUpdate({ tableName, tableData, isOecEntity = false, condition = null, tableColumns }, existingTransaction) {

                function processData(data = [], tx) {
                    let _promises = data.map(row => {

                        return new Promise((resolveFn, rejectFn) => {
                            if (typeof row === 'object') {
                                let auditColumns = isOecEntity && getAuditColumns({})
                                row = Object.assign({}, row, auditColumns)
                                tableColumns = Object.keys(row).toString().replace('SyncLocalId', 'SyncLocalId INTEGER PRIMARY KEY');
                            }

                            let stmt = dataBaseProvider.getStatement({
                                operationType: "SELECT",
                                tableName,
                                condition
                            })

                            dataBaseProvider.create({ tableName, cols: tableColumns }, tx)
                                .then(() => dataBaseProvider.executeQuery(stmt, tx))
                                .then(record => {
                                    if (row.hasOwnProperty('SyncLocalId')) {
                                        delete row.SyncLocalId
                                    }
                                    if (typeof row === 'object') {
                                        tableColumns = Object.keys(row).toString().replace('SyncLocalId', 'SyncLocalId INTEGER PRIMARY KEY');
                                    }
                                    if (record['rows'] && record['rows'].length > 0) {

                                        return new Promise((resolve, reject) => resolve())
                                    } else {
                                        let tableValues = tableData
                                        if (typeof row === 'object') {
                                            let vals = ''
                                            let count = 0;
                                            Object.keys(row).forEach(key => {
                                                count != 0 ? vals += "," : null
                                                if (key == 'links') {
                                                    row[key] = null
                                                }
                                                else if (typeof row[key] === 'object') {
                                                    row[key] = JSON.stringify(row[key]);
                                                }
                                                else {
                                                    if (typeof (row[key]) == 'string' && row[key].search(/'/g) != -1) {
                                                        if (tableName == 'survey_page_question') {
                                                            row[key] = row[key].replace(/'/g, '**')
                                                        } else {
                                                            row[key] = row[key].replace(/'/g, '"')
                                                        }

                                                    }
                                                };
                                                vals += "'" + row[key] + "'"
                                                count++
                                            })
                                            tableValues = vals
                                        }
                                        return dataBaseProvider.insert({
                                            tableName,
                                            tableColumns,
                                            tableData: tableValues
                                        }, tx)


                                    }
                                })
                                .then(() => resolveFn())
                                .catch(error => rejectFn(error))
                        })


                    })

                    return _promises
                }
                return new Promise((resolve, reject) => {
                    let data = []
                    if (Array.isArray(tableData))
                        data = tableData
                    else
                        data.push(tableData)
                    console.log("insertOrUpdate() is it exiting transaction ?", existingTransaction)
                    if (existingTransaction) {
                        let _promises = processData(data, existingTransaction)
                        Promise.all(_promises)
                            .then(resolve)
                            .catch(error => reject(error))
                    } else {
                        dataBaseProvider.getTransaction(tx => {
                            let _promises = processData(data, tx)
                            Promise.all(_promises)
                                .then(resolve)
                                .catch(error => reject(error))

                        }, (error) => reject(`Error opening a transaction ${error}`))
                    }

                })
            }

            deleteMultipleTables(tables = [], existingTransaction) {
                console.log("deleteMultipleTables() is it exiting transaction ?", existingTransaction)
                return new Promise((resolve, reject) => {
                    let _promises = tables.map(tableName => dataBaseProvider.dropTable(tableName, existingTransaction))
                    Promise.all(_promises)
                        .then(() => resolve())
                        .catch(error => reject(`Error while dropping multiple tables: ${error}`))
                })
            }


        }


        return new JtiSqlService()

    });