/****************************************************************
 * Contains functions for:
 * 0. Utilities
 * 1. CREATING a new task.
 * 2. UPDATING a task.
 * 3. DELETING a task.
 * 4. QUERIES:
 * 5. TAGS:
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

// Confirming Delete Click Utility 
// Used by both Tags and tasks to delete themselves.
const deleteUtility = document.getElementById('modal-delete-utility');

// Can set up the delete utility and also reset it (unregister event listeners,etc.)
function setupOnDeleteClicked(onConfirmHandler,onCancelHandler,isReset,message){
    // (Re)setting the Delete message:
    deleteUtility.querySelector('#msg-delete-utility').innerHTML = isReset? '': message;

    // (Un)registering the event handler for confirm delete click:
    if(isReset)deleteUtility.querySelector('#btn-confirm-delete-utility').removeEventListener('click', onConfirmHandler);
    else deleteUtility.querySelector('#btn-confirm-delete-utility').addEventListener('click', onConfirmHandler);

    // (Un)Registering the event handler for cancel delete click:
    if(isReset) deleteUtility.querySelector('#btn-cancel-delete-utility').removeEventListener('click', onCancelHandler);
    else deleteUtility.querySelector('#btn-cancel-delete-utility').addEventListener('click', onCancelHandler);

    // After configuring (or resetting) the modal as above, we can make it (in)visible.
    if(isReset) deleteUtility.classList.add('is-hidden');
    else deleteUtility.classList.remove('is-hidden');
}

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

    // Tags selected for the new-task.
    const tags = getTagsAppliedByCheckboxes();
    console.log(inputTaskDone.value);

    const result = await fetch('/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({
            heading: inputTaskHeading.value,
            detail: inputTaskDetail.value,
            done: inputTaskDone.checked,
            tags:tags,
        }),
    }).then(res=> res.json());

    if(result.status==='ok'){
        await location.reload();
    }else{
        feedback.innerHTML = result.message;
    }
};

function getTagsAppliedByCheckboxes(){
    let selectedTagIds = [];
    document.
        getElementById('tags-section').
        querySelectorAll('input[type="checkbox"]').
        forEach(tag=>{
            if(tag.checked){
                const tagId = tag.closest('.tag-item').dataset.tagId;
                selectedTagIds.push(tagId);
            }
        });
    return selectedTagIds;
}

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
    
    handlingTags(taskItem);
    
    const taskId = taskItem.dataset.taskId;
    btnUpdate.dataset.taskId = taskId;
}

let totalTags=[];
let appliedTags=[];
let availableTags=[];

function handlingTags(taskItem){
    totalTags = getAllTags();
    appliedTags = getAppliedTags(taskItem);
    availableTags=getAvailableTags(appliedTags,totalTags);

    renderTagListInEditMenu();
}

function renderTagListInEditMenu(){
    console.log('Appl',appliedTags);
    console.log('Avail', availableTags);
    populateAppliedTags(appliedTags);
    populateAvailableTags(availableTags);
}

const addTagsToTaskInEditMenuListener = document.getElementById('edit-task-available-tags-list');
addTagsToTaskInEditMenuListener.addEventListener('click', clickAddTagToTaskInEditMenuHandler);

function clickAddTagToTaskInEditMenuHandler(e){
    e.preventDefault();

    // Was any add button clicked:
    const addBtn = e.target.closest('.btn-add-tag');
    if(!addBtn) return;

    // Adding the tag to applied tags and removing from available tags:
    const tagId = addBtn.dataset.tagId
    appliedTags.push({
        id:tagId,
        name:getTagNameFromId(tagId),
    });
    availableTags = availableTags.filter(t => t.id !== tagId);

    // re-render the available and applied tags list on edit tags menu.
    renderTagListInEditMenu();
}

const removeTagsFromTaskInEditMenuListener = document.getElementById('edit-task-applied-tags-list');
removeTagsFromTaskInEditMenuListener.addEventListener('click', clickRemoveTagFromTaskInEditMenuHandler);

function clickRemoveTagFromTaskInEditMenuHandler(e) {
    e.preventDefault();

    // Was any add button clicked:
    const removeBtn = e.target.closest('.btn-remove-tag');
    if (!removeBtn) return;

    // Adding the tag to applied tags and removing from available tags:
    const tagId = removeBtn.dataset.tagId;
    availableTags.push({
        id: tagId,
        name: getTagNameFromId(tagId),
    });
    appliedTags = appliedTags.filter(t => t.id !== tagId);

    // re-render the available and applied tags list on edit tags menu.
    renderTagListInEditMenu();
}


function getTagNameFromId(tagId){
    return totalTags.filter(t=> t.id===tagId)[0].name;
}

async function onUpdateBtnClicked(e){
    e.preventDefault();
    // Send update task data to server.
    const taskId = btnUpdate.dataset.taskId;
    console.log(getTagIds())
    const updateResult = await fetch(`/task/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            heading: updateTaskHeading.value,
            detail: updateTaskDetail.value,
            done: updateTaskDone.checked ? 'true' : 'false',
            tags: getTagIds()
        }),
    }).then(res => res.json());

    // give feedback message upon successful update.
    feedback.innerHTML = updateResult.message;
    if(updateResult.status==='ok') feedback.innerHTML+=' Please refresh the page to see the change.';

    // toggle Update and Create button visibility.
    updateBtnInactive();
    location.reload();
}

function getTagIds(){
    // only tagIds needed fiinally for updating tags on a task.
    return appliedTags.map(tag=>tag.id);
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

// 5. TAGS:
// 5.1 Create a new Tag.
// 5.2 Edit a Tag.
// 5.3 Delete a Tag.
// 5.4 Tag Utils required for Tasks.
// 5.5 Apply a tag on Task.
// 5.6 Remove a tag from a Task.

// 5.1 Create a new Tag.
const inputNewTagName = document.getElementById('input-create-new-tag');

const btnCreateNewTag = document.getElementById('create-new-tag-button');
btnCreateNewTag.addEventListener('click',createNewTagHandler);

async function createNewTagHandler(e){
    e.preventDefault();
    if(!inputNewTagName.value) 
        feedback.innerHTML = 'Enter a tag name first!';

    console.log(inputNewTagName.value);
    
    const createNewTagResult = await fetch('/tag',{
        method: 'POST',
        headers:{'Content-Type': 'application/json'},
        body:JSON.stringify({
            name:inputNewTagName.value
        })
    }).then(res=>res.json());

    feedback.innerHTML = createNewTagResult.message;
    if (createNewTagResult.status === 'ok'){
        //feedback.innerHTML += 'Please refresh the page to see the new tag.';
        location.reload();
    }
}

// 5.2 Edit a Tag.
const newTaskTagCollection = document.getElementById('new-task-tags-list');
newTaskTagCollection.addEventListener('click', newTaskTagEditHandler);
const modalEditTag = document.getElementById('modal-update-tag');
document.querySelectorAll('.tag-item .tag-name, .tag-item label').forEach(tag=> tag.addEventListener('click', e=>{
    // If clicked a check box or its label, then select that, and prevent event bubbling.
    e.stopPropagation();
    // This is required as edit button nearby also causes event-bubbling issues, and the checkbox can't be selected then.
}));

async function newTaskTagEditHandler(e) {
    e.preventDefault();

    // If no edit button clicked on a tag, then return:
    const btnEdit = e.target.closest('.btn-edit');
    if(!btnEdit) return;

    const tagParent = btnEdit.closest('.tag-item');
    const tagId = tagParent.dataset.tagId;
    
    // Set the dataset on edit modal.
    modalEditTag.dataset.tagId = tagId;

    // Populate the edit modal from the data of tag where edit button is clicked (tagParent).
    console.log(tagParent.querySelector('.tag-name'));
    modalEditTag.querySelector('#input-update-tag').value = tagParent.querySelector('.tag-name').value;    

    // Open the Edit modal.
    modalEditTag.classList.remove('is-hidden');    
}

const btnConfirmEditTag = document.getElementById('form-btn-confirm-update-tag');
btnConfirmEditTag.addEventListener('click',confirmEditTagHandler);

async function confirmEditTagHandler(e){
    e.preventDefault();
    
    const tagId = modalEditTag.dataset.tagId;
    const tagName = modalEditTag.querySelector('#input-update-tag').value;
    const editTagResponse = await fetch(`/tag/${tagId}`,{
        method:'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: tagName,
        })
    }).then(res=>res.json());
    
    console.log(editTagResponse.message);
    feedback.innerHTML = editTagResponse.message;
    if (editTagResponse.status === 'ok') {
        await location.reload();
    }    
}

const btnCancelUpdateTag = document.getElementById('form-btn-cancel-update-tag');
btnCancelUpdateTag.addEventListener('click',cancelEditTagHandler);

function cancelEditTagHandler(e){
    e.preventDefault();
    // Reset the tag-id dataset on edit modal.
    modalEditTag.dataset.tagId='x';
    // Make modal hidden again:
    modalEditTag.classList.add('is-hidden');
}
// 5.3 Delete a Tag.
const btnDeleteTag = document.getElementById('form-btn-delete-tag');
btnDeleteTag.addEventListener('click', tryDeleteTagClickHandler);

// When delete button pressed on edit tag modal, then delete confirmation prompt shown.
// delete utility modal (commonly used by tasks and tags), can be used for this purpose.
function tryDeleteTagClickHandler(e){
    e.preventDefault();
    setupOnDeleteClicked(confirmDeleteTagClickHandler,cancelDeleteTagClickHandler,false,'Tag will be irreversibly lost. Tag will also disappear from any task which uses it.');
}

async function confirmDeleteTagClickHandler(e) {
    if(e) e.preventDefault();
    // Tagid of the tag to delete.
    const tagId = modalEditTag.dataset.tagId;

    // making AJAX request:
    const deleteTagResponse = await fetch(`/tag/${tagId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    }).then(res => res.json());

    console.log(deleteTagResponse.message);
    feedback.innerHTML = deleteTagResponse.message;
    if (deleteTagResponse.status === 'ok') {
        await location.reload();
    }
}

function cancelDeleteTagClickHandler() {
    setupOnDeleteClicked(confirmDeleteTagClickHandler,cancelDeleteTagClickHandler,true);
}

// 5.4 Tag Utils required for Tasks.
function populateAppliedTags(appliedTags) {
    const ulAppliedTags = document.getElementById(
        'edit-task-applied-tags-list'
    );
    ulAppliedTags.innerHTML = '';
    const tmpAppliedTag = document.getElementById('template-applied-tag');
    appliedTags.forEach(appliedTag => {
        let cloned = tmpAppliedTag.content.cloneNode(true);
        cloned.querySelector('.tag-name').innerHTML = appliedTag.name;
        cloned.querySelector('.btn-remove-tag').dataset.tagId = appliedTag.id;
        ulAppliedTags.appendChild(cloned);
    });
}

function populateAvailableTags(availableTags) {
    const ulAvailableTags = document.getElementById(
        'edit-task-available-tags-list'
    );
    ulAvailableTags.innerHTML = '';
    const tmpAvailableTag = document.getElementById('template-available-tag');
    availableTags.forEach(availableTag => {
        let cloned = tmpAvailableTag.content.cloneNode(true);
        cloned.querySelector('.tag-name').innerHTML = availableTag.name;
        cloned.querySelector('.btn-add-tag').dataset.tagId = availableTag.id;
        ulAvailableTags.appendChild(cloned);
    });
}

function getAllTags() {
    let allTags = [];
    document
        .getElementById('new-task-tags-list')
        .querySelectorAll('.tag-item')
        .forEach(tagItem =>
            allTags.push({
                id: tagItem.dataset.tagId,
                name: tagItem.dataset.tagName,
            })
        );
    return allTags;
}

function getAppliedTags(taskItem) {
    let appliedTags = [];
    taskItem.querySelectorAll('.tag-item').forEach(t =>
        appliedTags.push({
            id: t.dataset.tagId,
            name: t.dataset.tagName,
        })
    );
    return appliedTags;
}

function getAvailableTags(allTags, appliedTags) {
    return appliedTags.filter(tag1 => {
        return !allTags.some(tag2 => {
            return tag1.id === tag2.id;
        });
    });
}