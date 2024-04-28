document.addEventListener('DOMContentLoaded', () => {
    const mainPageBtn = document.getElementById('mainPage');
    const homeBtn = document.getElementById('home');
    const myDriveBtn = document.getElementById('myDrive');
    const computersBtn = document.getElementById('computers');
    const shareBtn = document.getElementById('share');
    const recentBtn = document.getElementById('recent');
    const starredBtn = document.getElementById('starred');
    const spamBtn = document.getElementById('spam');
    const trashBtn = document.getElementById('trash');
    const storageBtn = document.getElementById('storage');

    const homeContent = document.getElementById('homeContent');
    const myDriveContent = document.getElementById('myDriveContent');
    const computersContent = document.getElementById('computersContent');
    const shareContent = document.getElementById('shareContent');
    const recentContent = document.getElementById('recentContent');
    const starredContent = document.getElementById('starredContent');
    const spamContent = document.getElementById('spamContent');
    const trashContent = document.getElementById('trashContent');
    const storageContent = document.getElementById('storageContent');

    function showContent(contentElement) {
        allContents.forEach(content => {
            content.classList.add('hidden');
        });
        contentElement.classList.remove('hidden');
    }

    const allContents = document.querySelectorAll('.content');
    allContents.forEach(content => {
        if (content !== homeContent) {
            content.classList.add('hidden');
        }
    });
    document.getElementById('filesBtn').addEventListener('click', showFiles);
    document.getElementById('foldersBtn').addEventListener('click', showFolders);

    showContent(homeContent);
    document.title = 'Home - Google Drive';

    homeBtn.addEventListener('click', () => {
        showContent(homeContent);
        fetchMyDriveContent();
        document.title = 'Home - Google Drive'; 
    });

    myDriveBtn.addEventListener('click', () => {
        showContent(myDriveContent);
        fetchUserFiles(); 
        document.title = 'My Drive - Google Drive'; 
    });

    computersBtn.addEventListener('click', () => {
        showContent(computersContent);
        document.title = 'Computers - Google Drive'; 
    });

    shareBtn.addEventListener('click', () => {
        showContent(shareContent);
        document.title = 'Shared with Me - Google Drive'; 
    });

    recentBtn.addEventListener('click', () => {
        showContent(recentContent);
        document.title = 'Recent - Google Drive'; 
    });

    starredBtn.addEventListener('click', () => {
        showContent(starredContent);
        document.title = 'Starred - Google Drive'; 
    });

    spamBtn.addEventListener('click', () => {
        showContent(spamContent);
        document.title = 'Spam - Google Drive'; 
    });

    trashBtn.addEventListener('click', () => {
        showContent(trashContent);
        document.title = 'Trash - Google Drive'; 
    });

    storageBtn.addEventListener('click', () => {
        showContent(storageContent);
        document.title = 'Storage - Google Drive'; 
    });

    function setupButtonHandlers() {
        const createFileBtn = document.getElementById('create-file-btn');
        const fileInputs = document.getElementById('file-inputs');
        const submitFileBtn = document.getElementById('submit-file-btn');
        const fileTable = document.getElementById('file-table');
        const fileUploadInput = document.getElementById('file-upload-input');
        fileUploadInput.addEventListener('change', function() {
            if(this.files.length > 0) {
                uploadFile(this.files[0]);
            }
        });

        createFileBtn.addEventListener('click', () => {
            fileInputs.style.display = 'block';
        });

        submitFileBtn.addEventListener('click', () => {
            const fileName = document.getElementById('file-name').value;
            const fileReason = document.getElementById('file-reason').value;
            const fileOwner = document.getElementById('file-owner').value;
            const fileLocation = document.getElementById('file-location').value;

            const newRow = fileTable.insertRow(-1);
            newRow.insertCell(0).textContent = fileName;
            newRow.insertCell(1).textContent = fileReason;
            newRow.insertCell(2).textContent = fileOwner;
            newRow.insertCell(3).textContent = fileLocation;

            document.getElementById('file-name').value = '';
            document.getElementById('file-reason').value = '';
            document.getElementById('file-owner').value = '';
            document.getElementById('file-location').value = '';
            fileInputs.style.display = 'none';
        });
    }

    setupButtonHandlers();
    setupFileHandlers();
});

