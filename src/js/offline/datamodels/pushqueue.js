define(['ojs/ojcore', 'jquery', 'dbProvider', 'dateUtil', 'authSession'],
   function (oj, $, dbProvider, dateUtil, authSession) {

      /* It has the data to be pushed */
      class PushQueue {
         constructor(params) {
            this.item = {
               "entityType": null,
               "entityId": null,
               "localId": null,
               "parentEntityType": null,
               "parentEntityId": null,
               "parentlocalId": null,
               "status": null,
               "pushResponse": null,
               "SyncUser": authSession.getAttribute("username"),
               "httpCode": null,
               "userName":null,
               "entityKey": null,
               "pushResponse": null
            };
            this.entityFields = {
               "SyncLocalId": null,
               "SyncParentType": null,
               "SyncParentId": null,
               "SyncOperation": null,
               "SyncData": null,
               "SyncCreationDate": null,
               "SyncUpdateDate": null,
               "SyncUser": authSession.getAttribute("username"),
               "SyncDeltaFlag": false
            };
            this.table = "push_queue";
            this.dbPrimaryKey = "rowid";
         }
      }
      /*  logs when a push attempt of the PushQueue table succeeds */
      PushQueue.prototype.log = () => {
         let self = this;
         console.log("logging the data");
      };
      /* Insert data to table  */
      PushQueue.prototype.push = function (record, obj) {
         let self = this;
         let condition = "entityType='" + record.entityType + "' AND localId=" + record.localId +" AND (status='pending' OR status='hold')";
         return new Promise(function (resolve, reject) {
             let sql = `SELECT ${self.dbPrimaryKey}, * FROM ${self.table} WHERE ${condition}`
            dbProvider.getData(sql, obj).then(function (count) {
               //if records not matches then push to queue 
               console.log(count.items.length);
               if (!count.items.length) {
                  record.userName = authSession.getAttribute("username");
                  dbProvider.insertQuery(self.table, record).then(function (result) {
                     resolve(result);
                  }, function (error) {
                     console.log(`Something went wrong while creating table ${self.table}`);
                     reject(error);
                  });
               } else if (count.items[0].status == 'hold') {
                  pushData = count.items[0];
                  pushData.status ='pending';
                  let elementCond = "localId = " + parseInt(record.localId);
                  dbProvider.updateQuery(self.table, record, elementCond).then(function (result) {
                     resolve(result);
                  }, function (error) {
                     console.log(`Something went wrong while creating table ${self.table}`);
                     reject(error);
                  });
               } else if (count.items[0].status != 'synced'&& record.status== "hold") {
                  pushData = count.items[0];
                  pushData.status ='pending';
                  let elementCond = "localId = " + parseInt(record.localId);
                  dbProvider.updateQuery(self.table, record, elementCond).then(function (result) {
                     resolve(result);
                  }, function (error) {
                     console.log(`Something went wrong while creating table ${self.table}`);
                     reject(error);
                  });
               } else{
                  resolve({});
               }
            }, function (numError) {
               console.log(numError);
            });
         });
      };
      /* delete an entry */
      PushQueue.prototype.delete = function (id, value) {
         let self = this;
         return new Promise(function (resolve, reject) {
            dbProvider.deleteRecord(self.table, id, value).then((result) => {
               resolve(result);
            }, (error) => {
               reject(error);
            });
         });
      };

      PushQueue.prototype.get = function (condition) {
         let self = this;
         return new Promise(function (resolve, reject) {
            let sql = `SELECT ${self.dbPrimaryKey}, * FROM ${self.table}`
            if(condition){
               sql += ` WHERE ${condition}`
            }
            dbProvider.getData(sql).then((result) => {
               console.log(result);
               resolve(result.items);
            }, function (error) {
               reject(error);
            });
         });
      };
      
      PushQueue.prototype.UpdateEntity = function (table, data, queueItem, syncData) {
         let self = this;

         let entityData = {};

         return new Promise(function (resolve, reject) {
         let sql ="SELECT * FROM "+ table  +" where SyncLocalId = "+ parseInt(queueItem.localId); 
         dbProvider.getData(sql).then(function (latestRecResponse) {            
            if(latestRecResponse && latestRecResponse.items[0][queueItem.entityKey] && latestRecResponse.items[0][queueItem.entityKey] != "0"){
               entityData.SyncOperation =  "Edit"
               data[queueItem.entityKey] = latestRecResponse.items[0][queueItem.entityKey];
               queueItem.entityId = latestRecResponse.items[0][queueItem.entityKey];
            } else{
               entityData.SyncOperation =  "Create";
              // var oldSyncData = JSON.parse(latestRecResponse.items[0].SyncData);
              // entityData.SyncData = {...oldSyncData, ...syncData};
            } 
            entityData.SyncData = syncData;
            entityData.SyncUpdateDate = dateUtil.getCurrentDate();
            entityData.SyncUser = authSession.getAttribute("username");
   
            queueItem.status = queueItem.status ? queueItem.status : "pending";
            // let tableData = {
            //    ...data,
            //    ...entityData
            // }
            let tableData = Object.assign(data, entityData);
            let elementCond = "SyncLocalId = " + parseInt(queueItem.localId);
            
               dbProvider.updateQuery(table, tableData, elementCond).then(function (entityRes) {
                  console.log("UpdateEntity -> pushqueue.js-> 104");
                  self.push(queueItem, false).then(function (queueResponse) {
                     resolve(queueResponse);
                  }, function (queueError) {
                     console.log(queueError);
                     reject(queueError);
                  });
               });
            
         }, function(err){
            console.log(err);
            reject(err);
         });
      });
      };

      PushQueue.prototype.insertEntity = function (table, data, queueItem, syncData) {
         let self = this;

         let entityData = Object.assign({}, self.entityFields);
         entityData.SyncParentType = queueItem.parentEntityType;
         entityData.SyncParentId = queueItem.parentEntityId;
         entityData.SyncParentLocalId = queueItem.parentlocalId;
         entityData.SyncOperation = "Create";
         entityData.SyncData = syncData;
         entityData.SyncCreationDate = dateUtil.getCurrentDate();
         entityData.SyncUpdateDate = dateUtil.getCurrentDate();
         entityData.SyncUser = authSession.getAttribute("username");
         entityData.SyncDeltaFlag = false;
         
         // let tableData = {
         //    ...data,
         //    ...entityData
         // }
         let tableData = Object.assign(data, entityData);
         return new Promise(function (resolve, reject) {

            dbProvider.insertQuery(table, tableData).then(function (entityRes) {
               let sql ="SELECT SyncLocalId FROM "+ table + ' ORDER BY SyncLocalId DESC LIMIT 1'; 
               dbProvider.getData(sql).then(function (latestRecResponse) {
                  recNUm = latestRecResponse.items.length-1
                  queueItem.localId = +(latestRecResponse.items[recNUm].SyncLocalId);

                  self.push(queueItem, false).then(function (queueResponse) {
                     resolve(queueResponse);

                  }, function (queueError) {
                     console.log(queueError);
                     reject(queueError);
                  })

                  // resolve(latestRecResponse);
               }, function (error) {
                  console.log("something went wrong");
                  reject(error);
               })
            }, function (error) {
               console.log(`Something went wrong while creating table ${self.table}`);
               reject(error);
            });
         });
      };

      PushQueue.prototype.deleteEntity = function (table, queueItem) {
         let self = this;

         let entityData = {}
         entityData.SyncOperation = "Delete";
         entityData.SyncData = {};
         entityData.SyncUpdateDate = dateUtil.getCurrentDate();
         let elementCond = "SyncLocalId = " + parseInt(queueItem.localId);
         let sql = `SELECT SyncLocalId, * FROM ${queueItem.entityType} WHERE SyncLocalId = ${queueItem.localId}`
         return new Promise(function (resolve, reject) {
            dbProvider.getData(sql).then((result)=>{
            let entityKey = result.items[0][queueItem.entityKey];
            if (entityKey) {
               //delete queueItem.entityKey;
               dbProvider.updateQuery(table, entityData, elementCond).then(function (entityRes) {
                  /* In case of delete check for presence of entityID in presence update queue else delete */
                  self.push(queueItem, false).then(function (queueResponse) {
                     resolve(queueResponse);
                  }, function (queueError) {
                     console.log(queueError);
                     reject(queueError);
                  });
               }, function (error) {
                  console.log("something went wrong");
                  reject(error);
               });
            } else {
               dbProvider.deleteRecord(table, "SyncLocalId", parseInt(queueItem.localId)).then(function (entityRes) {
                  /* In case of delete check for presence of entityID in presence update queue else delete */
                  
                  cond= "entityType = '" +queueItem.entityType+ "' AND localId = "+ parseInt(queueItem.localId);
                  dbProvider.deleteRecordCond(self.table, cond).then((result) => {
                     resolve(result);
                  }, (error) => {
                     reject(error);
                  });
               }, function (error) {
                  console.log("something went wrong");
                  reject(error);
               });
            }
         }, function(err){
            console.log("something went wrong");
                  reject(err);
         });
        });
      };

      return PushQueue;

   });