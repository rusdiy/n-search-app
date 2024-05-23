// Tab
$(document).ready(function(){
    $('.tab a').click(function(){
        $('.tab a').removeClass('active');
        $(this).addClass('active');
    });
});

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
        filePath = filePath.replaceAll("/", "\\");
    }
    window.electronAPI.openFile(filePath);
    return;
}

function openDir(filePath) {
    if (filePath.startsWith("file://")) {
        filePath = filePath.replace(/^file:/, '');
        filePath = filePath.replaceAll("/", "\\");
    }
    directoryPath = filePath.substring(0, filePath.lastIndexOf('/'));
    window.electronAPI.openFile(directoryPath);
    return;
}
