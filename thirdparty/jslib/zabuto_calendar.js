/**
 * Zabuto Calendar
 *
 * Dependencies
 * - jQuery (2.0.3)
 * - Twitter Bootstrap (3.0.2)
 */

if (typeof jQuery == 'undefined') {
    throw new Error('jQuery is not loaded');
}

/**
 * Create calendar
 *
 * @param options
 * @returns {*}
 */
$.fn.zabuto_calendar = function (options) {
    var opts = $.extend({}, $.fn.zabuto_calendar_defaults(), options);
    var languageSettings = $.fn.zabuto_calendar_language(opts.language);
    opts = $.extend({}, opts, languageSettings);

    this.each(function () { 
        var $calendarElement = $(this);
        $calendarElement.attr('id', "zabuto_calendar_" + Math.floor(Math.random() * 99999).toString(36));

        $calendarElement.data('initYear', opts.year);
        $calendarElement.data('initMonth', opts.month);
        $calendarElement.data('monthLabels', opts.month_labels);
        $calendarElement.data('weekStartsOn', opts.weekstartson);
        $calendarElement.data('navIcons', opts.nav_icon);
        $calendarElement.data('dowLabels', opts.dow_labels);
        $calendarElement.data('showToday', opts.today);
        $calendarElement.data('showDays', opts.show_days);
        $calendarElement.data('showPrevious', opts.show_previous);
        $calendarElement.data('showNext', opts.show_next);
        $calendarElement.data('cellBorder', opts.cell_border);
        $calendarElement.data('jsonData', opts.data);
        $calendarElement.data('ajaxSettings', opts.ajax);
        $calendarElement.data('legendList', opts.legend);
        $calendarElement.data('actionFunction', opts.action);
        $calendarElement.data('actionNavFunction', opts.action_nav);
        
        drawCalendar();

        function drawCalendar() {
            var dateInitYear = parseInt($calendarElement.data('initYear'));
            var dateInitMonth = parseInt($calendarElement.data('initMonth')) - 1;
            var dateInitObj = new Date(dateInitYear, dateInitMonth, 1, 0, 0, 0, 0);
            $calendarElement.data('initDate', dateInitObj);

            var tableClassHtml = ($calendarElement.data('cellBorder') === true) ? ' table-bordered' : '';
			var header = '<div></div>'
            var $tableObj = $('<table class="table' + tableClassHtml + '"></table>');
            $tableObj = drawTable($calendarElement, $tableObj, dateInitObj.getFullYear(), dateInitObj.getMonth());

            var $legendObj = drawLegend($calendarElement);

            var $containerHtml = $('<div class="zabuto_calendar"></div>');
            $containerHtml.append($tableObj);
            $containerHtml.append($legendObj);

            $calendarElement.append($containerHtml);

            var jsonData = $calendarElement.data('jsonData');
            if (false !== jsonData) {
                checkEvents($calendarElement, dateInitObj.getFullYear(), dateInitObj.getMonth());
            }
        }

        function drawTable($calendarElement, $tableObj, year, month) {
            var dateCurrObj = new Date(year, month, 1, 0, 0, 0, 0);
            $calendarElement.data('currDate', dateCurrObj);

            $tableObj.empty();
            $tableObj = appendMonthHeader($calendarElement, $tableObj, year, month);
            $tableObj = appendDayOfWeekHeader($calendarElement, $tableObj);
            $tableObj = appendDaysOfMonth($calendarElement, $tableObj, year, month);
            checkEvents($calendarElement, year, month);
            return $tableObj;
        }

        function drawLegend($calendarElement) {
            var $legendObj = $('<div class="legend" id="' + $calendarElement.attr('id') + '_legend"></div>');
            var legend = $calendarElement.data('legendList');
            if (typeof(legend) == 'object' && legend.length > 0) {
                $(legend).each(function (index, item) {
                    if (typeof(item) == 'object') {
                        if ('type' in item) {
                            var itemLabel = '';
                            if ('label' in item) {
                                itemLabel = item.label;
                            }

                            switch (item.type) {
                                case 'text':
                                    if (itemLabel !== '') {
                                        var itemBadge = '';
                                        if ('badge' in item) {
                                            if (typeof(item.classname) === 'undefined') {
                                                var badgeClassName = 'badge-event';
                                            } else {
                                                var badgeClassName = item.classname;
                                            }
                                            itemBadge = '<span class="badge ' + badgeClassName + '">' + item.badge + '</span>';
                                        }
                                        $legendObj.append('<span class="legend-' + item.type + '">' + itemBadge + itemLabel + '</span>');
                                    }
                                    break;
                                case 'block':
                                    if (itemLabel !== '') {
                                        itemLabel = '<span>' + itemLabel + '</span>';
                                    }
                                    if (typeof(item.classname) === 'undefined') {
                                        var listClassName = 'event';
                                    } else {
                                        var listClassName = 'event-styled ' + item.classname;
                                    }
                                    $legendObj.append('<span class="legend-' + item.type + '"><ul class="legend"><li class="' + listClassName + '"></li></ul>' + itemLabel + '</span>');
                                    break;
                                case 'list':
                                    if ('list' in item && typeof(item.list) == 'object' && item.list.length > 0) {
                                        var $legendUl = $('<ul class="legend"></ul>');
                                        $(item.list).each(function (listIndex, listClassName) {
                                            $legendUl.append('<li class="' + listClassName + '"></li>');
                                        });
                                        $legendObj.append($legendUl);
                                    }
                                    break;
                                case 'spacer':
                                    $legendObj.append('<span class="legend-' + item.type + '"> </span>');
                                    break;

                            }
                        }
                    }
                });
            }

            return $legendObj;
        }

        function appendMonthHeader($calendarElement, $tableObj, year, month) {
            var navIcons = $calendarElement.data('navIcons');
            var $prevMonthNavIcon = $('<span><span class="glyphicon glyphicon-chevron-left"></span></span>');
            var $nextMonthNavIcon = $('<span><span class="glyphicon glyphicon-chevron-right"></span></span>');
            if (typeof(navIcons) === 'object') {
                if ('prev' in navIcons) {
                    $prevMonthNavIcon.html(navIcons.prev);
                }
                if ('next' in navIcons) {
                    $nextMonthNavIcon.html(navIcons.next);
                }
            }

            var prevIsValid = $calendarElement.data('showPrevious');
            if (typeof(prevIsValid) === 'number' || prevIsValid === false) {
                prevIsValid = checkMonthLimit($calendarElement.data('showPrevious'), true);
            }

            var $prevMonthNav = $('<div class="calendar-month-navigation"></div>');
            $prevMonthNav.attr('id', $calendarElement.attr('id') + '_nav-prev');
            $prevMonthNav.data('navigation', 'prev');
            if (prevIsValid !== false) {
                var prevMonth = (month - 1);
                var prevYear = year;
                if (prevMonth == -1) {
                    prevYear = (prevYear - 1);
                    prevMonth = 11;
                }
                $prevMonthNav.data('to', {year: prevYear, month: (prevMonth + 1)});
                $prevMonthNav.append($prevMonthNavIcon);
                if (typeof($calendarElement.data('actionNavFunction')) === 'function') {
                    $prevMonthNav.click($calendarElement.data('actionNavFunction'));
                }
                $prevMonthNav.click(function (e) {
                    drawTable($calendarElement, $tableObj, prevYear, prevMonth);
                });
            }

            var nextIsValid = $calendarElement.data('showNext');
            if (typeof(nextIsValid) === 'number' || nextIsValid === false) {
                nextIsValid = checkMonthLimit($calendarElement.data('showNext'), false);
            }

            var $nextMonthNav = $('<div class="calendar-month-navigation"></div>');
            $nextMonthNav.attr('id', $calendarElement.attr('id') + '_nav-next');
            $nextMonthNav.data('navigation', 'next');
            if (nextIsValid !== false) {
                var nextMonth = (month + 1);
                var nextYear = year;
                if (nextMonth == 12) {
                    nextYear = (nextYear + 1);
                    nextMonth = 0;
                }
                $nextMonthNav.data('to', {year: nextYear, month: (nextMonth + 1)});
                $nextMonthNav.append($nextMonthNavIcon);
                if (typeof($calendarElement.data('actionNavFunction')) === 'function') {
                    $nextMonthNav.click($calendarElement.data('actionNavFunction'));
                }
                $nextMonthNav.click(function (e) {
                    drawTable($calendarElement, $tableObj, nextYear, nextMonth);
                });
            }

            var monthLabels = $calendarElement.data('monthLabels');

            var $prevMonthCell = $('<td class="text-right" colspan="3"></td>').append($prevMonthNav);
            var $nextMonthCell = $('<td class="text-left" colspan="3"></td>').append($nextMonthNav);
            var $currMonthLabel = $('<span>' + year + '.' + monthLabels[month] + '</span>');
            $currMonthLabel.dblclick(function () {
                var dateInitObj = $calendarElement.data('initDate');
                drawTable($calendarElement, $tableObj, dateInitObj.getFullYear(), dateInitObj.getMonth());
            });

            var $currMonthCell = $('<td style="color: rgb(132, 132, 132); vertical-align: bottom;"></td>');
            $currMonthCell.append($currMonthLabel);

            var $monthHeaderRow = $('<tr class="calendar-month-header"></tr>');
            $monthHeaderRow.append($prevMonthCell, $currMonthCell, $nextMonthCell);

            $tableObj.append($monthHeaderRow);
            return $tableObj;
        }

        function appendDayOfWeekHeader($calendarElement, $tableObj) {
            if ($calendarElement.data('showDays') === true) {
                var weekStartsOn = $calendarElement.data('weekStartsOn');
                var dowLabels = $calendarElement.data('dowLabels');
                if (weekStartsOn === 0) {
                    var dowFull = $.extend([], dowLabels);
                    var sunArray = new Array(dowFull.pop());
                    dowLabels = sunArray.concat(dowFull);
                }

                var $dowHeaderRow = $('<tr class="calendar-dow-header"></tr>');
                $(dowLabels).each(function (index, value) {
                    $dowHeaderRow.append('<th>' + value + '</th>');
                });
                $tableObj.append($dowHeaderRow);
            }
            return $tableObj;
        }

        function appendDaysOfMonth($calendarElement, $tableObj, year, month) {
            var ajaxSettings = $calendarElement.data('ajaxSettings');
            var weeksInMonth = calcWeeksInMonth(year, month);
            var lastDayinMonth = calcLastDayInMonth(year, month);
            var firstDow = calcDayOfWeek(year, month, 1);
            var lastDow = calcDayOfWeek(year, month, lastDayinMonth);
            var currDayOfMonth = 1;

            var weekStartsOn = $calendarElement.data('weekStartsOn');
            if (weekStartsOn === 0) {
                if (lastDow == 6) {
                    weeksInMonth++;
                }
                if (firstDow == 6 && (lastDow == 0 || lastDow == 1 || lastDow == 5)) {
                    weeksInMonth--;
                }
                firstDow++;
                if (firstDow == 7) {
                    firstDow = 0;
                }
            }

            for (var wk = 0; wk < weeksInMonth; wk++) {
                var $dowRow = $('<tr class="calendar-dow"></tr>');
                for (var dow = 0; dow < 7; dow++) {
                    if (dow < firstDow || currDayOfMonth > lastDayinMonth) {
                        $dowRow.append('<td></td>');
                    } else {
                        var dateId = $calendarElement.attr('id') + '_' + dateAsString(year, month, currDayOfMonth);
                        var dayId = dateId + '_day';

                        var $dayElement = $('<div id="' + dayId + '">' + '<span class="day">' + currDayOfMonth + '</span>' + '</div>');
                        $dayElement.data('day', currDayOfMonth);

                        if (isToday(year, month, currDayOfMonth)) {
                            $dayElement.children().addClass('today');
//                            if ($calendarElement.data('showToday') === true) {
//                                $dayElement.html('<span style="display: inline-grid;">' + currDayOfMonth + '</span>');
//                            }
                        }

                        var $dowElement = $('<td id="' + dateId + '"></td>');
                        $dowElement.append($dayElement);

                        $dowElement.data('date', dateAsString(year, month, currDayOfMonth));
                        $dowElement.data('hasEvent', false);

                        if (typeof($calendarElement.data('actionFunction')) === 'function') {
                            $dowElement.addClass('dow-clickable');
                            $dowElement.click(function () {
                                $calendarElement.data('selectedDate', $(this).data('date'));
                            });
                            $dowElement.click($calendarElement.data('actionFunction'));
                        }

                        $dowRow.append($dowElement);

                        currDayOfMonth++;
                    }
                    if (dow == 6) {
                        firstDow = 0;
                    }
                }

                $tableObj.append($dowRow);
            }
            return $tableObj;
        }

        /* ----- Modal functions ----- */

        function createModal(id, title, body, footer) {
            var $modalHeaderButton = $('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>');
            var $modalHeaderTitle = $('<h4 class="modal-title" id="' + id + '_modal_title">' + title + '</h4>');

            var $modalHeader = $('<div class="modal-header"></div>');
            $modalHeader.append($modalHeaderButton);
            $modalHeader.append($modalHeaderTitle);

            var $modalBody = $('<div class="modal-body" id="' + id + '_modal_body">' + body + '</div>');

            var $modalFooter = $('<div class="modal-footer" id="' + id + '_modal_footer"></div>');
            if (typeof(footer) !== 'undefined') {
                var $modalFooterAddOn = $('<div>' + footer + '</div>');
                $modalFooter.append($modalFooterAddOn);
            }

            var $modalContent = $('<div class="modal-content"></div>');
            $modalContent.append($modalHeader);
            $modalContent.append($modalBody);
            $modalContent.append($modalFooter);

            var $modalDialog = $('<div class="modal-dialog"></div>');
            $modalDialog.append($modalContent);

            var $modalFade = $('<div class="modal fade" id="' + id + '_modal" tabindex="-1" role="dialog" aria-labelledby="' + id + '_modal_title" aria-hidden="true"></div>');
            $modalFade.append($modalDialog);

            $modalFade.data('dateId', id);
            $modalFade.attr("dateId", id);

            return $modalFade;
        }

        /* ----- Event functions ----- */

        function checkEvents($calendarElement, year, month) {
            var jsonData = $calendarElement.data('jsonData');
            var ajaxSettings = $calendarElement.data('ajaxSettings');

            $calendarElement.data('events', false);

            if (false !== jsonData) {
                return jsonEvents($calendarElement);
            } else if (false !== ajaxSettings) {
                return ajaxEvents($calendarElement, year, month);
            }

            return true;
        }

        function jsonEvents($calendarElement) {
            var jsonData = $calendarElement.data('jsonData');
            $calendarElement.data('events', jsonData);
            drawEvents($calendarElement, 'json');
            return true;
        }

        function ajaxEvents($calendarElement, year, month) {
            var ajaxSettings = $calendarElement.data('ajaxSettings');

            if (typeof(ajaxSettings) != 'object' || typeof(ajaxSettings.url) == 'undefined') {
                alert('Invalid calendar event settings');
                return false;
            }

            var data = {year: year, month: (month + 1)};
            $.ajax({
                type: 'GET',
                url: ajaxSettings.url,
                data: data,
                dataType: 'json'
            }).done(function (response) {
            
                var events = [];
                $.each(response, function (k, v) {
                    events.push(response[k]);
                });
                $calendarElement.data('events', events);
                drawEvents($calendarElement, 'ajax');
            });

            return true;
        }

        function drawEvents($calendarElement, type) {
            var jsonData = $calendarElement.data('jsonData');
            var ajaxSettings = $calendarElement.data('ajaxSettings');

            var events = $calendarElement.data('events');
      
            if (events !== false) {
                $(events).each(function (index, value) {
                    var id = $calendarElement.attr('id') + '_' + value.date;
                    var $dowElement = $('#' + id);
                    var $dayElement = $('#' + id + '_day');

                    $dowElement.data('hasEvent', true);

                    if (typeof(value.title) !== 'undefined') {
                        $dowElement.attr('title', value.title);
                    }

                    if (typeof(value.classname) === 'undefined') {
                        $dowElement.addClass('event');
                    } else {
                        $dowElement.addClass('event-styled');
                        $dayElement.addClass(value.classname);
                    }

                    if (typeof(value.badge) !== 'undefined' && value.badge !== false) {
                        var badgeClass = (value.badge === true) ? '' : ' badge-' + value.badge;
                        var dayLabel = $dayElement.data('day');
                        $dayElement.html('<span class="badge badge-event' + badgeClass + '">' + dayLabel + '</span>');
                    }

                    if (typeof(value.body) !== 'undefined') {
                        var modalUse = false;
                        if (type === 'json' && typeof(value.modal) !== 'undefined' && value.modal === true) {
                            modalUse = true;
                        } else if (type === 'ajax' && 'modal' in ajaxSettings && ajaxSettings.modal === true) {
                            modalUse = true;
                        }

                        if (modalUse === true) {
                            $dowElement.addClass('event-clickable');

                            var $modalElement = createModal(id, value.title, value.body, value.footer);
                            $('body').append($modalElement);

                            $('#' + id).click(function () {
                                $('#' + id + '_modal').modal();
                            });
                        }
                    }
                    
                    if (typeof(value.type) !== 'undefined') {
                        
						if (value.type === "workingDay") {
                        	$dayElement.children().append('<image class="calendar-dot-event" src="/theme/images/mobile/calendar_dot_green@1x.png" />');
                        }
                        
                        else if (value.type === "overTime") {
                        	$dayElement.children().append('<image class="calendar-dot-event" src="/theme/images/mobile/calendar_dot_red@1x.png" />');
                        }
                        
                        else if (value.type === "closed") {
                        	$dayElement.children().append('<image class="calendar-dot-event" src="/theme/images/mobile/calendar_dot_gray@1x.png" />');
                        }
                    }
                });
            }
        }

        /* ----- Helper functions ----- */

        function isToday(year, month, day) {
            var todayObj = new Date();
            var dateObj = new Date(year, month, day);
            return (dateObj.toDateString() == todayObj.toDateString());
        }

        function dateAsString(year, month, day) {
            var m, d;
            d = (day < 10) ? '0' + day : day;
            m = month + 1;
            m = (m < 10) ? '0' + m : m;
            return year + '-' + m + '-' + d;
        }

        function calcDayOfWeek(year, month, day) {
            var dateObj = new Date(year, month, day, 0, 0, 0, 0);
            var dow = dateObj.getDay();
            if (dow == 0) {
                dow = 6;
            } else {
                dow--;
            }
            return dow;
        }

        function calcLastDayInMonth(year, month) {
            var day = 28;
            while (checkValidDate(year, month + 1, day + 1)) {
                day++;
            }
            return day;
        }

        function calcWeeksInMonth(year, month) {
            var daysInMonth = calcLastDayInMonth(year, month);
            var firstDow = calcDayOfWeek(year, month, 1);
            var lastDow = calcDayOfWeek(year, month, daysInMonth);
            var days = daysInMonth;
            var correct = (firstDow - lastDow);
            if (correct > 0) {
                days += correct;
            }
            return Math.ceil(days / 7);
        }

        function checkValidDate(y, m, d) {
            return m > 0 && m < 13 && y > 0 && y < 32768 && d > 0 && d <= (new Date(y, m, 0)).getDate();
        }

        function checkMonthLimit(count, invert) {
            if (count === false) {
                count = 0;
            }
            var d1 = $calendarElement.data('currDate');
            var d2 = $calendarElement.data('initDate');

            var months;
            months = (d2.getFullYear() - d1.getFullYear()) * 12;
            months -= d1.getMonth() + 1;
            months += d2.getMonth();

            if (invert === true) {
                if (months < (parseInt(count) - 1)) {
                    return true;
                }
            } else {
                if (months >= (0 - parseInt(count))) {
                    return true;
                }
            }
            return false;
        }
    }); // each()

    return this;
};

