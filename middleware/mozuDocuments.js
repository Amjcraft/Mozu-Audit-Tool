var fs = require("fs");

var apiContext = require('mozu-node-sdk/clients/platform/application')();
var mozuEntityList = require('mozu-node-sdk/clients/platform/entityList')(apiContext);
var mozuEntityItem = require('mozu-node-sdk/clients/platform/entityLists')(apiContext);
var PAGE_AUDIT_DOC_NAME = "audittoolinfo_3@a0842dd";

exports.mozuDocuments = function() {

var createEnitityItem = function(item) {
	item.entityListFullName = PAGE_AUDIT_DOC_NAME;
	mozuEntityItem.entity().insertEntity(item).then(function (data) {
	    console.error('CreateEList');
	    console.log(data);
	}).catch(function(error) {
	    console.error(error);
	})
};

var createEnitityList = function(callback) {
	mozuEntityList.createEntityList({
    'contextLevel' : 'masterCatalog',
    'name' : 'AuditToolInfo_3',
    'nameSpace' : 'a0842dd', 
    'tenantId' : 11004, 
    "usages": ["entityManager"],
    "idProperty" : {
      "dataType": "string",
      "propertyName": "id"
    },
    'useSystemAssignedId' : false,
    "indexA": {
      "dataType": "string",
      "propertyName": "name"
    },
    "indexB": {
      "dataType": "string",
      "propertyName": "testId"
    }
    }).then(function (data) {
	    console.error('CreateEList');
	    callback();
	}).catch(function(error) {
	    console.error(error);
	})
};

var getWebTestID = function(item) {
	item.entityListFullName = PAGE_AUDIT_DOC_NAME;
	return mozuEntityItem.entity().getEntity(item);
};

var getEnitiyList= function() {
	return mozuEntityItem.entity().getEntities({'entityListFullName' : PAGE_AUDIT_DOC_NAME});
};

return {
	createEnitityList: function(callback) {
		return createEnitityList(callback) 
	},
	createEnitityItem: function(item) {
		return createEnitityItem(item) 
	},
	getWebTestID: function(item) {
		return getWebTestID(item) 
	},
	getEnitiyList: getEnitiyList

}


};
