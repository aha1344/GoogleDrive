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

    const mainPageContent = document.getElementById('mainPageContent');
    const homeContent = document.getElementById('homeContent');
    const myDriveContent = document.getElementById('myDriveContent');
    const computersContent = document.getElementById('computersContent');
    const shareContent = document.getElementById('shareContent');
    const recentContent = document.getElementById('recentContent');
    const starredContent = document.getElementById('starredContent');
    const spamContent = document.getElementById('spamContent');
    const trashContent = document.getElementById('trashContent');
    const storageContent = document.getElementById('storageContent');

    // Initially hide all content sections except the home content
    const allContents = document.querySelectorAll('.content');
    allContents.forEach(content => {
        if (content !== homeContent) {
            content.classList.add('hidden');
        }
    });
    document.getElementById('filesBtn').addEventListener('click', showFiles);
    document.getElementById('foldersBtn').addEventListener('click', showFolders);

    // Show the Home content by default
    showContent(homeContent);
    document.title = 'Home - Google Drive';

    homeBtn.addEventListener('click', () => {
        showContent(homeContent);
        fetchUserFiles();  // Fetch and display files for Home
    });

    myDriveBtn.addEventListener('click', () => {
        showContent(myDriveContent);
        fetchUserFiles();  // Fetch and display files for My Drive
    });

    computersBtn.addEventListener('click', () => {
        showContent(computersContent);
        document.title = 'Computers - Google Drive'; // Change title to Computers
    });

    shareBtn.addEventListener('click', () => {
        showContent(shareContent);
        document.title = 'Shared with Me - Google Drive'; // Change title to Shared with Me
    });

    recentBtn.addEventListener('click', () => {
        showContent(recentContent);
        document.title = 'Recent - Google Drive'; // Change title to Recent
    });

    starredBtn.addEventListener('click', () => {
        showContent(starredContent);
        document.title = 'Starred - Google Drive'; // Change title to Starred
    });

    spamBtn.addEventListener('click', () => {
        showContent(spamContent);
        document.title = 'Spam - Google Drive'; // Change title to Spam
    });

    trashBtn.addEventListener('click', () => {
        showContent(trashContent);
        document.title = 'Trash - Google Drive'; // Change title to Trash
    });

    storageBtn.addEventListener('click', () => {
        showContent(storageContent);
        document.title = 'Storage - Google Drive'; // Change title to Storage
    });

    function showContent(contentElement) {
        allContents.forEach(content => {
            content.classList.add('hidden');
        });
        contentElement.classList.remove('hidden');
    }
    // Initialize file and folder buttons and layouts
    setupButtonHandlers();
    setupFileHandlers();
});
document.getElementById('file-upload-input').addEventListener('change', function(event) {
    const files = event.target.files;
    if (files.length === 0) {
        alert('No file selected!');
        return;
    }
    const formData = new FormData();
    formData.append('file', files[0]);  // 'file' is the key expected by the server

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.text())
    .then(text => {
        alert('File uploaded successfully');
        console.log(text);
    })
    .catch(err => {
        console.error('Error uploading file:', err);
        alert('Error uploading file');
    });
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
        alert(text); // "Folder created successfully!"
        // Optionally refresh the list of files/folders here if needed
    })
    .catch(err => {
        console.error('Error creating folder:', err);
        alert('Failed to create folder.');
    });
});

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
        fileListContainer.innerHTML = ''; // Clear existing files

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


// Function to handle button clicks for files and folders, list and grid layouts
function handleButtonClick(buttonId) {
    const buttons = document.querySelectorAll('.ff-btn, .layout-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.id === buttonId) {
            button.classList.add('active');
        }
    });

    // Check if the "Files" button is clicked
    if (buttonId === 'filesBtn') {
        fetchUserFiles();
    }
}

function fetchUserFiles() {
    fetch('/get-user-files')
    .then(response => response.json())
    .then(files => {
        const fileListContainer = document.getElementById('fileListContainer');
        fileListContainer.innerHTML = ''; // Clear existing entries
        files.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.textContent = `${file.file_name} (${file.file_path})`;
            fileListContainer.appendChild(fileElement);
        });
    })
    .catch(err => console.error('Error fetching files:', err));
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    fetch('/upload', { method: 'POST', body: formData })
    .then(response => response.text())
    .then(result => {
        alert('File uploaded successfully');
        fetchUserFiles(); // Refresh the list of files
    })
    .catch(error => console.error('Error uploading file:', error));
}


// Function to handle dropdown menu
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    allDropdowns.forEach(d => {
        if (d !== dropdown && d.style.display === 'block') {
            d.style.display = 'none';
        }
    });
    dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
}


window.onclick = function(event) {
    if (!event.target.matches('#dropdown-button') && !event.target.matches('.arrow')) {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        dropdowns.forEach(dropdown => {
            if (dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        });
    }
}
document.getElementById('foldersBtn').addEventListener('click', function() {
    fetch('/get-user-folders')
    .then(response => {
        if (!response.ok) throw new Error('Failed to fetch folders');
        return response.json();
    })
    .then(folders => {
        const folderListContainer = document.getElementById('folderListContainer');
        folderListContainer.innerHTML = ''; // Clear previous entries

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
});
function showFiles() {
    const filesContainer = document.getElementById('fileListContainer');
    const foldersContainer = document.getElementById('folderListContainer');
    filesContainer.classList.remove('hidden');
    foldersContainer.classList.add('hidden');
    fetchUserFiles();  // This function fetches and displays the files
}
function fetchUserFolders() {
    fetch('/get-user-folders')  // Adjust the API endpoint as needed
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(folders => {
        const folderListContainer = document.getElementById('folderListContainer');
        folderListContainer.innerHTML = '';  // Clear previous entries

        folders.forEach(folder => {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';
            folderElement.textContent = folder.folder_name;  // Adjust according to the data structure
            folderListContainer.appendChild(folderElement);
        });
    })
    .catch(err => {
        console.error('Error fetching folders:', err);
        alert('Failed to load folders');
    });
}


function showFolders() {
    const filesContainer = document.getElementById('fileListContainer');
    const foldersContainer = document.getElementById('folderListContainer');
    filesContainer.classList.add('hidden');  // Hide files container
    foldersContainer.classList.remove('hidden');  // Show folders container
    fetchUserFolders();  // Fetch and display folders
}


function createNewFolderPrompt() {
    const folderName = prompt("Please enter the folder name:");
    if (!folderName) {
        alert("Folder name cannot be empty.");
        return;
    }
    createNewFolder(folderName);
}
function createNewFolder(folderName) {
    const userId = sessionStorage.getItem('userId');  // Use the stored user ID

    fetch('/create-folder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderName, userId }),
    })
    .then(response => response.text())
    .then(result => {
        alert(result);
        fetchUserFiles();  // Refresh the file list
    })
    .catch(error => console.error('Error creating folder:', error));
}



function setupButtonHandlers() {
    const createFileBtn = document.getElementById('create-file-btn');
    const fileInputs = document.getElementById('file-inputs');
    const submitFileBtn = document.getElementById('submit-file-btn');
    const fileTable = document.getElementById('file-table');
    const newFolderBtn = document.querySelector(".add-new-button");
    newFolderBtn.addEventListener('click', () => {
        const folderName = prompt("Enter folder name:");
        if(folderName) {
            createNewFolder(folderName);
        }
    });
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
