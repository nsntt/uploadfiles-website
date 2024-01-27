document.getElementById('custom-file-input').addEventListener('change', function() {
    document.getElementById('upload-btn').style.display = 'flex';
});

function showLoader() {
    document.getElementById('upload-btn').style.display = 'none';
    document.getElementById('loader-container').style.display = 'block';
}