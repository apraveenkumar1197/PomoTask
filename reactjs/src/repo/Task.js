import Base from "./Base";
import DateUtil from "../functionalities/DateUtil";

export default class Task {
    static list(filter, tag_names = []) {
        return Base.post(`task`, {
            filters: {
                filter: filter,
                tag_names: tag_names,
            }
        })
    }

    static calendarTaskList() {
        return Base.get(`calendar/task`)
    }

    static create(taskTitle, taskAddToMyDay = null, taskImportant = null, taskDueDate = null, taskFromTime = null, taskToTime = null, taskNotes = null) {
        return Base.post('task/create', {
            task: {
                title: taskTitle,
                add_to_my_day: taskAddToMyDay,
                important_flag: taskImportant,
                due_date: taskDueDate,
                from_time: taskFromTime,
                to_time: taskToTime,
                notes: taskNotes,
            }
        })
    }

    static edit(taskId) {
        return Base.get(`task/${taskId}/edit`)
    }

    static delete(taskId) {
        return Task.update(taskId, null, '3')
    }

    static update(taskId, taskTitle, taskStatus = null, taskAddToMyDay = null, taskImportant = null, taskDueDate = null, taskFromTime = null, taskToTime = null, taskRemindAt = null, taskNotes = null, taskTags = null) {
        var taskData = {}

        if (taskTitle != null) taskData['title'] = taskTitle
        if (taskStatus != null) taskData['status'] = taskStatus
        if (taskAddToMyDay != null) taskData['add_to_my_day'] = taskAddToMyDay
        if (taskImportant != null) taskData['important_flag'] = taskImportant
        if (taskDueDate != null) taskData['due_date'] = taskDueDate
        if (taskFromTime != null) taskData['from_time'] = taskFromTime
        if (taskToTime != null) taskData['to_time'] = taskToTime
        if (taskRemindAt != null) taskData['reminder_date_time'] = taskRemindAt
        if (taskNotes != null) taskData['notes'] = taskNotes
        if (taskTags != null) taskData['tags'] = taskTags

        return Base.patch(`task/${taskId}`, {
            task: taskData
        })
    }
}