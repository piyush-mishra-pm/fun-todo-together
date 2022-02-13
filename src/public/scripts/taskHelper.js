/****************************************************************
 * Contains functions for:
 * 0. Utilities
 * 1. CREATING a new task.
 * 2. UPDATING a task.
 * 3. DELETING a task.
 * 4. QUERIES:
 */

// 1. Utilities: Common elements which can be used:
// Can be used to show messages:
const feedback = document.getElementById('feedback');

// Common input fields used
const inputTaskHeading = document.getElementById('new-task-heading');
const inputTaskDetail = document.getElementById('new-task-detail');
const inputTaskDone = document.getElementById('new-task-done');


// Reset the input fields:
function resetInputFields(){
    inputTaskHeading.value='';
    inputTaskDetail.value = '';
    inputTaskDone.checked=false;
}
resetInputFields();


// 1. CREATE: New todo HTMl elements:
const btnCreateNew = document.getElementById('form-btn-create');

const createNewTask = async (event)=> {

    event.preventDefault();

    feedback.innerHTML ='';

    // Validation checks to check for heading in task (required attribute for DB).
    if(!inputTaskHeading.value) {
        feedback.innerHTML = 'Task heading required.';
        return;
    }

    const result = await fetch('/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({
            heading: inputTaskHeading.value,
            detail: inputTaskDetail.value,
            done: inputTaskDone.value==='true'? 'true': 'false',
        }),
    }).then(res=> res.json());

    if(result.status==='ok'){
        location.reload();
    }else{
        feedback.innerHTML = result.message;
    }
};

btnCreateNew.addEventListener('click', createNewTask);

// 2. UPDATING a task:
const modalUpdateTask = document.getElementById('modal-update-task');
updateBtnInactive();

const btnUpdate = document.getElementById('form-btn-update');

const updateTaskHeading = document.getElementById('input-update-task-heading');
const updateTaskDetail = document.getElementById('input-update-task-detail');
const updateTaskDone = document.getElementById('input-update-task-done');

const updateATask = async (event) => {
    const btnUpdate = event.target.closest('.btn-edit');
    if (!btnUpdate) return; 

    const taskItem = event.target.closest('.task-item');
    makeUpdateFormReady(taskItem);
};

function updateBtnActive(){
    modalUpdateTask.classList.remove('is-hidden');
}

function updateBtnInactive() {
    modalUpdateTask.classList.add('is-hidden');
}

function makeUpdateFormReady(taskItem) {
    updateBtnActive();
    copyContentsInFormToEdit(taskItem);
}

function copyContentsInFormToEdit(taskItem) {    
    updateTaskHeading.value = taskItem.querySelector('.task-item-heading').innerHTML;
    updateTaskDetail.value = taskItem.querySelector('.task-item-detail').innerHTML;
    updateTaskDone.checked = taskItem.querySelector('.task-item-done').innerHTML === 'true'
        ? true
        : false;
    
    const taskId = taskItem.dataset.taskId;
    btnUpdate.dataset.taskId = taskId;
}

async function onUpdateBtnClicked(e){
    e.preventDefault();
    // Send update task data to server.
    const taskId = btnUpdate.dataset.taskId;
    const updateResult = await fetch(`/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            heading: updateTaskHeading.value,
            detail: updateTaskDetail.value,
            done: updateTaskDone.checked ? 'true' : 'false',
        }),
    }).then(res => res.json());

    // give feedback message upon successful update.
    feedback.innerHTML = updateResult.message;
    if(updateResult.status==='ok') feedback.innerHTML+=' Please refresh the page to see the change.';

    // toggle Update and Create button visibility.
    updateBtnInactive();
    location.reload();
}

function onCancelUpdateClicked(e){
    e.preventDefault();
    updateBtnInactive();
    // Reset data attribute on update button.
    btnUpdate.dataset.taskId = 'x';
    // Resetting the input fields:
    resetInputFields();
}

const editListener = document.querySelector('.task-edit-listener');
editListener.addEventListener('click', updateATask);
btnUpdate.addEventListener('click', onUpdateBtnClicked);
const btnCancelUpdate = document.getElementById('form-btn-cancel-update');
btnCancelUpdate.addEventListener('click', onCancelUpdateClicked);


// 3. DELETING a task:
function onDeleteBtnClicked(event){
    const btnDelete = event.target.closest('.btn-delete');
    if (!btnDelete) return;

    feedback.innerHTML = '';
    const taskItem = event.target.closest('.task-item');
    console.log(taskItem);
    deleteModal.dataset.taskId = taskItem.dataset.taskId;
    showConfirmDeleteModal(taskItem);
}
function showConfirmDeleteModal(taskItem){
    deleteModal.classList.remove('is-hidden');
}
async function onConfirmDeleteClicked(){
    const taskIdToDelete = deleteModal.dataset.taskId;
    const deleteResult = await fetch(`/task/${taskIdToDelete}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());

    // give feedback message upon successful delete.
    feedback.innerHTML = deleteResult.message;
    if (deleteResult.status === 'ok')
        feedback.innerHTML += ' Please refresh the page to see the change.';

    // toggle Delete modal visibility.
    onCancelDeleteClicked();
    location.reload();
}
function onCancelDeleteClicked() {
    deleteModal.classList.add('is-hidden');
    // Reseting the dataset of taskId to delete.
    deleteModal.dataset.taskId = 'x';
}
// If clicked outside the deleteModal while deltemodal is active, then close the delete modal.
window.onclick = function (event) {
    if (event.target == deleteModal) onCancelDeleteClicked();
};
const deleteListeners = document.querySelectorAll('.task-delete-listener');
deleteListeners.forEach(listener=>listener.addEventListener('click', onDeleteBtnClicked));
const deleteModal = document.getElementById('modal-confirm-delete');
const btnConfirmDelete = document.getElementById('btn-confirm-delete').addEventListener('click',onConfirmDeleteClicked);
const btnCancelDelete = document.getElementById('btn-cancel-delete').addEventListener('click',onCancelDeleteClicked);

// 4. Queries tasks:
const btnQueriesSubmit = document.getElementById('queries-btn-submit');
const btnQueriesReset = document.getElementById('queries-btn-reset');
const formQueries = document.getElementById('queries-form');
btnQueriesReset.addEventListener('click',queriesResetHandler);
btnQueriesSubmit.addEventListener('click', queriesSubmitHandler);
async function queriesSubmitHandler(e) {
    e.preventDefault();
    console.log('clicked submit');
    let queryUrl = '/tasks?';
    if (formQueries.sort.value != 'none') queryUrl += 'sortBy=createdAt:'+formQueries.sort.value + '&'; // asc or desc
    if (formQueries.done.value != 'both') queryUrl += 'done='+formQueries.done.value + '&'; // asc or desc
    if (formQueries.limit.value >0 ) queryUrl += 'limit='+formQueries.limit.value; // asc or desc

    location.href = queryUrl;
}
function queriesResetHandler(){
    console.log('reset clicked');
    formQueries.sort.value='none';
    formQueries.done.value = 'both';
    console.log(formQueries.limit.value);
    formQueries.limit.value = 4;
}