document.getElementById('create-folder-btn').addEventListener('click', function() {
    const folderName = prompt("Enter the name for the new folder:");
    if (!folderName) {
        alert("Folder name cannot be empty!");
        return;
    }

    const data = { folderName: folderName };
    fetch('/create-folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json()) // Ensure that the server responds with JSON
    .then(json => {
        if (json.success) { // Check if the server indicates success
            alert('Folder created successfully');
            fetchUserFolders(); // Fetch folders again to update the list
        } else {
            alert('Failed to create folder: ' + json.message); // Show server error message
        }
        toggleDropdown(document.getElementById('myDropdown'), true); // Close dropdown after action
    })
    .catch(err => {
        console.error('Error creating folder:', err);
        alert('Failed to create folder.');
    });
});



document.getElementById('file-upload-input').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files.length === 0) {
        alert('No file selected!');
        return;
    }
    const formData = new FormData();
    formData.append('file', files[0]); 

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(text => {
        alert('File uploaded successfully');
        console.log(text);
        toggleDropdown(document.getElementById('myDropdown'), true); // Close dropdown after action
    })
    .catch(err => {
        console.error('Error uploading file:', err);
        alert('Error uploading file');
    });
});

function toggleDropdown(button, close = false) {
    const dropdown = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    allDropdowns.forEach(d => {
        if (d !== dropdown && d.style.display === 'block') {
            d.style.display = 'none';
        }
    });
    dropdown.style.display = close ? 'none' : (dropdown.style.display === 'block') ? 'none' : 'block';
}


document.getElementById('filesBtn').addEventListener('click', function() {
    fetch('/get-user-files')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch files');
        }
        return response.json();
    })
    .then(files => {
        const fileListContainer = document.getElementById('fileListContainer');
        fileListContainer.innerHTML = ''; 

        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.textContent = file.file_name + " (" + file.file_path + ")";
            fileListContainer.appendChild(fileElement);
        });
    })
    .catch(err => {
        console.error('Error fetching files:', err);
        alert('Error fetching files');
    });
});

window.onclick = function(event) {
    var modal = document.getElementById('create-folder-form');
    if (event.target == modal) {
        modal.style.display = 'none';
        // Clean up: remove the event listener from the create button
        document.getElementById('create-folder-button').removeEventListener('click', handleCreateClick);
    }
    if (!event.target.matches('#dropdown-button') && !event.target.matches('.arrow')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        });
    }
};

document.getElementById('foldersBtn').addEventListener('click', function() {
    fetch('/get-user-folders')
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch folders');
        return response.json();
    })
    .then(folders => {
        const folderListContainer = document.getElementById('folderListContainer');
        folderListContainer.innerHTML = ''; 

        folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';
            folderElement.textContent = folder.folder_name;
            folderListContainer.appendChild(folderElement);
        });
    })
    .catch(error => {
        console.error('Error fetching folders:', error);
        alert('Error fetching folders.');
    });
    toggleDropdown(document.getElementById('myDropdown'));
});


function showFiles() {
    const filesContainer = document.getElementById('fileListContainer');
    const foldersContainer = document.getElementById('folderListContainer');
    filesContainer.classList.remove('hidden');
    foldersContainer.classList.add('hidden');
    fetchUserFiles(); 
}

function showFolders() {
    const filesContainer = document.getElementById('fileListContainer');
    const foldersContainer = document.getElementById('folderListContainer');
    filesContainer.classList.add('hidden'); 
    foldersContainer.classList.remove('hidden'); 
    fetchUserFolders(); 
}

function fetchUserFolders() {
    fetch('/get-user-folders') 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(folders => {
        const folderListContainer = document.getElementById('folderListContainer');
        folderListContainer.innerHTML = ''; 

        folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';
            folderElement.textContent = folder.folder_name; 
            folderListContainer.appendChild(folderElement);
        });
    })
    .catch(err => {
        console.error('Error fetching folders:', err);
        alert('Failed to load folders');
    });
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    fetch('/upload', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(result => {
        alert('File uploaded successfully');
        fetchUserFiles(); 
    })
    .catch(error => console.error('Error uploading file:', error));
}

// Global variable to keep track of the current open modal
var currentModal = null;

// Function to create and show the modal
// Global function to create and display modals
function modal1(content, onDelete, onDownload, onRename) {
    // Close the current modal if it exists
    if (currentModal) {
        currentModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal1';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-buttons">
                <button class="delete">Delete</button>
                <button class="download">Download</button>
                <button class="rename">Rename</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    const clickedElementRect = this.getBoundingClientRect();
    modal.style.top = `${clickedElementRect.bottom}px`;
    modal.style.left = `${clickedElementRect.left}px`;

    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        } else if (event.target.classList.contains('delete')) {
            onDelete();
            modal.remove();
        } else if (event.target.classList.contains('download')) {
            onDownload();
            modal.remove();
        } else if (event.target.classList.contains('rename')) {
            onRename();
            modal.remove();
        }
    });

    // Set the current modal to the newly created modal
    currentModal = modal;
}

