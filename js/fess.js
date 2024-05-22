$(function(){
  // Base URL for API
  var baseUrl = window.API_ENDPOINT + `/endpoint/search.php`;
  var $searchButton = $('#searchButton');

  // Function to handle search processing
  var doSearch = function(event){
    showLoading();
    var start = parseInt(localStorage.getItem("start"));
    
    // Adjust start and num values if necessary
    start = start < 0 ? 0 : start;
    num = 10; // hardcoded for now
    
    // Update start based on navigation
    switch(event.data.navi) {
      case -1:
        start -= num;
        break;
      case 1:
        start += num;
        break;
      default:
      case 0:
        start = 0;
        break;
    }
    localStorage.setItem("start", start);
    
    extraQuery = ""
    var activeTab = document.querySelector('.tab a.active').innerText;
    switch (activeTab) {
      case "Images":
        extraQuery = `mimetype:"image/*"`;
        break;
      case "PDF":
        extraQuery = `mimetype:"application/pdf"`;
        break;
      case "Videos":
        extraQuery = `mimetype:"video/*"`;
        break;
      case "General":
        break;
      default:
        break;
    }
    
    var searchQuery = $.trim($('#searchQuery').val());
    var loginUser = $.trim($('#whoami').text());
    var macaddress = $.trim($('#macaddress').text());
    if(searchQuery.length != 0) {
      var urlBuf = [];
      $searchButton.attr('disabled', true);
      urlBuf.push(baseUrl,
        '?q=', encodeURIComponent(searchQuery),
        '&start=', start,
        '&num=', num,
        '&ex_q=', encodeURIComponent(extraQuery),
        '&loginUser=', loginUser,
        '&macAddress=', macaddress,
      );
      
      // Send AJAX request
      $.ajax({
        url: urlBuf.join(""),
        dataType: 'json',
        timeout: 600000, // Set a timeout in milliseconds (10 seconds in this case)
      }).done(function(data) {
          displaySearchResults(data);
      }).fail(function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'timeout') {
              errorThrown = "Timeout";
          }
          displayError(errorThrown);
      }).always(function() {
          $searchButton.attr('disabled', false);
      });
    }
    return false;
  };

  var displayError = function(errorThrown) {
    var $subheader = $('#subheader'),
        $result = $('#result')
        buf = [];
    $subheader.empty();
    $result.empty();
    
    buf.push(`<p><b>Error: ${errorThrown}</b>.</p>`)
    $result.html(buf.join(""));
  }

  // Display search results
  var displaySearchResults = function(data) {
    var $subheader = $('#subheader'),
        $result = $('#result'),
        record_count = data.data.length,
        offset = 0,
        buf = [];
    
    if(record_count == 0) {
      $subheader.empty();
      buf.push("<h2><b>", data.q, "</b></h2>");
      buf.push("<p><b>No information was found matching </b>.</p>")
      $result.html(buf.join(""));
    } else {
      var page_number = data.page_number,
          startRange = data.start_record_number,
          endRange = data.end_record_number,
          i = 0,
          max;
      
      offset = startRange - 1;
      buf.push("Results <b>", startRange, "</b> - <b>", endRange,
          "</b> of <b>", record_count, "</b> for <b>", data.q,
          "</b> (", data.exec_time," sec)");
      $subheader.html(buf.join(""));
      $result.empty();
      
      // Display search result items
      var $resultBody = $(`<ol start="${startRange}" />`);
      var results = data.data;
      for (var i = 0, max = results.length; i < max; i++) {
          var itemHtml = buildSearchResultItem(results[i]);
          $resultBody.append(itemHtml);
      }

      var $flexContainer = $('<div class="flex-container"></div>');
      $flexContainer.append($resultBody);
      $result.empty().append($flexContainer); // Emptying $result before appending

      
      // Display pagination information
      buf = [];
      buf.push(`<div class="pagination flex-container">`);
      buf.push(`<a id="prevPageLink" href="#" class="arrow left" ${data.prev_page ? "" : "disabled"}>&larr;</a>`);
      buf.push(`<span class="page-number">${page_number}</span>`)
      buf.push(`<a id="nextPageLink" href="#" class="arrow right" ${data.next_page ? "" : "disabled"}>&rarr;</a>`)
      buf.push(`</div>`)
      $(buf.join("")).appendTo($result);
    }
    $('#searchStart').val(offset);
    $('#searchNum').val(parseInt(localStorage.getItem("num")));
    $(document).scrollTop(0);
  };

  // Function to build HTML for a search result item
  var buildSearchResultItem = function(result) {
    
    url = buildUrl(result.url_link);
    
    var buf = [];
    buf.push('<li><h3 class="title">', '<a href="', url, '" target="_blank">', result.title,
      '</a></h3><div class="body">', result.content_description,
      '<br/><p><cite>', result.site, '</cite> | ',
      `<button class="link" onclick="copyText('${result.url_link}')">Copy Path</button></p>`, '</li>');
    return buf.join("");
  };

  var buildUrl = function(url) {
    if (url.includes("file:")) {
      url = url.replace("file:", "");
      url = encodeURIComponent(url);
      url = btoa(url);
      return "view.php?path=" + url
    }

    return url
  }

  function showLoading() {
    var $result = $('#result');
    var buf = [];
    buf.push("<img id='loading' src='internal/loading.gif' style='position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 50px; height: 50px;'>");
    $result.html(buf.join(""));
  }

  // Event handling for search form submission
  $('#searchForm').submit({navi:0}, doSearch);
  
  // Event handling for pagination
  $('#result').on("click", "#prevPageLink", {navi:-1}, doSearch)
              .on("click", "#nextPageLink", {navi:1}, doSearch);
});
