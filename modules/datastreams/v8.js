/* Date Format for Moment.js – used in v8 functions to parse dates */
var switchDateFormat;
(function (switchDateFormat) {
    function convert(format, sourceRules, destRules) {
        if (sourceRules == destRules)
            return format;

        var result = '';
        var index = 0;
        var destTokens = getTokens(destRules);
        var sourceMap = getTokenMap(getTokens(sourceRules));
        while (index < format.length) {
            var part = locateNextToken(sourceRules, format, index);
            if (part.literal.length > 0)
                result += destRules.MakeLiteral(part.literal);
            if (part.token.length > 0)
                result += destTokens[sourceMap[part.token]];
            index = part.nextBegin;
        }

        return result;
    }
    switchDateFormat.convert = convert;

    function locateNextToken(rules, format, begin) {
        var literal = '';
        var index = begin;
        var sequence = getTokenSequence(getTokenMap(getTokens(rules)));
        while (index < format.length) {
            var escaped = rules.ReadEscapedPart(format, index);
            if (escaped.length > 0) {
                literal += escaped.value;
                index += escaped.length;
                continue;
            }

            var token;
            for (var i = 0; i < sequence.length; i++) {
                if (format.indexOf(sequence[i], index) == index) {
                    token = sequence[i]
                    break;
                }
            }
            if (!token) {
                literal += format.charAt(index);
                index++;
                continue;
            }

            return {
                token: token,
                literal: literal,
                nextBegin: index + token.length
            };
        }

        return {
            token: '',
            literal: literal,
            nextBegin: index
        };
    }

    function getTokens(rules) {
        return [
            rules.DayOfMonthShort,
            rules.DayOfMonthLong,
            rules.DayOfWeekShort,
            rules.DayOfWeekLong,
            rules.DayOfYearShort,
            rules.DayOfYearLong,
            rules.MonthOfYearShort,
            rules.MonthOfYearLong,
            rules.MonthNameShort,
            rules.MonthNameLong,
            rules.YearShort,
            rules.YearLong,
            rules.AmPm,
            rules.Hour24Short,
            rules.Hour24Long,
            rules.Hour12Short,
            rules.Hour12Long,
            rules.MinuteShort,
            rules.MinuteLong,
            rules.SecondShort,
            rules.SecondLong,
            rules.FractionalSecond1,
            rules.FractionalSecond2,
            rules.FractionalSecond3,
            rules.TimeZone,
            rules.UnixTimestamp
        ].map(function (x) {
            return x || '';
        });
    }

    function getTokenMap(tokens) {
        var map = {};
        for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i];
            if (token) {
                map[token] = i;
            }
        }
        return map;
    }

    function getTokenSequence(map) {
        var tokens = Object.keys(map);
        tokens.sort(function (a, b) {
            return b.length - a.length;
        });
        return tokens;
    }

    function indexOfAny(s, chars) {
        for (var i = 0; i < s.length; i++) {
            var c = s.charAt(i);
            for (var j = 0; j < chars.length; j++) {
                if (c === chars.charAt(j))
                    return i;
            }
        }
        return -1;
    }

    switchDateFormat.momentJs = {
        DayOfMonthShort: 'D',
        DayOfMonthLong: 'DD',
        DayOfWeekShort: 'ddd',
        DayOfWeekLong: 'dddd',
        DayOfYearShort: 'DDD',
        DayOfYearLong: 'DDDD',
        MonthOfYearShort: 'M',
        MonthOfYearLong: 'MM',
        MonthNameShort: 'MMM',
        MonthNameLong: 'MMMM',
        YearShort: 'YY',
        YearLong: 'YYYY',
        AmPm: 'A',
        Hour24Short: 'H',
        Hour24Long: 'HH',
        Hour12Short: 'h',
        Hour12Long: 'hh',
        MinuteShort: 'm',
        MinuteLong: 'mm',
        SecondShort: 's',
        SecondLong: 'ss',
        FractionalSecond1: 'S',
        FractionalSecond2: 'SS',
        FractionalSecond3: 'SSS',
        TimeZone: 'Z',
        UnixTimestamp: 'X',
        MakeLiteral: function (literal) {
            var reserved = 'MoDdeEwWYgGAaHhmsSzZX';

            literal = literal.replaceAll("[", "(").replaceAll("]", ")");
            if (indexOfAny(literal, reserved) < 0)
                return literal;

            return '[' + literal + ']';
        },
        ReadEscapedPart: function (format, startIndex) {
            if (format.charAt(startIndex) != '[')
                return { value: '', length: 0 };

            var result = '';
            var index = startIndex;
            while (index < format.length) {
                var c = format.charAt(index);

                if (c == ']') {
                    break;
                }

                result += c;
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };

    switchDateFormat.datepicker = {
        DayOfMonthShort: 'd',
        DayOfMonthLong: 'dd',
        DayOfWeekShort: 'D',
        DayOfWeekLong: 'DD',
        DayOfYearShort: 'o',
        DayOfYearLong: 'oo',
        MonthOfYearShort: 'm',
        MonthOfYearLong: 'mm',
        MonthNameShort: 'M',
        MonthNameLong: 'MM',
        YearShort: 'y',
        YearLong: 'yy',
        AmPm: 'A',
        Hour24Short: 'H',
        Hour24Long: 'HH',
        Hour12Short: 'h',
        Hour12Long: 'hh',
        MinuteShort: 'n',
        MinuteLong: 'nn',
        SecondShort: 's',
        SecondLong: 'ss',
        FractionalSecond1: 'S',
        FractionalSecond2: 'SS',
        FractionalSecond3: 'SSS',
        TimeZone: 'Z',
        UnixTimestamp: '@',
        MakeLiteral: function (literal) {
            var reserved = "dDomMy@'";
            if (indexOfAny(literal, reserved) < 0)
                return literal;

            return "'" + literal.replaceAll("'", "''") + "'";
        },
        ReadEscapedPart: function (format, startIndex) {
            if (format.charAt(startIndex) != "'")
                return { value: '', length: 0 };

            var result = '';
            var index = startIndex;
            while (++index < format.length) {
                var c = format.charAt(index);

                if (c == "'") {
                    index++;
                    if (index == format.length)
                        break;

                    if (format[index] == "'") {
                        result += c;
                    } else {
                        break;
                    }
                } else {
                    result += c;
                }
            }

            return {
                value: result,
                length: index - startIndex
            };
        }
    };
})(switchDateFormat || (switchDateFormat = {}));
var dp_to_moment = function(pattern) {return switchDateFormat.convert(pattern, switchDateFormat.datepicker, switchDateFormat.momentJs);}

