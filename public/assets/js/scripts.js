document.addEventListener('DOMContentLoaded', function() {
    loadTeamList(1); // Load the first page by default
    loadStateFilter(); // Load the state filter options

});

function loadStateFilter() {
    fetch('../includes/read.php')
    .then(response => response.json())
    .then(data => {
        const headers = data.headers;
        const rows = data.data;
        const stateIndex = headers.indexOf('State');
        const states = [...new Set(rows.map(row => row[stateIndex]))].sort();
        const stateFilter = document.getElementById('stateFilter');
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });
    });
}

function filterData() {
    const state = document.getElementById('stateFilter').value;
    const minSales = document.getElementById('salesFilter').value;
    const minReviews = document.getElementById('reviewsFilter').value;
    const searchByAgentName = document.getElementById('searchByName').value;
    loadTeamList(1, state, minSales, minReviews, searchByAgentName);
}

function loadTeamList(page, filterState = '', minSales = '', minReviews = '', agentName = '') {
    fetch('../includes/read.php')
    .then(response => response.json())
    .then(data => {
        const headers = data.headers;
        const rows = data.data;
        const itemsPerPage = 5; // Change the number of items per page to 5
        let filteredRows = rows;

        if (filterState || minSales || minReviews || agentName) {
            const stateIndex = headers.indexOf('State');
            const salesIndex = headers.indexOf('Last 12 Months Sales');
            const reviewsIndex = headers.indexOf('Zillow Reviews');
            const agentNameIndex = headers.indexOf('Agent Name');
            
            filteredRows = rows.filter(row => {
                const stateMatch = filterState ? row[stateIndex] === filterState : true;
                const salesMatch = minSales ? parseInt(row[salesIndex]) >= parseInt(minSales) : true;
                const reviewsMatch = minReviews ? parseInt(row[reviewsIndex]) >= parseInt(minReviews) : true;
                const agentNameMatch = agentName ? row[agentNameIndex].includes(agentName) : true;
                return stateMatch && salesMatch && reviewsMatch && agentNameMatch;
            });
        }

        // document.getElementById('recordCount').textContent = `Total Records: ${filteredRows.length}`;

        const totalPages = Math.ceil(filteredRows.length / itemsPerPage);
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedRows = filteredRows.slice(start, end);

        let table = `<div class="table-responsive"><div class="table-width"><table class="table table-bordered"><thead><tr>`;
        headers.forEach(header => {
            if (!['Facebook', 'Instagram', 'LinkedIn', 'Pinterest', 'Twitter', 'YouTube', 'Website', 'Blog'].includes(header)) {
                table += `<th>${header}</th>`;
            }
        });
        table += `<th>Actions</th></tr></thead><tbody>`;
        paginatedRows.forEach((row, index) => {
            table += `<tr id="row-${index}" data-id="${row[0]}">`;
            row.forEach((cell, cellIndex) => {
                if (headers[cellIndex] === 'Zillow Profile') {
                    table += `<td><button class="btn btn-link" onclick="window.open('${cell}', '_blank')">View Profile</button></td>`;
                } else if (!['Facebook', 'Instagram', 'LinkedIn', 'Pinterest', 'Twitter', 'YouTube', 'Website', 'Blog'].includes(headers[cellIndex])) {
                    table += `<td contenteditable="true" data-header="${headers[cellIndex]}">${cell}</td>`;
                } 
            });
            table += `<td>
                <div class="btn-wrap">
                    <button class="btn btn-info btn-sm" onclick="toggleDetails(${index})">Details</button>
                    <a href="#" class="btn btn-warning btn-sm" data-toggle="modal" data-target="#showEditModal" onclick="editRows(${row[0]})">Edit</a>
                </div>
            </td></tr>`;
            table += `<tr id="details-${index}" style="display:none;"><td colspan="${headers.length + 1}">
                <table class="table table-bordered"><tbody>`;
            table += `<tr><th>Website</th><td>${row[headers.indexOf('Website')] || ''}</td><th>Blog</th><td>${row[headers.indexOf('Blog')] || ''}</td></tr>`;
            table += `<tr><th>Facebook</th><td>${row[headers.indexOf('Facebook')] || ''}</td><th>Instagram</th><td>${row[headers.indexOf('Instagram')] || ''}</td><th>LinkedIn</th><td>${row[headers.indexOf('LinkedIn')] || ''}</td></tr>`;
            table += `<tr><th>Pinterest</th><td>${row[headers.indexOf('Pinterest')] || ''}</td><th>Twitter</th><td>${row[headers.indexOf('Twitter')] || ''}</td><th>YouTube</th><td>${row[headers.indexOf('YouTube')] || ''}</td></tr>`;
            table += `</tbody></table></td></tr>`;
        });
        table += `</tbody></table></div></div>`;
        
        let pagination = `<nav class="d-flex justify-content-between" aria-label="Page navigation"><div class="left-container"><span id="recordCount" class="record-count"></span></div><ul class="pagination">`;
        const maxPagesToShow = 5;
        let startPage = Math.max(page - Math.floor(maxPagesToShow / 2), 1);
        let endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(endPage - maxPagesToShow + 1, 1);
        }

        if (startPage > 1) {
            pagination += `<li class="page-item"><a class="page-link" href="#" onclick="loadTeamList(1, '${filterState}', '${minSales}', '${minReviews}')">First</a></li>`;
            pagination += `<li class="page-item"><a class="page-link" href="#" onclick="loadTeamList(${page - 1}, '${filterState}', '${minSales}', '${minReviews}')">Previous</a></li>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            pagination += `<li class="page-item ${i === page ? 'active' : ''}"><a class="page-link" href="#" onclick="loadTeamList(${i}, '${filterState}', '${minSales}', '${minReviews}')">${i}</a></li>`;
        }

        if (endPage < totalPages) {
            pagination += `<li class="page-item"><a class="page-link" href="#" onclick="loadTeamList(${page + 1}, '${filterState}', '${minSales}', '${minReviews}')">Next</a></li>`;
            pagination += `<li class="page-item"><a class="page-link" href="#" onclick="loadTeamList(${totalPages}, '${filterState}', '${minSales}', '${minReviews}')">Last</a></li>`;
        }

        pagination += `</ul></nav>`;

        document.getElementById('teamList').innerHTML = table + pagination;
        document.getElementById('recordCount').textContent = `Total Records: ${filteredRows.length}`;
    });
}

function toggleDetails(index) {
    const detailsRow = document.getElementById(`details-${index}`);
    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = '';
    } else {
        detailsRow.style.display = 'none';
    }
}

function showCreateForm() {
    const createForm = document.getElementById('createForm');

    let showFormModal = `
        <!-- Modal -->
        <div class="modal fade" id="showAddNewModal" tabindex="-1" role="dialog" aria-labelledby="showAddNewModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="showAddNewModalTitle">Add New Team Member</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="creationForm">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="agentName">Agent Name:</label>
                            <input type="text" class="form-control" name="agentName" required>
                        </div>
                        <div class="form-group">
                            <label for="teamName">Team Name:</label>
                            <input type="text" class="form-control" name="teamName" required>
                        </div>
                        <div class="form-group">
                            <label for="state">State:</label>
                            <select id="states" class="form-control" name="state" required>
                                <option disabled selected>...</option>
                                <option value="az">AZ</option>
                                <option value="ca">CA</option>
                                <option value="fl">FL</option>
                                <option value="il">IL</option>
                                <option value="nc">NC</option>
                                <option value="or">OR</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="brokerage">Brokerage:</label>
                            <input type="text" class="form-control" name="brokerage" required>
                        </div>
                        <div class="form-group">
                            <label for="lastMonthSales">Last 12 Months Sales:</label>
                            <input type="number" class="form-control" name="lastMonthSales" value="0" required>
                        </div>
                        <div class="form-group">
                            <label for="agentPhone">Agent Phone:</label>
                            <input type="text" id="agentPhone" class="form-control" name="agentPhone" placeholder="(123) 456-7890" required>
                        </div>
                        <div class="form-group">
                            <label for="agentEmail">Agent Email:</label>
                            <input type="email" class="form-control" name="agentEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="zillowProfile">Zillow Profile:</label>
                            <input type="file" class="form-control" name="zillowProfile">
                        </div>
                        <div class="form-group">
                            <label for="zillowReviews">Zillow Reviews:</label>
                            <input type="number" class="form-control" name="zillowReviews" value="0">
                        </div>
                        <div class="form-group">
                            <label for="notes">Notes:</label>
                            <textarea name="notes" class="form-control" rows="1"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="website">Website:</label>
                            <input type="text" class="form-control" name="website">
                        </div>
                        <div class="form-group">
                            <label for="facebook">Facebook:</label>
                            <input type="text" class="form-control" name="facebook">
                        </div>
                        <div class="form-group">
                            <label for="pinterest">Pinterest:</label>
                            <input type="text" class="form-control" name="pinterest">
                        </div>
                        <div class="form-group">
                            <label for="blog">Blog:</label>
                            <input type="text" class="form-control" name="blog">
                        </div>
                        <div class="form-group">
                            <label for="instagram">Instagram:</label>
                            <input type="text" class="form-control" name="instagram">
                        </div>
                        <div class="form-group">
                            <label for="linkedIn">LinkedIn:</label>
                            <input type="text" class="form-control" name="linkedIn">
                        </div>
                        <div class="form-group">
                            <label for="youtube">YouTube:</label>
                            <input type="text" class="form-control" name="youtube">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary" onclick="submitForm()">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    createForm.insertAdjacentHTML('beforeend', showFormModal);

    // Agent Phone Format
    document.getElementById('agentPhone').addEventListener('input', function (e) {
        let value = e.target.value;
    
        // Insert formatting logic here
        // For simplicity, let's assume we just handle "Cell" designation
        if (value.startsWith("Cell")) {
            value = value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4) + ' ' + value.slice(4);
            if (value.length > 8) value = value.slice(0, 8) + '-' + value.slice(8);
            if (value.length > 13) value = value.slice(0, 13) + '-' + value.slice(13);
            e.target.value = 'Cell ' + value;
        } else {
            // Default phone formatting
            value = value.replace(/\D/g, '');
            if (value.length > 3) value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
            if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9);
            e.target.value = value;
        }
    });
}

