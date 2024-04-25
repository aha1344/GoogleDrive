// Add this to a new JS file hover_menu.js
function showMenu(element) {
    element.querySelector('.file-actions').style.display = 'block';
  }
  
  function hideMenu(element) {
    element.querySelector('.file-actions').style.display = 'none';
    element.querySelector('.kebab-items').style.display = 'none';
  }
  
  function toggleKebab(element) {
    const kebabItems = element.closest('.kebab-menu').querySelector('.kebab-items');
    kebabItems.style.display = kebabItems.style.display === 'block' ? 'none' : 'block';
  }
  
  // Placeholder functions for action icons
  function share() {
    alert('Share function not implemented');
  }
  
  function download() {
    alert('Download function not implemented');
  }
  
  function rename() {
    alert('Rename function not implemented');
  }
  
  function star() {
    alert('Star function not implemented');
  }
  
  function moveToTrash() {
    alert('Move to Trash function not implemented');
  }
  