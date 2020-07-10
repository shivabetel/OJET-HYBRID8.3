define([
], function () {

    class JsonUtil {
        constructor(){
        }
    }

    /**
     * Parses a response to an array
     * 
     * @param data<any> The response to parse
     * @param defaultResult<array?> The default array in case the parsing returns null
     * 
     * @return if the data was already parsed (so it's an array) it will return it,
     *         otherwise it will parse the data, and in case of null, it will return
     *         the defaultResult (if specified)
     */
    JsonUtil.prototype.responseToArray = function (data, defaultResult){        
        let result = null
        if ( data !== null ){
            if ( !Array.isArray (data)){
                let parsed ={}
                if(typeof data =="string")
                    parsed = JSON.parse(data);
                else 
                    parsed = data;
                if ( null !== parsed && Array.isArray( parsed ) ) {
                    result = parsed
                }
            } else {
                result = data
            }
        }
        if ( data === null && defaultResult !== undefined ){
            result = defaultResult
        }
        return result        
    };

    /**
     * Parses a response to an object
     * 
     * @param data<any> The response to parse
     * @param defaultResult<array?> The default object in case the parsing returns null
     * 
     * @return if the data was already parsed (so it's an object) it will return it,
     *         otherwise it will parse the data, and in case of null, it will return
     *         the defaultResult (if specified)
     */
    JsonUtil.prototype.responseToObject = function (data, defaultResult){        
        let result = null
        if ( data !== null ){
            if ( typeof data !== 'object' ){
                let parsed = JSON.parse(data)
                if ( null !== parsed && typeof parsed === 'object'){
                    result = parsed
                }
            } else {
                result = data
            }
        }
        if ( null === data && defaultResult !== undefined ){
            result = defaultResult
        }
        return result        
    };

    return new JsonUtil();
});