/**
 * Default settings
 *
 * @returns object
 *   language:          string,
 *   year:              integer,
 *   month:             integer,
 *   show_previous:     boolean|integer,
 *   show_next:         boolean|integer,
 *   cell_border:       boolean,
 *   today:             boolean,
 *   show_days:         boolean,
 *   weekstartson:      integer (0 = Sunday, 1 = Monday),
 *   nav_icon:          object: prev: string, next: string
 *   ajax:              object: url: string, modal: boolean,
 *   legend:            object array, [{type: string, label: string, classname: string}]
 *   action:            function
 *   action_nav:        function
 */
$.fn.zabuto_calendar_defaults = function () {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var settings = {
        language: false,
        year: year,
        month: month,
        show_previous: true,
        show_next: true,
        cell_border: false,
        today: false,
        show_days: true,
        weekstartson: 1,
        nav_icon: false,
        data: false,
        ajax: false,
        legend: false,
        action: false,
        action_nav: false
    };
    return settings;
};

/**
 * Language settings
 *
 * @param lang
 * @returns {{month_labels: Array, dow_labels: Array}}
 */
$.fn.zabuto_calendar_language = function (lang) {
    if (typeof(lang) == 'undefined' || lang === false) {
        lang = 'en';
    }

    switch (lang.toLowerCase()) {
        case 'ar':
            return {
                month_labels: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
                dow_labels: ["أثنين", "ثلاثاء", "اربعاء", "خميس", "جمعه", "سبت", "أحد"]
            };
            break;

        case "az":
            return {
                month_labels: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
                dow_labels: ["B.e", "Ç.A", "Çərş", "C.A", "Cümə", "Şən", "Baz"]
            };
            break;

        case 'ca':
            return {
                month_labels: ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"],
                dow_labels: ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"]
            };
            break;

        case "cn":
            return {
                month_labels: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
                dow_labels: ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"]
            };
            break;

        case "cs":
            return {
                month_labels: ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"],
                dow_labels: ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"]
            };
            break;

        case 'de':
            return {
                month_labels: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                dow_labels: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
            };
            break;

        case 'en':
            return {
                month_labels: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
                dow_labels: ["M", "T", "W", "T", "F", "S", "S"]
            };
            break;

        case 'he':
            return {
                month_labels: ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"],
                dow_labels: ["ב", "ג", "ד", "ה", "ו", "ש", "א"]
            };
            break;

        case 'es':
            return {
                month_labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                dow_labels: ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"]
            };
            break;

        case 'fi':
            return {
                month_labels: ["Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu", "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu", "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu"],
                dow_labels: ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"]
            };
            break;

        case 'fr':
            return {
                month_labels: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
                dow_labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
            };
            break;

        case 'hu':
            return {
                month_labels: ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"],
                dow_labels: ["Hé", "Ke", "Sze", "Cs", "Pé", "Szo", "Va"]
            };
            break;

        case 'id':
            return {
                month_labels: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
                dow_labels: ["Senin", "Selasa", "Rabu", "Kamis", "Jum'at", "Sabtu", "Minggu"]
            };
            break;

        case 'it':
            return {
                month_labels: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                dow_labels: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"]
            };
            break;

        case 'jp':
            return {
                month_labels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                dow_labels: ["月", "火", "水", "木", "金", "土", "日"]
            };
            break;

        case 'kr':
            return {
                month_labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
                dow_labels: ["월", "화", "수", "목", "금", "토", "일"]
            };
            break;

        case 'nl':
            return {
                month_labels: ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"],
                dow_labels: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
            };
            break;

        case 'no':
            return {
                month_labels: ["Januar", "Februar", "Mars", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Desember"],
                dow_labels: ["Ma", "Ti", "On", "To", "Fr", "L\u00f8", "S\u00f8"]
            };
            break;

        case 'pl':
            return {
                month_labels: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"],
                dow_labels: ["pon.", "wt.", "śr.", "czw.", "pt.", "sob.", "niedz."]
            };
            break;

        case 'pt':
            return {
                month_labels: ["Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
                dow_labels: ["S", "T", "Q", "Q", "S", "S", "D"]
            };
            break;

        case 'ru':
            return {
                month_labels: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
                dow_labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вск"]
            };
            break;

        case 'se':
            return {
                month_labels: ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"],
                dow_labels: ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"]
            };
            break;

        case 'sk':
            return {
                month_labels: ["Január", "Február", "Marec", "Apríl", "Máj", "Jún", "Júl", "August", "September", "Október", "November", "December"],
                dow_labels: ["Po", "Ut", "St", "Št", "Pi", "So", "Ne"]
            };
            break;

        case 'sr':
            return {
                month_labels: ["Јануар", "Фебруар", "Март", "Април", "Мај", "Јун", "Јул", "Август", "Септембар", "Октобар", "Новембар", "Децембар"],
                dow_labels: ["Пон", "Уто", "Сре", "Чет", "Пет", "Суб", "Нед"]
            };
            break;

        case 'tr':
            return {
                month_labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
                dow_labels: ["Pts", "Salı", "Çar", "Per", "Cuma", "Cts", "Paz"]
            };
            break;

        case 'ua':
            return {
                month_labels: ["Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень", "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"],
                dow_labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]
            };
            break;
    }

};
