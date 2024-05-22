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