document.getElementById('fileListContainer').addEventListener('click', function(event) {
    const fileElement = event.target.closest('.file-item');
    if (fileElement) {
        const fileId = fileElement.getAttribute('data-file-id');
        modal1.call(fileElement, fileElement.textContent, () => {
            deleteItem(file.id, 'file', () => fetchUserFiles());
        }, () => {
            downloadItem(file.id, 'file');
        }, () => {
            renameItem(file.id, 'file', fileElement, () => fetchUserFiles());
        });
    }
});

document.getElementById('folderListContainer').addEventListener('click', function(event) {
    const folderElement = event.target.closest('.folder-item');
    if (folderElement) {
        const folderId = folderElement.getAttribute('data-folder-id');
        modal1.call(folderElement, folderElement.textContent, () => {
            deleteItem(folder.id, 'folder', () => fetchUserFolders());
        }, () => {
            downloadItem(folder.id, 'folder');
        }, () => {
            renameItem(folder.id, 'folder', folderElement, () => fetchUserFolders());
        });        
    }
});
function renameItem(itemId, itemType, itemElement, callback) {
    const newName = prompt("Enter the new name:");
    if (!newName) {
        alert("The name cannot be empty!");
        return;
    }

    fetch('/rename', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, itemType, newName })
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message); // Assuming the response includes a message about the result
        
        // Update the UI element with the new name
        if (itemType === 'file') {
            const fileNameElement = itemElement.querySelector(`#file-name-${itemId}`);
            fileNameElement.textContent = newName;
        } else if (itemType === 'folder') {
            const folderNameElement = itemElement.querySelector(`#folder-name-${itemId}`);
            folderNameElement.textContent = newName;
        }

        // Optionally, fetch the updated data from the server
        if (itemType === 'file') {
            fetchUserFiles();
        } else if (itemType === 'folder') {
            fetchUserFolders();
        }

        if (typeof callback === 'function') {
            callback(); // Call the callback function if provided
        }
    })
    .catch(error => console.error('Error renaming item:', error));
}



function downloadItem(itemId, itemType) {
    // Prepare the data to send in the request
    const data = JSON.stringify({ itemId: itemId, itemType: itemType });

    fetch('/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        // Extract the filename from the Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const fileName = contentDisposition ? contentDisposition.split('filename=')[1] : (itemType === 'file' ? 'downloaded_file' : 'downloaded_folder.zip');
        return response.blob().then(blob => ({ blob, fileName }));
    })
    .then(({ blob, fileName }) => {
        // Create a URL for the blob object
        const url = window.URL.createObjectURL(blob);
        // Create a temporary anchor element and trigger the download with the original filename
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })
    .catch(error => {
        console.error('Download failed:', error);
        alert('Failed to download item');
    });
}


// Function to delete an item (file or folder)
function deleteItem(itemId, itemType, callback) {
    fetch('/delete-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, itemType })
    })
    .then(response => response.text())
    .then(text => {
        alert(text);
        if (itemType === 'file') {
            fetchUserFiles();
        } else if (itemType === 'folder') {
            fetchUserFolders();
        }
        if (typeof callback === 'function') {
            callback(); // Call the callback function after deletion
        }
    })
    .catch(err => {
        console.error('Error deleting item:', err);
        alert('Error deleting item');
    });
}