function submitForm(){
    var form = document.getElementById("creationForm");

    var formData = new FormData(form);

    console.log(formData);

    fetch('../includes/create.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        response.json()
    })
    .then(data => {
        showMessage(data.message);
        loadTeamList(1);
        hideCreateForm();
    });

}

function hideCreateForm() {
    document.getElementById('createForm').style.display = 'none';
    document.getElementById('createForm').innerHTML = '';
}

function showMessage(message) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="alert alert-success">${message}</div>`;
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
}

function editRows(id){

    fetch('../includes/read.php')
    .then(response => response.json())
    .then(data => {
        const headers = data.headers;
        const rows = data.data;
        let filteredRows = rows;

        const index = headers.indexOf('id');
            
        filteredRows = rows.filter(row => {
            const recordMatch = row[index] === id.toString();
            return recordMatch;
        })


        const result = headers.reduce((obj, property, index) => {
            obj[property] = filteredRows[0][index];
            return obj;
        }, {});
        
        showModalEdit(result);
    });
    
}

function showModalEdit(data){
    console.log(data);
    const createForm = document.getElementById('createForm');

    let showFormModal = `
        <div class="modal fade" id="showEditModal" tabindex="-1" role="dialog" aria-labelledby="showEditModalTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="showEditModalTitle">Edit a Team Member</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <form id="creationForm">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="agentName">Agent Name:</label>
                            <input type="text" class="form-control" name="agentName" required>
                        </div>
                        <div class="form-group">
                            <label for="teamName">Team Name:</label>
                            <input type="text" class="form-control" name="teamName" required>
                        </div>
                        <div class="form-group">
                            <label for="state">State:</label>
                            <select id="states" class="form-control" name="state" required>
                                <option disabled selected>...</option>
                                <option value="az">AZ</option>
                                <option value="ca">CA</option>
                                <option value="fl">FL</option>
                                <option value="il">IL</option>
                                <option value="nc">NC</option>
                                <option value="or">OR</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="brokerage">Brokerage:</label>
                            <input type="text" class="form-control" name="brokerage" required>
                        </div>
                        <div class="form-group">
                            <label for="lastMonthSales">Last 12 Months Sales:</label>
                            <input type="number" class="form-control" name="lastMonthSales" value="0" required>
                        </div>
                        <div class="form-group">
                            <label for="agentPhone">Agent Phone:</label>
                            <input type="text" id="agentPhone" class="form-control" name="agentPhone" placeholder="(123) 456-7890" required>
                        </div>
                        <div class="form-group">
                            <label for="agentEmail">Agent Email:</label>
                            <input type="email" class="form-control" name="agentEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="zillowProfile">Zillow Profile:</label>
                            <input type="file" class="form-control" name="zillowProfile">
                        </div>
                        <div class="form-group">
                            <label for="zillowReviews">Zillow Reviews:</label>
                            <input type="number" class="form-control" name="zillowReviews" value="0">
                        </div>
                        <div class="form-group">
                            <label for="notes">Notes:</label>
                            <textarea name="notes" class="form-control" rows="1"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="website">Website:</label>
                            <input type="text" class="form-control" name="website">
                        </div>
                        <div class="form-group">
                            <label for="facebook">Facebook:</label>
                            <input type="text" class="form-control" name="facebook">
                        </div>
                        <div class="form-group">
                            <label for="pinterest">Pinterest:</label>
                            <input type="text" class="form-control" name="pinterest">
                        </div>
                        <div class="form-group">
                            <label for="blog">Blog:</label>
                            <input type="text" class="form-control" name="blog">
                        </div>
                        <div class="form-group">
                            <label for="instagram">Instagram:</label>
                            <input type="text" class="form-control" name="instagram">
                        </div>
                        <div class="form-group">
                            <label for="linkedIn">LinkedIn:</label>
                            <input type="text" class="form-control" name="linkedIn">
                        </div>
                        <div class="form-group">
                            <label for="youtube">YouTube:</label>
                            <input type="text" class="form-control" name="youtube">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-primary" onclick="Update()">Update</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    createForm.insertAdjacentHTML('beforeend', showFormModal);

    // Agent Phone Format
    document.getElementById('agentPhone').addEventListener('input', function (e) {
        let value = e.target.value;
    
        // Insert formatting logic here
        // For simplicity, let's assume we just handle "Cell" designation
        if (value.startsWith("Cell")) {
            value = value.replace(/\D/g, '');
            if (value.length > 4) value = value.slice(0, 4) + ' ' + value.slice(4);
            if (value.length > 8) value = value.slice(0, 8) + '-' + value.slice(8);
            if (value.length > 13) value = value.slice(0, 13) + '-' + value.slice(13);
            e.target.value = 'Cell ' + value;
        } else {
            // Default phone formatting
            value = value.replace(/\D/g, '');
            if (value.length > 3) value = '(' + value.slice(0, 3) + ') ' + value.slice(3);
            if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9);
            e.target.value = value;
        }
    });
}

function saveRow(index) {
    const row = document.getElementById(`row-${index}`);
    const cells = row.querySelectorAll('td[contenteditable="true"]');
    const updatedData = { id: row.getAttribute('data-id') };

    cells.forEach(cell => {
        const header = cell.getAttribute('data-header');
        updatedData[header] = cell.textContent;
    });

    fetch('../includes/update.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        showMessage(data.message);
        if (data.status === 'success') {
            loadTeamList(1); // Reload the first page after saving
        }
    });
}