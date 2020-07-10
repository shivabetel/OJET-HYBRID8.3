define(
    [],
    function () {

        "use strict";
        var instance;

        class JTIUser {
            constructor() {
                this.resourceProfileId = 300000038495096;
                this.partyId = 300000037980703
                this.partyNumber = "123456";
                this.partyName = "First Name Last Name";
                this.personFirstName = "First Name";
                this.personLastName = "Last Name";
                this.userManagerFullName = "";
                this.locale = "en";
                this.role = "Sales Representative";
                this.personProfileImage = "css/images/james_avatar.png"
                this.market = "WWDF";
                this.lastSync = new Date(Date.parse("2019-12-11T13:27:00+00:00"));
                this.resourcePartyId = "";
                this.roleName = " Sales Representative";
                this.salesRepRoles = ['MERCHANDISER', "SALES_REPRESENTATIVE", "XX_SALES_REPRESENTATIVE", "JTI_RETAIL_REP_DF"];
                this.domesticSalesRep = ['JTI_RETAIL_REP_DM'];
                this.salesManagersRoles = ["JTI Sales Manager", "SALES_MANAGER","SALESMANAGER", "JTI_ASM"]
            }

            clearUser() {
                this.resourceProfileId = 0;
                this.partyId = 0
                this.partyNumber = null;
                this.partyName = null;
                this.personFirstName = null;
                this.personLastName = null;
                this.locale = null;
                this.role = null;
                this.personProfileImage = null
                this.market = null;
                this.lastSync = null;
                this.resourcePartyId = 0;
                this.userManagerFullName = '';
            }
            getuserManagerFullName() {
                return this.userManagerFullName;
            }
            getResourceProfileId() {
                return this.resourceProfileId;
            }
            setuserManagerFullName(userManagerFullName){
                this.userManagerFullName=userManagerFullName;
            }
            setResourceProfileId(resourceProfileId) {
                this.resourceProfileId = resourceProfileId;
            }

            getResourcePartyId() {
                return this.resourcePartyId;
            }
            setResourcePartyId(resourcePartyId) {
                this.resourcePartyId = resourcePartyId;
            }

            getPartyId() {
                return this.partyId;
            }
            setPartyId(partyId) {
                this.partyId = partyId;
            }

            getPartyNumber() {
                return this.partyNumber;
            }
            setPartyNumber(partyNumber) {
                this.partyNumber = partyNumber;
            }

            getPartyName() {
                return this.partyName;
            }
            setPartyName(partyName) {
                this.partyName = partyName;
            }

            getPersonFirstName() {
                return this.personFirstName;
            }
            setPersonFirstName(personFirstName) {
                this.personFirstName = personFirstName;
            }

            getPersonLastName() {
                return this.personLastName;
            }
            setPersonLastName(personLastName) {
                this.personLastName = personLastName;
            }

            getLocale() {
                return this.locale;
            }
            setLocale(locale) {
                this.locale = locale;
            }

            getRole() {
                return this.role;
            }
            setRole(role) {
                this.role = role;
            }
            getRoleName(){
                return this.roleName;
            }
            setRoleName(roleName){
                this.roleName= roleName;
            }
            getRoleType(role) {
                if (!role) {
                    role = this.role;
                }
                return (this.salesRepRoles.includes(role) ? 'MERCHANDISER': (this.domesticSalesRep.includes(role) ? 'JTI_RETAIL_REP_DM': (this.salesManagersRoles.includes(role) ? 'SALES_MANAGER': null)));
            }

            getPersonProfileImage() {
                return this.personProfileImage;
            }
            setPersonProfileImage(personProfileImage) {
                this.personProfileImage = personProfileImage;
            }

            getMarket() {
                return this.market;
            }
            setMarket(market) {
                this.market = market;
            }

            getLastSync() {
                return this.lastSync;
            }
            setLastSync(lastSync) {
                this.lastSync = lastSync;
            }

        }
        if (!instance) {
            instance = new JTIUser();
        }
        return instance;
    }
);