// Function to fetch user files and display them
function fetchUserFiles(query = '') {
    fetch(`/get-user-files?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(files => {
            const fileListContainer = document.getElementById('fileListContainer');
            fileListContainer.innerHTML = '';

            files.forEach(file => {
                const uploadTime = new Date(file.upload_date);
                const uploadDateString = uploadTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const fileElement = document.createElement('div');
                fileElement.className = 'file-item';
                
                // Set file name with ID
                const fileNameElement = document.createElement('div');
                fileNameElement.id = `file-name-${file.id}`;
                fileNameElement.textContent = file.file_name;
                fileElement.appendChild(fileNameElement);
                

                // Set upload date with ID
                const uploadDateElement = document.createElement('div');
                uploadDateElement.id = `upload-date-${file.id}`;
                uploadDateElement.textContent = `You opened ${uploadDateString}`;
                fileElement.appendChild(uploadDateElement);

                // Set owner with ID
                const ownerElement = document.createElement('div');
                ownerElement.id = `file-owner-${file.id}`;
                ownerElement.textContent = file.owner;
                fileElement.appendChild(ownerElement);

                // Set location with ID
                const locationElement = document.createElement('div');
                locationElement.id = `file-location-${file.id}`;
                locationElement.textContent = file.location;
                fileElement.appendChild(locationElement);

                

                fileElement.addEventListener('click', function() {
                    modal1.call(this, this.textContent, () => {
                        deleteItem(file.id, 'file', () => {
                            console.log('File deleted:', file.file_name);
                            fetchUserFiles(); // Refresh file list after deletion
                        });
                    }, () => {
                        downloadItem(file.id, 'file');
                    }, () => {
                        renameItem(file.id, 'file', () => {
                            fetchUserFiles(); // Refresh file list after renaming
                        });
                    });
                });
                

                fileListContainer.appendChild(fileElement);
            });
        })
        .catch(err => console.error('Error fetching files:', err));
}


// Function to fetch user folders and display them
function fetchUserFolders(query = '') {
    fetch(`/get-user-folders?query=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(folders => {
            const folderListContainer = document.getElementById('folderListContainer');
            folderListContainer.innerHTML = '';

            folders.forEach(folder => {
                const creationDate = new Date(folder.creation_date);
                const creationDateString = creationDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                const folderElement = document.createElement('div');
                folderElement.className = 'folder-item';
                
                // Set folder name with ID
                const folderNameElement = document.createElement('div');
                folderNameElement.id = `folder-name-${folder.id}`;
                folderNameElement.textContent = folder.folder_name;
                folderElement.appendChild(folderNameElement);
               
                // Set creation date with ID
                const folderCreationDateElement = document.createElement('div');
                folderCreationDateElement.id = `folder-creation-date-${folder.id}`;
                folderCreationDateElement.textContent = `Created on ${creationDateString}`;
                folderElement.appendChild(folderCreationDateElement);

                // Set folder owner with ID
                const folderOwnerElement = document.createElement('div');
                folderOwnerElement.id = `folder-owner-${folder.id}`;
                folderOwnerElement.textContent = `${folder.owner}`;
                folderElement.appendChild(folderOwnerElement);

                // Set folder location with ID
                const folderLocationElement = document.createElement('div');
                folderLocationElement.id = `folder-location-${folder.id}`;
                folderLocationElement.textContent = `${folder.folder_path}`;
                folderElement.appendChild(folderLocationElement);

                
                 
 

                // Add click event listener to display modal with folder information
                folderElement.addEventListener('click', function() {
                    modal1.call(this, this.textContent, () => {
                        deleteItem(folder.id, 'folder', () => {
                            console.log('Folder deleted:', folder.folder_name);
                            fetchUserFolders(); // Refresh folder list after deletion
                        });
                    }, () => {
                        downloadItem(folder.id, 'folder');
                    }, () => {
                        renameItem(folder.id, 'folder', () => {
                            console.log('Folder renamed:', folder.folder_name);
                            fetchUserFolders(); // Refresh folder list after renaming
                        });
                    });
                });
                

                folderListContainer.appendChild(folderElement);
            });
        })
        .catch(err => console.error('Error fetching folders:', err));
}


// Call the fetch functions when needed
fetchUserFiles();
fetchUserFolders();


function handleSearch() {
    const searchQuery = document.getElementById('search-bar').value.trim();
    if (searchQuery.length > 0) {
        // Determine which type of data to fetch based on UI state or specific flags
        const isShowingFiles = !document.getElementById('fileListContainer').classList.contains('hidden');
        if (isShowingFiles) {
            fetchUserFiles(searchQuery);  // Fetch files matching the search query
        } else {
            fetchUserFolders(searchQuery);  // Fetch folders matching the search query
        }
    }
}
function handleButtonClick(buttonId) {
  const fileList = document.querySelector('.name-content');
  const listButton = document.getElementById('list-btn1');
  const gridButton = document.getElementById('grid-btn1');

  if (buttonId === 'list-btn1') {
    fileList.classList.add('list-layout');
    fileList.classList.remove('grid-layout');
    listButton.classList.add('active');
    gridButton.classList.remove('active');
  } else if (buttonId === 'grid-btn1') {
    fileList.classList.add('grid-layout');
    fileList.classList.remove('list-layout');
    gridButton.classList.add('active');
    listButton.classList.remove('active');
  }
}

document.getElementById('search-bar').addEventListener('keyup', handleSearch);







// Function to handle closing the modal
function closeModal() {
    var modal = document.getElementById('create-folder-form');
    modal.style.display = 'none';
}

function createNewFolderPrompt() {
    // Display the modal
    var modal = document.getElementById('create-folder-form');
    modal.style.display = 'block';
    
    // Get the 'Create' button by ID
    var createButton = document.getElementById('create-folder-button');
    
    // Get the 'Close' button by ID
    var closeButton = document.getElementById('close-modal');
    
    // Function to handle folder creation
    function handleCreateClick() {
        var folderNameInput = document.getElementById('folder-name-input');
        var folderName = folderNameInput.value.trim();
        
        if (!folderName) {
            alert("Folder name cannot be empty.");
            return;
        }
        
        // Close the modal and clean up
        closeModal();
        createButton.removeEventListener('click', handleCreateClick);
        
        // Proceed to create new folder
        createNewFolder(folderName);
        
        // Clear the input for next time
        folderNameInput.value = '';
    }
    
    // Function to handle closing modal when close button is clicked
    function handleCloseClick() {
        closeModal();
        createButton.removeEventListener('click', handleCreateClick);
    }
    
    // Now set up the event listeners
    createButton.addEventListener('click', handleCreateClick);
    closeButton.addEventListener('click', handleCloseClick);
}

function createNewFolder(folderName) {
    var userId = sessionStorage.getItem('userId'); // Make sure 'userId' is set in your session storage

    fetch('/create-folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderName, userId }),
    })
    .then(response => response.json()) // Assuming the server responds with JSON
    .then(result => {
        alert(result.message); // Assuming the result has a 'message' field
        fetchUserFiles(); // Make sure this function is defined
    })
    .catch(error => console.error('Error creating folder:', error));
}
function fetchMyDriveContent() {
    const contentContainer = document.getElementById('myDriveContent');

    Promise.all([
        fetch('/get-user-files').then(res => res.json()),  // Fetch files
        fetch('/get-user-folders').then(res => res.json()) // Fetch folders
    ]).then(([files, folders]) => {
        // Create and append files list to the content container
        contentContainer.innerHTML = ''; // Clear existing content
        const filesList = createList(files, 'file');
        contentContainer.appendChild(filesList);

        // Create and append folders list to the content container
        const foldersList = createList(folders, 'folder');
        contentContainer.appendChild(foldersList);
    }).catch(err => {
        console.error('Failed to fetch files or folders:', err);
        alert('Failed to load My Drive content.');
    });
}