/*
 ** Se tuvo que reemplazar la libreria original que usabamos para formatear números, porque estaba obsoleta. Continuaremos usando los formatos de salida originales para no migrar la base de datos, por lo hay que mapearlos con los formatos de la libreria nueva (numeraljs)
*/
function getV8NumberFormat(format){

    let new_format = null;
    
    // Tipos de formatos de numeros existentes y como deben ser mapeados para la libreria numeraljs
    switch(format){
        
        case '0,000':
        case '#,###':
            new_format = '0,0'
            break;

        case '$ 0,000':
        case '$ #,###':
            new_format = '$ 0,0'
            break;

        case '0,000.00':
            new_format = '0,0.00'
            break;

        case '$ 0,000.00':
            new_format = '$ 0,0.00'
            break;

        case '#,###.##':
            new_format = '0,0.[00]'
            break;

        case '$ #,###.##':
            new_format = '$ 0,0.[00]'
            break;

    } 

    // Si es formato personalizado
    if( _.isNull(new_format) ){

        // Asi es el formato original: Usa el patrón de formateo de EEUU.
        // 0: Dígito
        // #: Dígito, cero ausente
        // . (punto): Separador decimal
        // , (coma): Separador de agrupación
        // -: Signo menos
        // $: Signo de moneda
        
        // Dividimos por "." para ver si hay decimales. Se asume que solo podrá haber un "." en el string.
        let number_parts = format.split('.');

        // 1) Si tiene decimales "."
        if( number_parts.length > 1 ){
            
            // Decimales - revisamos que haya "#", dado que si hay es "Dígito, cero ausente".
            if( number_parts[1].indexOf('#') != -1){
                
                // La libreria de numeraljs necesita que los ceros ausentes en los decimales se envelvan en [], ej [0000]. Reemplazamos el primer "#" con "[0"
                number_parts[1] = number_parts[1].replace('#','[0').replaceAll('#', '0');

                // Si se reemplazo un "#" por "[0"
                if( number_parts[1].indexOf('[0') != -1){
                    
                    // Obtenemos la posicion del ultimo "0"
                    let posLastZero = number_parts[1].lastIndexOf('0');

                    // Reemplazamos el ultimo "0" con "0]"
                    number_parts[1] = number_parts[1].substring(0,posLastZero) + '0]' + number_parts[1].substring(posLastZero+1);

                }
                
            }

        }

        // 2) Revisamos la parte del entero 
        // No importa si tiene o no tiene decimales number_parts[0] va siempre a ser la parte entera del numero
        // Si tiene separador de miles
        if( number_parts[0].indexOf(',') != -1 ){

            let thousands = number_parts[0].split(',');

            // Evaluamos cada parte de a miles que forman el entero
            _.each(thousands, function(t,i){

                switch(t){

                    case "###":
                    case "##0":
                        thousands[i] = '0';
                        break;
    
                    case "#00":
                    case "#0#":
                        thousands[i] = '00';
                        break;
    
                    case "000":
                    case "0##":
                    case "00#":
                    case "0#0":
                        thousands[i] = '000';
                        break;
                    
                    // Mismos casos de arriba pero con "$ "
                    case "$ ###":
                    case "$ ##0":
                        thousands[i] = '$ 0';
                        break;
    
                    case "$ #00":
                    case "$ #0#":
                        thousands[i] = '$ 00';
                        break;
    
                    case "$ 000":
                    case "$ 0##":
                    case "$ 00#":
                    case "$ 0#0":
                        thousands[i] = '$ 000';
                        break;

                    // Mismos casos de arriba pero con "$"
                    case "$###":
                    case "$##0":
                        thousands[i] = '$0';
                        break;
    
                    case "$#00":
                    case "$#0#":
                        thousands[i] = '$00';
                        break;
    
                    case "$000":
                    case "$0##":
                    case "$00#":
                    case "$0#0":
                        thousands[i] = '$000';
                        break;
    
                }

            });

            // Para la primera parte del entero dividido en array, vemos si hay casos especiales
            switch(thousands[0]){

                case "#":
                case "##":
                    if( thousands.length == 1){
                        // TODO: No cubre el caso con # solo que sea opcional el 0, pero la libreria no trae nada para esto en los enteros. Le asignamos 0, por lo que nunca se podrá poner un formato con decimales sin cero al inicio, ej: ".2"
                        thousands[0] = '0';
                    }else{
                        // Si solo hay #, ó ##, como es el primer caso, no nos sirve de nada, entonces lo removemos.
                        thousands.splice(0, 1);
                    }
                    break;

                case "0":
                case "0#":
                case "#0":
                    thousands[0] = '0';
                    break;

                case "$ #":
                case "$ ##":
                    // Si solo hay #, ó ##, como es el primer caso, no nos sirve de nada, entonces lo removemos.
                    thousands.splice(0, 1);
                    // Le agrego el patrón de "$ " al indice que le sigue.
                    thousands[0] = '$ ' + thousands[0];
                    break;

                case "$ 0":
                case "$ 0#":
                case "$ #0":
                    thousands[0] = '$ 0';
                    break;

                case "$#":
                case "$##":
                    // Si solo hay #, ó ##, como es el primer caso, no nos sirve de nada, entonces lo removemos.
                    thousands.splice(0, 1);
                    // Le agrego el patrón de "$" al indice que le sigue.
                    thousands[0] = '$' + thousands[0];
                    break;

                case "$0":
                case "$0#":
                case "$#0":
                    thousands[0] = '$0';
                    break;
                    
            }

            // Si llego a quedar un "#" lo reemplazo
            thousands[0].replace('#', '0');

            // Unimos el entero
            number_parts[0] = thousands.join(',');
            
        }
        
        // Unimos de vuelta las partes y se la asignamos como el nuevo formato.
        new_format = number_parts.join('.');

    }

    return new_format;

}

