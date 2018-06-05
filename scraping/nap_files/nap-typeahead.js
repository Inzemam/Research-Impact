/**
 * Initialize Twitter Typeahead and attach it to a search input on our site
 * @param  {jQuery} $input     jQuery object representing the search input element (e.g. $('#searchinput'))
 * @param  {object} parameters object containing keys and values to pass to search (other than term)
 * @return {object}            Bloodhound object for querying, if needed
 */
 function initTypeahead($input, parameters) {

   parameters = parameters || {};
   var queryString = $.param(parameters);
   if (queryString !== '') {
    queryString = '&' + queryString;
   }

   var titleSearch = new Bloodhound({
     datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
     queryTokenizer: Bloodhound.tokenizers.whitespace,
     limit: 30,
     remote: {
       url: '/search.php?term=%QUERY' + queryString,
       filter: function(response) {
         return response.result;
       }
     }
   });

   titleSearch.initialize();

   $input.typeahead({
     'highlight': true,
     'hint': false,
     'minLength': 3
   }, {
     name: 'books',
     displayKey: 'title',
     source: titleSearch.ttAdapter(),
     templates: {
       suggestion: function(item) {
         var title = item.title;
         if (item.year !== undefined && item.year !== '0000') {
           title += ' (' + item.year + ')';
         }

         var cover = 'https://images.nap.edu/images/';
         if (item.path.indexOf('collection.php') !== -1) {
           cover += 'collections/' + item.path.match(/id=(\d+)/)[1] + '.png';
         } else {
           cover += 'cover.php?id=' + item.record_id + '&type=tinycov';
         }

         template = '<div class="suggestion-inner"><div class="img-container img-circle"><img src="' + cover + '"></div><p>' + title + '</p></div>'

         return template;
       },
       error: function() {
         return "No results found for '%QUERY'";
       }
     }
   }).on('typeahead:selected', function(event, item) {
     var url;
     // Collections have a record ID of 0000 and a "path" property with the URL
     if (item.record_id === '0000') {
       url = item.path;
     } else {
       url = 'https://www.nap.edu/catalog.php?record_id=' + item.record_id;
     }
     window.location = url;
   });
   return titleSearch;
 }