// This helper function creates HTML elements for files or folders and returns them as a list element.
function createList(items, type) {
    const list = document.createElement('div');
    items.forEach(item => {
        const itemElement = document.createElement('div');
        const itemNameElement = document.createElement('div');
        const itemDetailsElement = document.createElement('div');
        const ownerElement = document.createElement('div');
        const dateCreatedElement = document.createElement('div');

        itemNameElement.textContent = type === 'file' ? item.file_name : item.folder_name;
        itemDetailsElement.textContent = type === 'file' ? item.location : '';

        if (type === 'file') {
            ownerElement.textContent = item.owner;
            dateCreatedElement.textContent = new Date(item.upload_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
            ownerElement.textContent = item.owner;
            dateCreatedElement.textContent = new Date(item.creation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }

        itemElement.className = type === 'file' ? 'file-item' : 'folder-item';
        itemNameElement.className = 'item-name';
        itemDetailsElement.className = 'item-details';
        ownerElement.className = 'item-owner';
        dateCreatedElement.className = 'item-date-created';

        itemElement.appendChild(itemNameElement);
        if (type === 'file') {
            itemElement.appendChild(itemDetailsElement);
            itemElement.appendChild(ownerElement);
            itemElement.appendChild(dateCreatedElement);
        } else {
            itemElement.appendChild(ownerElement);
            itemElement.appendChild(dateCreatedElement);
        }

        // Add modal functionality or any other interactive element here
        itemElement.addEventListener('click', function() {
            modal1.call(this, itemNameElement.textContent, () => {
                deleteItem(item.id, type, () => {
                    console.log(`${type} deleted:`, itemNameElement.textContent);
                    type === 'file' ? fetchUserFiles() : fetchUserFolders(); // Refresh list after deletion
                });
            }, () => {
                downloadItem(item.id, type);
            }, () => {
                renameItem(item.id, type, () => {
                    console.log(`${type} renamed:`, itemNameElement.textContent);
                    type === 'file' ? fetchUserFiles() : fetchUserFolders(); // Refresh list after renaming
                });
            });
        });

        list.appendChild(itemElement);
    });
    return list;
}
