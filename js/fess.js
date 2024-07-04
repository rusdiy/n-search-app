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
    var activeTab = $.trim($('input[name="mimetype"]:checked').val());
    switch (activeTab) {
      case "images":
        extraQuery = `mimetype:"image/*"`;
        break;
      case "pdf":
        extraQuery = `mimetype:"application/pdf"`;
        break;
      case "videos":
        extraQuery = `mimetype:"video/*"`;
        break;
      case "filetype":
        extraQuery = `filetype:"${$.trim($('#filetype').val())}"`;
        break;
      case "all":
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
          displaySearchResults(data, activeTab);
      }).fail(function(jqXHR, textStatus, errorThrown) {
          if (textStatus === 'timeout') {
              errorThrown = "Timeout";
          }
          displayError(errorThrown);
      }).always(function() {
          $searchButton.attr('disabled', false);
      });
    }
    showPopularWords();
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
  var displaySearchResults = function(data, activeTab) {
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
      
      var listClass = "video-list";
      // Display search result items
      if (activeTab == "images") {
        listClass = "grid-list flex-container";
      }
      var $resultBody = $(`<ol class="${listClass}" start="${startRange}" />`);
      var results = data.data;
      for (var i = 0, max = results.length; i < max; i++) {
          var itemHtml = buildSearchResultItem(results[i], activeTab);
          $resultBody.append(itemHtml);
      }

      var $flexContainer = $('<div class="flex-container"></div>');
      $flexContainer.append($resultBody);
      $result.empty().append($flexContainer); // Emptying $result before appending

      
      // Display pagination information
      buf = [];
      buf.push(
        `<div class="pagination flex-container">`,
        `<button class="link" id="prevPageLink" href="#" class="arrow left" ${data.prev_page ? "" : "disabled"}>&larr;</button>`,
        `<span class="page-number">${page_number}</span>`,
        `<button class="link" id="nextPageLink" href="#" class="arrow right" ${data.next_page ? "" : "disabled"}>&rarr;</button>`,
        `</div>`
      )
      $(buf.join("")).appendTo($result);
    }
    $(document).scrollTop(0);
  };

  // Function to build HTML for a search result item
  var buildSearchResultItem = function(result, activeTab) {
    
    var buf = [];
    switch (activeTab) {
      case "images":
        buf.push(
          '<li>',
          '<div class="image-container">',
          `<img class="image-block" src="${result.url_link}" />`,
          '<div class="image-overlay">',
          `<button class="link" onclick="openFile('${result.url_link}')">${result.title}</button>`,
          '<br/>',
          `<button class="btn" onclick="openDir('${result.url_link}')">`,
          '<img class="icon" src="internal/icon/folder-open-solid.svg" />',
          `</button>`,
          '</div>',
          '</div>',
          '</li>',
        );
        break;
      case "videos":
        buf.push(
          '<li>',
          `<button class="link" onclick="openFile('${result.url_link}')">${result.title}</button>`,
          '<table style="width: 100%;">',
          '<tr style="vertical-align: top; height: 8vw;">',
          '<td align="justify" style="width: 8vw;">',
          `<video controls><source src="${result.url_link}" type="${result.mimetype}"/></video>`,
          '</td>',
          '<td align="left" style="padding-left: 20px;">',
          '</h3>',
          '<div class="body">', result.content_description, '</div>',
          `<p><cite>${result.site}</cite></p>`,
          `<button class="btn" onclick="openDir('${result.url_link}')">`,
          '<img class="icon" src="internal/icon/folder-open-solid.svg" />',
          `</button>`,
          '</td>',
          '</tr>',
          '</table>',
          '</li>',
        );
        break;
      default:
        buf.push(
          '<table style="width: 100%;">',
          '<tr style="vertical-align: top;">',
          '<td align="justify">',
          '<li>',
          '<h3>',
          `<button class="link" onclick="openFile('${result.url_link}')">${result.title}</button>`,
          '</h3>',
          '<div class="body">', result.content_description, '</div>',
          `<p><cite>${result.site}</cite></p>`,
          '</td>',
          '<td align="right">',
          `<button class="btn" onclick="openDir('${result.url_link}')">`,
          '<img class="icon" src="internal/icon/folder-open-solid.svg" />',
          `</button>`,
          '</li>',
          '</td>',
          '</tr>',
          '</table>',);
        break;
    }
    
    return buf.join("");
  };

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