/*
 ** Se tuvo que reemplazar la libreria original que usabamos para formatear números, porque estaba obsoleta. Continuaremos usando los string de locales originales para no migrar la base de datos, por lo hay que mapearlos con los string de locales de la libreria nueva (numeraljs)
*/
function getV8NumberLocale(locale){

    let new_locale = null;

    switch(locale){

        case "us":
        case "es":
        case "th":
        case "de":
        case "fr":
        case "fi":
        case "ru":
            new_locale = locale;
            break;

        case "jp":
            new_locale = "ja";
            break;

        case "cn":
            new_locale = "chs";
            break;

        case "au":
            new_locale = "en-au";
            break;

        case "ca":
            new_locale = "fr-ca";
            break;

        case "gb":
            new_locale = "en-gb";
            break;

        case "dk":
            new_locale = "da-dk";
            break;

        case "br":
            new_locale = "pt-br";
            break;

        case "cz":
            new_locale = "cs";
            break;

        case "ch":
            new_locale = "de-ch";
            break;

        default:
            new_locale = "us";

    }

    return new_locale;

}

function parseV8CellValue (result) {
    var value = '';
    switch(result.fType ){
        case "TEXT":
        case "JSON":
            var str = String(result.fStr);
            // llegan valores pisados para los headers (chimeIn=true y headerMappings)
            if(!_.isUndefined(result.fHeaders)){
                str = String(result.fHeaders[0].fHeader);
            }   
            str = ( str.length != 1 ) ? str : str.replace('-', '&nbsp;');
            return str.replace(/(<([^>]+)>)/ig," ");
        case "DATE":
            var format = result.fDisplayFormat;
            var number = result.fNum;
            var str = '';
            if (! _.isUndefined(format)){
                // sometimes are seconds, sometimes milliseconds
                if (number > 0 && number < 100000000000) number = number * 1000;

                var local = format.fLocale;
                if (undefined === local || local.indexOf("en_")) local = "en";
                else if (local === "es" || local.indexOf("es_")) local = "es";
                else local = "en";
                var dt = moment.utc(number).locale(local)
                str = dt.format(dp_to_moment(format.fPattern))
            }else{
                str = String(number);
            }
            return str
        case "NUMBER":
            var format = result.fDisplayFormat;
            var number = result.fNum;
            if( !_.isUndefined(format) ){    
                // Solo se necesita configurar el locale != 'us'. Si configuramos 'us' se rompe la libreria numerals, porque esta cargando un locale que no existe (el default es inglés americano, osea 'us').
                if(format.fLocale != 'us'){
                    numeral.locale(getV8NumberLocale(format.fLocale));
                }
                number = numeral(result.fNum).format(getV8NumberFormat(format.fPattern));
            }
            return String(number)
        case "LINK":
            return '<a target="_blank" href="' + result.fUri + '" rel="nofollow" title="' + result.fStr + '">' + result.fStr + '</a>';
    }
    return value
}

