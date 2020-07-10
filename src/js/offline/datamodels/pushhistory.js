define(['ojs/ojcore', 'jquery','dbProvider', 'dateUtil'],
 function (oj, $, dbProvider, dateUtil) {
     /*
      * A history table that contains the data of the successfully pushed elements. 
      * This history is the key for the post sync tasks operations that ensures the zero-data-lost feature
     */
     class PushHistory{
         constructor(params){
            this.item ={
            "queueId": null,
            "entityType": null,
            "entityId": null,
            "parentEntityType": null,
            "parentEntityId": null,
            "PushDate": null,
            };
            
            this.table = "push_history";
         }
     } 
     /*  logs  */
     PushHistory.prototype.log = ()=>{
        let self = this;
        console.log("logs");
     };
     /* delete an entry */
     PushHistory.prototype.delete = (key, value)=>{
        let self = this;
        dbProvider.deleteRecord(self.table, key, value)
     };
     /*  gets a list with all the entries */
     PushHistory.prototype.getAll = function(cond){
        let self = this;

        dbProvider.getData(`SELECT * FROM ${self.table}`).then((result)=>{
            console.log(result);
            return result;
        });
        console.log(dbProvider.DATABASE);
     };
     /* Insert data to table */
     PushHistory.prototype.insert = (data)=>{
        let self = this;
        dbProvider.insertQuery(self.table, data).then((result)=>{
            console.log(result);
        })
     };

     return PushHistory;
});

