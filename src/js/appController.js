/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojrouter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
        'ojs/ojoffcanvas', 'izitoast', 'ojs/ojconfig', './utils/connection',
        'ojs/ojmodule-element', 'ojs/ojknockout', 'jti-loader/loader'],
  function(ko, moduleUtils, KnockoutTemplateUtils, Router, ResponsiveUtils, 
    ResponsiveKnockoutUtils, ArrayDataProvider, OffcanvasUtils, iziToast, Config, NetworkMonitor) {
     function ControllerViewModel() {
      var self = this;

      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      self.manner = ko.observable('polite');
      self.message = ko.observable();
      self.waitForAnnouncement = false;
      self.navDrawerOn = false;
      self.platform = ko.observable();
      self.networkMonitor = new NetworkMonitor()

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

      document.addEventListener("jtiNotification", function (event) {
        console.log("calling jtinotification")
        let defaultOverlay = false;
        let types = {
          error: {
            background: 'red',
            font: '#8B0111',
            icon: 'fas fa-ban'
          },
          success: {
            background: 'green',
            font: '#26651E',
            icon: 'fas fa-check'
          },
          info: {
            background: 'blue',
            font: '#093193',
            icon: 'fas fa-info'
          },
          warning: {
            background: 'yellow',
            font: '#DD9C00',
            icon: 'fas fa-exclamation'
          }
        }
        let callback = () => {}
        iziToast.show({
          // id: 'loginContainer',
          color: types['error']['background'],
          icon: types['error']['icon'],
          iconColor: types['error']['font'],
          titleColor: types['error']['font'],
          messageColor: types['error']['font'],
          title: 'Error',
          message: 'Invalid Credentials, please try again.',
          overlay: defaultOverlay,
          onClosing: callback,
          transitionIn : 'fadeInLeft',
          transitionOut: 'fadeOutLeft',
          close: false,
          closeOnClick: true,
          position: 'topRight',
          timeout: 60000
        })
      });

      /*
        @waitForAnnouncement - set to true when the announcement is happening.
        If the nav-drawer is ON, it is reset to false in 'ojclose' event handler of nav-drawer.
        If the nav-drawer is OFF, then the flag is reset here itself in the timeout callback.
      */
      function announcementHandler(event) {
        self.waitForAnnouncement = true;
        setTimeout(function() {
          self.message(event.detail.message);
          self.manner(event.detail.manner);
          if (!self.navDrawerOn) {
            self.waitForAnnouncement = false;
          }
        }, 200);
      };

      // Media queries for repsonsive layouts
      var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      var mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      self.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

       // Router setup
       self.router = Router.rootInstance;
       self.router.configure({
         'login': {label: 'Login', isDefault: true},
         'dashboard': {label: 'Dashboard'},
         'incidents': {label: 'Incidents'},
         'customers': {label: 'Customers'},
         'about': {label: 'About'}
       });
      Router.defaults['urlAdapter'] = new Router.urlParamAdapter();


      self.setI18 = function (language, callback) {

        let theLang = "en_US"
        let theCallback = function () {}

        if (language !== undefined && language !== null) {
          if (typeof language === 'string') {
            theLang = language
          } else if (typeof language === 'function') {
            theCallback = language
          }
        }

        if (callback !== undefined && callback !== null && typeof callback === 'function') {
          theCallback = callback
        }

        Config.setLocale(
          theLang,
          function () {
            document.getElementsByTagName('html')[0].setAttribute('lang', theLang);
            theCallback()
            //.setNavbarData();
            // document.getElementById("contacts").disabled = true;

          }
        )
      };

      self.setDevicePlatform = function () {
        console.log("Current Device Platform : " + device.platform);
        self.platform(device.platform);

        switch (device.platform) {
          case "Android":
            console.log("Current Device externalRootDirectory : " + cordova.file.externalRootDirectory);
            self.storageLocation = cordova.file.externalRootDirectory;
            break;
          case "iOS":
            console.log("Current Device syncedDataDirectory : " + cordova.file.syncedDataDirectory);
            self.storageLocation = cordova.file.syncedDataDirectory;
            // self.storageLocation = cordova.file.documentsDirectory;
            break;
            // case "browser":
            //   self.storageLocation = cordova.file.dataDirectory;
            //   break;
        }
      }

      self.loadModule = function () {
        self.moduleConfig = ko.pureComputed(function () {
          var name = self.router.moduleConfig.name();
          var viewPath = 'views/' + name + '.html';
          var modelPath = 'viewModels/' + name;
          return moduleUtils.createConfig({ viewPath: viewPath,
            viewModelPath: modelPath, params: { parentRouter: self.router } });
        });

        navigator.globalization.getPreferredLanguage(function (language) {
          //success calback
          self.setI18(language.value, self.setTranslations)
        }, function(){
          //error callback
          self.setI18("en_US", self.setTranslations);
        })

        self.setDevicePlatform()
      };

      // Navigation setup
      var navData = [
      {name: 'Dashboard', id: 'dashboard',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-chart-icon-24'},
      {name: 'Incidents', id: 'incidents',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-fire-icon-24'},
      {name: 'Customers', id: 'customers',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-people-icon-24'},
      {name: 'About', id: 'about',
       iconClass: 'oj-navigationlist-item-icon demo-icon-font-24 demo-info-icon-24'}
      ];
      self.navDataProvider = new ArrayDataProvider(navData, {keyAttributes: 'id'});

      // Drawer
      // Close offcanvas on medium and larger screens
      self.mdScreen.subscribe(function() {OffcanvasUtils.close(self.drawerParams);});
      self.drawerParams = {
        displayMode: 'push',
        selector: '#navDrawer',
        content: '#pageContent'
      };
      // Called by navigation drawer toggle button and after selection of nav drawer item
      self.toggleDrawer = function() {
        self.navDrawerOn = true;
        return OffcanvasUtils.toggle(self.drawerParams);
      }
      // Add a close listener so we can move focus back to the toggle button when the drawer closes
     // document.getElementById('navDrawer').addEventListener("ojclose", onNavDrawerClose);

      /*
        - If there is no aria-live announcement, bring focus to the nav-drawer button immediately.
        - If there is any aria-live announcement in progress, add timeout to bring focus to the nav-drawer button.
        - When the nav-drawer is ON and annoucement happens, then after nav-drawer closes reset 'waitForAnnouncement' property to false.
      */
      function onNavDrawerClose(event) {
        self.navDrawerOn = false;
        if(!self.waitForAnnouncement) {
          document.getElementById('drawerToggleButton').focus();
          return;
        }

        setTimeout(function() {
          document.getElementById('drawerToggleButton').focus();
          self.waitForAnnouncement = false;
        }, 2500);
      }

      // Header
      // Application Name used in Branding Area
      self.appName = ko.observable("App Name");
      // User Info used in Global Navigation area
      self.userLogin = ko.observable("john.hancock@oracle.com");

      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
      self.footerLinks = ko.observableArray([
        new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
        new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
        new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
        new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
        new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
      ]);
     }

     return new ControllerViewModel();
  }
);