function processV8Results(result) {
    var firstHeader = false;
    var stopHeaders = false;
    var header = [];
    var body = [];

    if( result.fType == 'ARRAY' ){

        for(var row=0; row < result.fRows;row++){
            for(var col=0; col<result.fCols;col++){
                var cell = result.fArray[(result.fCols * row) + col];
                var value = parseV8CellValue(cell);
                
                if(cell.fHeader && !stopHeaders){
                    firstHeader = true;
                    header.push(value);
                }
                else { 
                    body.push(value);
                }
            }

            if(firstHeader){
              stopHeaders = true;
            }
        }

    }else{

        var value = parseV8CellValue(result);
        body.push(value);
    }

    return {
        header: header,
        body: body,
    }
}

function renderV8CellTable(str, fType) {

    switch(fType){
        case "TEXT":
            return '<table class="text"><tr><td>' + str + '</td></tr></table>';
        case "DATE":
            return '<table class="number"><tr><td>'+ str +'</td></tr></table>';
        case "NUMBER":
            return '<table class="number"><tr><td>' + String(str) + '</td></tr></table>';
        case "LINK":
            return '<table class="text"><tr><td>' +  str + '</td></tr></table>';
        case "ERROR":
            return '<table class="null"><tr><td> ' + (Configuration.language == 'es') ? 'No se encontraron datos' : 'No data found' + '. <span>'
                + (Configuration.language == 'es') ? 'Por favor' : 'Please' + ' <a id="id_retryButton" title="'
                + (Configuration.language == 'es') ? 'Inténtalo Nuevamente' : 'Try Again' + '">'
                + (Configuration.language == 'es') ? 'inténtalo Nuevamente' : 'try again' + '</a>.</span></td></tr></table>';
        case "CONFIRM-WRITE-DATASET":
            return '<table class="text"><tr><td> ' + (Configuration.language == 'es') ? 'Usted se encuentra por ejecutar un origen que puede cambiar datos.' : 'You are about to run an origin that can affect the data.'
                + '. <span><a id="id_retryButton" title="' + (Configuration.language == 'es') ? 'Continuar de todas formas' : 'Continue anyway' + '">'
                + (Configuration.language == 'es') ? 'Continuar de todas formas' : 'Continue anyway' + '</a></span></td></tr></table>';
        case "CONFIRM-WRITE-DATASET-PRO":
            return '<table class="text"><tr><td> ' + (Configuration.language == 'es') ? 'Las vistas de tipo escritura que pertenecen al entorno de producción no se pueden previsualizar en el espacio de trabajo.' : 'Write-type Data Views that belong to the production environment cannot be previewed in the workspace.' + '</td></tr></table>';
    }
    return ''
}

function renderV8Row(cells, colLength, rowNumber, isHeader) {

    var tagName = 'td';

    if(isHeader){
        var tagName = 'th';
    }

    var start = (rowNumber * colLength);
    var end = start + colLength;
    var answer = '<tr>';
    for(var i=start; i < end;i++){
        answer += '<'+tagName+'>' + cells[i] + '</'+tagName+'>'
    }
    return answer + '</tr>'
}

function renderV8Table(cells, header, colLength, rowLength, fType, trueHeader) {

    if (fType != 'ARRAY') {
        return renderV8CellTable(parseV8CellValue(cells), fType)
    } else {
        var answer = '<table class="array">'
        if (header && header.length > 0) {

            answer += '<thead>';
            answer += renderV8Row(header, colLength, 0, true);
            answer += '</thead>';

            if(trueHeader){
                rowLength = rowLength - 1;   
            }

        }
        for (var i=0; i < rowLength; i++) {
            answer += '<tbody>' + renderV8Row(cells, colLength, i, false) + '</tbody>'
        }
        return answer + '</table>'
    }
    
}
