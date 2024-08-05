// document.getElementById('open-file-btn').addEventListener('click', () => {
//   const filePath = document.getElementById('file-path').value;
//   if (filePath) {
//     window.electronAPI.openFile(filePath);
//   } else {
//     alert('Please enter a file path.');
//   }
// });

window.electronAPI.onWhoamiResult((result) => {
  document.getElementById('whoami').textContent = result;
});

window.electronAPI.onMacAddressResult((result) => {
  document.getElementById('macaddress').textContent = result;
});

window.electronAPI.getVersion((result) => {
  document.getElementById('appVersion').textContent = result;
});

window.electronAPI.showMetadata((result) => {
  const selectedLanguage = $('#language-selector').val();
  const lang = getLang(selectedLanguage);
  title = result['Title'] ? result['Title'] : '';
  description = result['Description'] ? result['Description'] : '';
  subject = result['Subject'] ? result['Subject'] : '';
  filepath = result['FilePath'] ? result['FilePath'] : '';
  buf = [];
  buf.push(
    `<form id="updateMetadataForm">`,
    `<input type="text" name="FilePath" placeholder="Filepath" style="display: none;" value="${filepath}">`,
    `<label for="title" data-localize="title">${lang["title"]}</label><br>`,
    `<input type="text" name="Title" placeholder="${lang["title"]}" value="${title}"><br><br>`,
    `<label for="description" data-localize="description">${lang["description"]}</label><br>`,
    `<input type="text" name="Description" placeholder="${lang["description"]}" value="${description}"><br><br>`,
    `<label for="subject" data-localize="subject">${lang["subject"]}</label><br>`,
    `<input type="text" name="Subject" placeholder="${lang["subject"]}" value="${subject}"><br><br>`,
    `</form>`
  )
  $('#metadata').html(buf.join(''));
  $('#saveMetadata').prop('disabled', false);
})

window.electronAPI.metadataSet((result) => {
  console.log(result["updated"]);
  if (result["updated"] > 0) {
    $('#metadata').html('<p>Metadata updated</p>');
  } else {
    $('#metadata').html('<p>No metadata updated</p>');
  }
  setTimeout(function(){
    $('#editMetadataModal').modal('hide')
  }, 1500);
})