define(['moment', 'jtiUser'], function (moment, jtiUser) {

  function DateUtil() {

    var self = this;

    // Date formats, here we will add multiple date formats which we need
    self.DF1 = 'MMMM Do YYYY at h:mm A';
    self.DF2 = 'LT'; // 6: 30 AM
    self.DF3 = 'MMMM, Do YYYY';
    self.DF4 = "MM/DD/YY";
    self.DF5 = "D MMM YYYY";
    self.DF6 = "YYYY-MM-DD";
    self.DF7 = "YYYY-MM-DDTHH:mm:ss+00:00"
    self.DF8 = 'YYYY-MM-DDTHH:mm:ss';
    self.DF9 = 'MMM DD, YYYY';
    self.DF10 = 'MMM DD, YYYY at h:mm A';
    self.DF11 = "DD-MM-YYYY";
    self.DF12 = "MMMM D";
    self.DF13 = "HH:mm";
    self.DF14 = "MMM";
    self.DF15 = "YYYY";
    self.DF16 = "ddd";
    self.DF17 = "dddd MMMM DD";
    self.DF18 = 'MMM DD, h:mm A';
    self.DF19 = 'ddd MMM DD, h:mm A';
    self.DF20 = 'DD MMM YYYY, h:mm A';
    self.DF21 = 'MM/DD/YY h:mm A';
    self.DF22 = 'MM/DD/YYYY HH:MM A';
    self.DF23 = 'MM/DD/YYYY hh:mm A'
    self.DF24 = 'MM/DD/YY hh:mm'

    

    self.getUTCDate = function (format, dateStr = null) {
      let formatteddate = null;
      if (dateStr) {
        formatteddate = moment.utc(new Date(dateStr));
      } else {
        formatteddate = moment.utc(new Date());
      }

      if (format) {
        formatteddate = formatteddate.format(format)
      }

      return formatteddate;
    }

    // format the dates as per the format specified
    self.formatDateStr = function (dateStr, format) {
      moment.locale(jtiUser.getLocale())
      return moment(moment(dateStr)._d).format(format);
    };

    self.DateStr = function (dateStr) {
      moment.locale(jtiUser.getLocale())
      return moment(moment(dateStr)._d);
    };

    self.dateBeforeDays = function (days) {
      let daysFrom = moment().add(-days, 'days');
      return self.formatDateStr(daysFrom, self.DF7);
    }
    self.isCurrentDate = function (dateStr) {
      return moment(dateStr).isSame(new Date(), "day");
    }

    self.getCurrentDate = function (formatStr) {
      moment.locale(jtiUser.getLocale())
      if (!formatStr) {
        formatStr = self.DF8;
      }
      return moment(moment(new Date())._d).format(formatStr)
    }

    self.getEndDate = function (num, format, startDate) {
      moment.locale(jtiUser.getLocale());
      return moment(moment(new Date()).add(num, 'days')._d).format(format);
    }

    self.substractDate = function (num, format, startDate) {
      moment.locale(jtiUser.getLocale());
      let formatteddate = null;
      if (startDate) {
        formatteddate = moment(moment(startDate).subtract(num, 'days')._d);
      } else {
        formatteddate = moment(moment(new Date()).subtract(num, 'days')._d);
      }

      if (format) {
        formatteddate = formatteddate.format(format)
      }

      return formatteddate;
    }

    self.addDate = function (num, format, startDate) {
      moment.locale(jtiUser.getLocale());
      let formatteddate = null;
      if (startDate) {
        formatteddate = moment(moment(startDate).add(num, 'days')._d);
      } else {
        formatteddate = moment(moment(new Date()).add(num, 'days')._d);
      }

      if (format) {
        formatteddate = formatteddate.format(format)
      }

      return formatteddate;
    }

    self.addHours = function(num, format, startDate){
      moment.locale(jtiUser.getLocale());
      let formatteddate = null;
      if (startDate) {
        formatteddate = moment(moment(startDate).add(num, 'hours')._d);
      } else {
        formatteddate = moment(moment(new Date()).add(num, 'hours')._d);
      }
      if (format) {
        formatteddate = formatteddate.format(format)
      }
      return formatteddate;
    }
    self.datesDiff = function (date1, date2, string) {
      moment.locale(jtiUser.getLocale())
      date1 = moment(date1);
      date2 = moment(date2);
      switch (string) {
        case 'minutes':
          return moment.duration(date1.diff(date2)).asMinutes()
          break;
        case 'hours':
          return moment.duration(date1.diff(date2)).asHours()
          break;
      }

    }

    self.queryDate = function (dateStr, targetDate) {
      moment.locale(jtiUser.getLocale())
      if (!targetDate) {
        targetDate = new Date();
      }

      if (!dateStr) {
        dateStr = new Date();
      }

      let ds = moment(moment(dateStr)._d).format(self.DF6);
      let td = moment(moment(targetDate)._d).format(self.DF6);
      // console.log('ds is' + ds);
      // console.log('td is' + td);

      // console.log('--------------------')

      if (moment(ds).isSame(td)) {
        return "same"
      }

      if (moment(ds).isBefore(td)) {
        return "past"
      }

      if (moment(ds).isAfter(td)) {
        return "future"
      }
    }
  }

  return new DateUtil();
});