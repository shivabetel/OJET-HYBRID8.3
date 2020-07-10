define([
    'ojs/ojcore',
    'jquery',
    'knockout'
], function (oj, $, ko) {
    'use strict';


    const SQL_OPERATION = {
        SELECT: "SELECT",
        UPDATE: "UPDATE",
        DELETE: "DELETE",
        INSERT: "INSERT",
        CREATE: "CREATE",
        DROP: 'DROP'
    }



    class DataBase {
        constructor() {
            console.log("Database constructor called")
            // this.db = sqlitePlugin.openDatabase({
            //     name: 'jti_demo.db',
            //     location: 'default'
            //   })
            this.db = openDatabase('jti_demo.db', '1.0', 'JTI', 2 * 1024 * 1024);

        }

        getTransaction(successCB, failurCB) {
            console.log(this.db.transaction)
            return this.db.transaction(successCB, failurCB)
        }

        executeQuery(sql, exitingTransaction ) {
            return new Promise((resolve, reject) => {
                exitingTransaction ? exitingTransaction.executeSql(sql, [],
                    (tx, res) => {
                        resolve(res)
                    },
                    (error) =>  reject(`Error executing a statment ${error}`)) :  this.db.transaction(function (tx) {
                    tx.executeSql(sql, [],
                        (tx, res) => {
                            resolve(res)
                        },
                        (error) => {
                             reject(`Error executing a statment ${error}`)
                        })
                }, (error) => reject(`Error opening a transaction ${error}`))
            })
        }

        create({ tableName, cols }, exitingTransaction) {
            let columns = ""
            typeof (cols) == 'object' ? columns = Object.keys(cols).toString() : columns = cols.toString()
            return new Promise((resolve, reject) => {
                let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`
                this.executeQuery(sql, exitingTransaction).then(
                    (success) => resolve(success),
                    (error) => reject(`Error while executing create statement ${error}`))
            })
        }


        dropTable(tableName, exitingTransaction) {
            console.log("dropTable() existin transaction ?", exitingTransaction)
            let stmt = this.getStatement({
                operationType: SQL_OPERATION['DROP'],
                tableName
            })
            return this.executeQuery(stmt, exitingTransaction)
        }

        getStatement({ operationType = 'select', tableName, tableColumns, condition = null, tableData }) {
            switch (operationType.toUpperCase()) {
                case SQL_OPERATION['SELECT']:
                    return condition ? `SELECT * FROM ${tableName} WHERE ${condition}` : `SELECT * FROM ${tableName}`
                case SQL_OPERATION['UPDATE']:
                    return condition && `UPDATE ${tableName} SET ${tableData} WHERE ${condition}`
                case SQL_OPERATION['INSERT']:
                    return `INSERT INTO ${tableName} (${tableColumns}) VALUES (${tableData})`
                case SQL_OPERATION['CREATE']:
                    return `CREATE TABLE IF NOT EXISTS ${tableName} (${tableColumns})`
                case SQL_OPERATION['DROP']:
                    return `DROP TABLE IF EXISTS ${tableName}`

            }
        }


        insert({ tableName, tableColumns, tableData }, exitingTransaction) {
            // console.log("tableColumns**", tableColumns)
            // console.log("tableData**", tableData)
            return new Promise((resolve, reject) => {
                let stmt = this.getStatement({
                    operationType: SQL_OPERATION['INSERT'],
                    tableName,
                    tableColumns,
                    tableData
                })

                //this.db.sqlBatch([stmt]).then(resolve, (err) => reject(err))
                this.executeQuery(stmt, exitingTransaction).then(resolve, (err) => {
                    console.log("failing record******",tableData)
                    reject(err)
                })
            })
        }

        update({ tableName, tableColumns, tableData, condition }, exitingTransaction) {
            return new Promise((resolve, reject) => {
                let stmt = this.getStatement({
                    operationType: SQL_OPERATION['UPDATE'],
                    tableName,
                    tableColumns,
                    tableData,
                    condition
                })

                this.executeQuery(stmt, exitingTransaction).then(resolve, (err) => reject(err))
            })
        }

        getData(sql, isDetails, exitingTransaction) {
            //return new Promise(function (resolve, reject) {
            var defer = $.Deferred();
            // let sql = `SELECT rowid, * FROM ${table}`;
            // if (cond) {
            //   sql += ` WHERE ${cond}`
            // }
            return new Promise((resolve, reject) => {
                let data = {
                    items: [],
                    count: 0
                };
                this.executeQuery(sql, exitingTransaction)
                    .then(result => {
                        (result &&
                            result['rows'] &&
                            result['rows']['items']) || []

                        if (isDetails) {
                            //TODO need to check what is this
                        }
                        else {

                            if (result['rows']['items'] && result['rows']['items'].length > 0) {
                                data.items = result['rows']['items'];
                                data.count = result['rows']['items'].length;
                            } else if (result['rows'].length > 0) {
                                data.count = result['rows'].length;
                                data['items'] = result['rows'].map(row => row['item'])
                            }

                        }

                        resolve(data)


                    })
                    .catch(error => reject(error))
            })

           
        }

        // insertOrUpdate({ tableName, tableData, isOecEntity = false, condition = null }) {
        //     return new Promise((resolve, reject) => {
        //         let data = []
        //         let auditColumns = isOecEntity && getAuditColumns({})
        //         if (typeof tableData == 'object') {
        //             tableData = Object.assign({}, tableData, auditColumns)
        //             data.push(tableData)
        //         }

        //         data.forEach(row => {

        //             let tableColumns = Object.keys(row).toString().replace('SyncLocalId', 'SyncLocalId INTEGER PRIMARY KEY');
        //             let stmt = this.getStatement({
        //                 operationType: SQL_OPERATION['SELECT'],
        //                 tableName,
        //                 condition
        //             })

        //             this.create({ tableName, cols: tableColumns })
        //                 .then(() => this.executeQuery(stmt))
        //                 .then(record => {
        //                     if (record['rows'] && record['rows'].length > 0) {

        //                         return new Promise((resolve, reject) => resolve())
        //                     } else {
        //                         return this.insert({
        //                             tableName,
        //                             tableData: row
        //                         })




        //                     }
        //                 }).then(() => resolve(), (err) => reject(err))



        //         })

        //     })
        // }

    }

    return new DataBase()
});