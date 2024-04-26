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
    });

    myDriveBtn.addEventListener('click', () => {
        showContent(myDriveContent);
        fetchUserFiles(); 
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

function fetchUserFiles() {
    fetch('/get-user-files')
    .then(response => response.json())
    .then(files => {
        const fileListContainer = document.getElementById('fileListContainer');
        fileListContainer.innerHTML = ''; 

        files.forEach(file => {
            const uploadTime = new Date(file.upload_date); 
            const uploadDateString = uploadTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const fileElement = document.createElement('div');
            fileElement.className = 'file-item';
            fileElement.textContent = `${file.file_name} - You opened . ${uploadDateString}, Location: ${file.location}, Owner: ${file.owner}`;
            fileListContainer.appendChild(fileElement);
        });
    })
    .catch(err => console.error('Error fetching files:', err));
}

function fetchUserFolders() {
    fetch('/get-user-folders')
    .then(response => response.json())
    .then(folders => {
        const folderListContainer = document.getElementById('folderListContainer');
        folderListContainer.innerHTML = ''; 

        folders.forEach(folder => {
            const creationDate = new Date(folder.creation_date); 
            const creationDateString = creationDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            const folderElement = document.createElement('div');
            folderElement.className = 'folder-item';
            folderElement.textContent = `${folder.folder_name} - Owner: ${folder.owner}, Location: ${folder.folder_path}, Creation Date: ${creationDateString}`; // Updated to folder.owner
            folderListContainer.appendChild(folderElement);
        });
    })
    .catch(err => console.error('Error fetching folders:', err));
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
    const userId = sessionStorage.getItem('userId'); 

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
        fetchUserFiles(); 
    })
    .catch(error => console.error('Error creating folder:', error));
}