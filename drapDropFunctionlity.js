import { LightningElement, track, wire } from 'lwc';
import taskData from '@salesforce/apex/DragAndDropComponentHandler.getAllTask';
import updateTask from '@salesforce/apex/DragAndDropComponentHandler.updateTask';

export default class DragAndDropComponent extends LightningElement {
    @track taskNewList = [];
    @track taskInProgressList = [];
    @track taskCompletedList = [];
    @track dropTaskId;

    connectedCallback() {
        this.getTaskData();
    }

    getTaskData() {
        taskData().then(result => {
            let taskNewData = [];
            let taskInProgressData = [];
            let taskCompletedData = [];
            for (let i = 0; i < result.length; i++) {
                let task = new Object();
                task.Id = result[i].Id;
                task.Subject = result[i].Subject;
                task.Status = result[i].Status;
                task.Description = result[i].Description;
                task.WhatId = '/'+result[i].WhatId;
                if (result[i].WhatId !== undefined) {
                    task.OpportunityName = result[i].What.Name; // Opportunity Name
                }
                // Determine task status and categorize it
                if (task.Status === 'Not Started') {
                    taskNewData.push(task);
                } else if (task.Status !== 'Not Started' && task.Status !== 'Completed') {
                    taskInProgressData.push(task);
                } else if (task.Status === 'Completed') {
                    taskCompletedData.push(task);
                }
            }
            // Update lists based on task status
            this.taskNewList = taskNewData;
            this.taskInProgressList = taskInProgressData;
            this.taskCompletedList = taskCompletedData;
        }).catch(error => {
            window.alert('$$$Test1:' + error);
        })
    }

    taskDragStart(event) {
        const taskId = event.target.id.substr(0, 18);
        this.dropTaskId = taskId;
        let draggableElement = this.template.querySelector('[data-id="' + taskId + '"]');
        draggableElement.classList.add('drag');
        this.handleTaskDrag(taskId);
    }

    taskDragEnd(event) {
        const taskId = event.target.id.substr(0, 18);
        let draggableElement = this.template.querySelector('[data-id="' + taskId + '"]');
        draggableElement.classList.remove('drag');
    }

    handleDrop(event) {
        this.cancel(event);
        console.log('Drop Target ID:', event.currentTarget.id); 
        const columnUsed = event.target.id;
        let taskNewStatus;
        if (columnUsed.includes('InProgress')) {
            taskNewStatus = 'In Progress';
        } else if (columnUsed.includes('newTask')) {
            taskNewStatus = 'Not Started';
        } else if (columnUsed.includes('completed')) {
            taskNewStatus = 'Completed';
        }
        this.updateTaskStatus(this.dropTaskId, taskNewStatus);
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        draggableElement.classList.remove('over');
    }

    handleDragEnter(event) {
        this.cancel(event);
    }

    handleDragOver(event) {
        this.cancel(event);
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        draggableElement.classList.add('over');
    }

    handleDragLeave(event) {
        this.cancel(event);
        let draggableElement = this.template.querySelector('[data-role="drop-target"]');
        draggableElement.classList.remove('over');
    }

    handleTaskDrag(taskId) {
        console.log('$$$Test: ' + taskId);
    }

    updateTaskStatus(taskId, taskNewStatus) {
        console.log('taskId:::>>>>', taskId);
        console.log('taskNewStatus:::>>>>', taskNewStatus);
        updateTask({newTaskId: taskId, newStatus: taskNewStatus}).then(result => {
            this.getTaskData();
            console.log('getTaskData::>>', getTaskData);
        }).catch(error => {
            window.alert('$$$Test2:' + JSON.stringify(error));
        })
    }

    cancel(event) {
        if (event.stopPropagation) event.stopPropagation();
        if (event.preventDefault) event.preventDefault();
        return false;
    };
}
