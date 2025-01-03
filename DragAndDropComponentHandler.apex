public class DragAndDropComponentHandler{

    @AuraEnabled
    public static List<Task> getAllTask(){
        Id loggedInUserId = UserInfo.getUserId();
        return[SELECT Id, Owner.Name, Subject, Status, WhoId, WhatId, Who.Name, What.Name, Description FROM Task WHERE OwnerId =: loggedInUserId];
    }
    
    @AuraEnabled
    public static void updateTask(String newTaskId, String newStatus){
        Task updateTask = new Task(Id = newTaskId, Status = newStatus);
        Database.update(updateTask);
    }
}
