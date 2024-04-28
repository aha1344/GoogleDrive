// Function to show the menu when hovering over an element
function showMenu(element) {
  element.querySelector('.file-actions').style.display = 'block';
}

// Function to hide the menu when hovering out of an element
function hideMenu(element) {
  element.querySelector('.file-actions').style.display = 'none';
  element.querySelector('.kebab-items').style.display = 'none';
}

// Function to toggle the kebab menu items visibility
function toggleKebab(element) {
  const kebabItems = element.closest('.kebab-menu').querySelector('.kebab-items');
  kebabItems.style.display = kebabItems.style.display === 'block' ? 'none' : 'block';
}

// Placeholder functions for action icons (e.g., share, download, rename, star, move to trash)
// These functions alert the user that the functionality is not implemented yet
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