// document.getElementById('open-file-btn').addEventListener('click', () => {
//   const filePath = document.getElementById('file-path').value;
//   if (filePath) {
//     window.electronAPI.openFile(filePath);
//   } else {
//     alert('Please enter a file path.');
//   }
// });

window.electronAPI.onWhoamiResult((result) => {
  $('#whoami-result').html(`<p>Hello, <b>${result}</b>!</p>`);
});
