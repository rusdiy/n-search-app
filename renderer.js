document.getElementById('open-file-btn').addEventListener('click', () => {
  const filePath = document.getElementById('file-path').value;
  if (filePath) {
    window.electronAPI.openFile(filePath);
  } else {
    alert('Please enter a file path.');
  }
});

document.getElementById('get-whoami-btn').addEventListener('click', () => {
  window.electronAPI.getWhoami();
});

window.electronAPI.onWhoamiResult((result) => {
  document.getElementById('whoami-result').textContent = result;
});
