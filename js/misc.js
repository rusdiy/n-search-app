// Copy Text
function copyText(text) {
    if (text.startsWith("file://")) {
        text = text.replace(/^file:/, '');
        text = text.replaceAll("/", "\\");
    }

    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    } else {
        unsecuredCopyToClipboard(text)
    }
    alert("Copied: " + text);
}

function unsecuredCopyToClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('Unable to copy to clipboard', err);
    }
    document.body.removeChild(textArea);
}

function putToSearchBox(text) {
    $searchQuery = $('#searchQuery').val(text);
}

function openFile(filePath) {
    if (filePath.startsWith("file://")) {
        filePath = filePath.replace(/^file:/, '');
        filePath = filePath.replace(/^\/\/\/([A-Za-z]:)/, '$1');
        filePath = filePath.replaceAll("/", "\\");
    }
    insertFileAccessLog(filePath, false);
    window.electronAPI.openFile(filePath);
    return;
}

function openDir(filePath) {
    filePath = filePath.substring(0, filePath.lastIndexOf('/'));
    if (filePath.startsWith("file://")) {
        filePath = filePath.replace(/^file:/, '');
        filePath = filePath.replace(/^\/\/\/([A-Za-z]:)/, '$1');
        filePath = filePath.replaceAll("/", "\\");
    }
    insertFileAccessLog(filePath, true);
    window.electronAPI.openFile(filePath);
    return;
}

function insertFileAccessLog(filePath, isDirectory) {
    var loginUser = $.trim($('#whoami').text());
    var macaddress = $.trim($('#macaddress').text());
    fetch(window.API_ENDPOINT + '/endpoint/file_access.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "loginUser": loginUser,
            "macAddress": macaddress,
            "filePath": filePath,
            "isDirectory": false
        }),
    });
}

$("#filetype").focus(function(){
    $("input[name=mimetype][value=filetype]").prop("checked",true);
});


function showPopularWords() {
    query = window.API_ENDPOINT + "/endpoint/history.php";
    var popularWordsLang = 'Popular Words';
    var $popularWords = $('#popularWords');
    const selectedLanguage = $('#language-selector').val();
    const lang = getLang(selectedLanguage);
    popularWordsLang = lang['popularWords'];

    $.ajax({
        url: query,
        dataType: "json",
        success: function(data) {
            if(data && data.data.length > 0) {
                buf = [];
                buf.push(`<b data-localize="popularWords">${popularWordsLang}</b>:`);
                data.data.map(
                    function(item) {
                        buf.push(`<button class="link" onclick="putToSearchBox('${item.keyword}')">${item.keyword}</button>`);
                    }
                )
                $popularWords.html(buf.join(" "));
            }
        },
        error: function(xhr, status, error) {
            console.error(xhr, status, error);
        }
    });
}

$(document).ready(function() {
    const $languageSelector = $('#language-selector');

    // Function to fetch JSON and apply translations
    const applyTranslations = (language) => {
        const $elementsToTranslate = $('[data-localize]');
        translations = getLang(language);
        $elementsToTranslate.each(function() {
            const $element = $(this);
            const key = $element.data('localize');
            if (translations[key]) {
                $element.text(translations[key]);
            }
        });
    };

    // Event listener for language selection
    $languageSelector.on('change', function() {
        const selectedLanguage = $(this).val();
        applyTranslations(selectedLanguage);
    });

    const selectedLanguage = $('#language-selector').val();
    applyTranslations(selectedLanguage);
});

function getMetadata(filePath) {
    metadata = $("#metadata");
    metadata.empty();
    buf = [];
    buf.push(
        "<p>Loading...</p>",
        "<img src='internal/loading.gif' style='width: 50px; height: 50px;' />"
    );
    metadata.html(buf.join());
    if (filePath.startsWith("file://")) {
        filePath = filePath.replace(/^file:/, '');
        filePath = filePath.replace(/^\/\/\/([A-Za-z]:)/, '$1');
        filePath = filePath.replaceAll("/", "\\");
    }
    window.electronAPI.getMetadata(filePath);
    return;
}

$(document).ready(function() {
    $('#saveMetadata').click(function() {
        var formData = $('#updateMetadataForm').serializeArray();
        var formDataObj = {};
        $.each(formData, function(i, field) {
            formDataObj[field.name] = field.value;
        });
        window.electronAPI.setMetadata(formDataObj);
        $('#metadata').empty();
        buf = [];
        buf.push(
            "<p>Processing...</p>",
            "<img src='internal/loading.gif' style='width: 50px; height: 50px;' />"
        );
        $('#metadata').html(buf.join());
        $('#saveMetadata').prop('disabled', true);
    });

    $('#cancelEditMetadata').click(function() {
        $('#metadata').empty();
        $('#saveMetadata').prop('disabled', true);
    });
});
