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
  title = result['Title'] ? result['Title'] : '';
  description = result['Description'] ? result['Description'] : '';
  subject = result['Subject'] ? result['Subject'] : '';
  filepath = result['FilePath'] ? result['FilePath'] : '';
  buf = [];
  buf.push(
    '<form id="updateMetadataForm">',
    '<input type="text" name="FilePath" placeholder="Filepath" style="display: none;" value="', filepath, '">',
    '<label for="title">Title</label><br>',
    '<input type="text" name="Title" placeholder="Title" value="', title, '"><br><br>',
    '<label for="description">Description</label><br>',
    '<input type="text" name="Description" placeholder="Description" value="', description, '"><br><br>',
    '<label for="subject">Subject</label><br>',
    '<input type="text" name="Subject" placeholder="Subject" value="', subject, '"><br><br>',
    '</form>'
  )
  $('#metadata').html(buf.join(''));
  $('#saveMetadata').prop('disabled', false);
})
