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
        fetchUserFiles(); 
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
    .then(response => response.text())
    .then(text => {
        alert(text); 
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

// Function to create and show the modal
function modal1(content, onDelete) {
    // Check if an existing modal is open, if yes then remove it
    const existingModal = document.querySelector('.modal1');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'modal1';
    
    // Add content to modal
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-buttons">
                <button class="delete">Delete</button>
                <button class="download">Download</button>
            </div>
        </div>
    `;
    
    // Append modal to body
    document.body.appendChild(modal);
    
    // Show modal
    modal.style.display = 'block';

    // Position modal right under the clicked element
    const clickedElementRect = this.getBoundingClientRect();
    const modalHeight = modal.clientHeight;
    modal.style.top = `${clickedElementRect.bottom}px`;
    modal.style.left = `${clickedElementRect.left}px`;

    // Close modal when clicked outside of it
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.remove();
        }
    });

    // Add event listener to delete button
    const deleteButton = modal.querySelector('.delete');
    deleteButton.addEventListener('click', onDelete);
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

                

                // Add click event listener to display modal with file information
                fileElement.addEventListener('click', function() {
                    modal1.call(fileElement, fileElement.textContent, () => {
                        // Here you can add the delete functionality for the file
                        // For example:
                        // deleteFile(file.id);
                        console.log('File deleted:', file.file_name);
                        modal-search.remove(); // Remove the modal after deletion
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
                    modal1.call(folderElement, folderElement.textContent, () => {
                        // Here you can add the delete functionality for the folder
                        // For example:
                        // deleteFolder(folder.id);
                        console.log('Folder deleted:', folder.folder_name);
                        modal-search.remove(); // Remove the modal after deletion
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