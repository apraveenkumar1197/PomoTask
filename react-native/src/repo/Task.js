import Base from "../api/Base";

export default class Task {
    /**
     * @param {string | null} filter
     * @param {string[]} tag_names
     * @param {string | null} searchTerm
     */
    static list(filter, tag_names = [], searchTerm = null) {
        return Base.post(`task`, {
            filters: {
                filter: filter,
                tag_names: tag_names,
            },
            search_term: searchTerm,
        });
    }

    static calendarTaskList() {
        return Base.get(`calendar/task`);
    }

    static initData() {
        return Base.get(`task/new`);
    }

    /**
     * @param {string} taskTitle
     * @param {string | null} taskAddToMyDay
     * @param {string | null} taskImportant
     * @param {string | null} taskDueDate
     * @param {string | null} taskFromTime
     * @param {string | null} taskToTime
     * @param {string | null} taskRemindAt
     * @param {string | null} taskNotes
     * @param {string[] | null} taskTags
     * @param {any | null} taskGoal
     */
    static create(
        taskTitle,
        taskAddToMyDay = null,
        taskImportant = null,
        taskDueDate = null,
        taskFromTime = null,
        taskToTime = null,
        taskRemindAt = null,
        taskNotes = null,
        taskTags = null,
        taskGoal = null
    ) {
        return Base.post('task/create', {
            task: Task.formatTaskData(null,
                taskTitle,
                null,
                taskAddToMyDay,
                taskImportant,
                taskDueDate,
                taskFromTime,
                taskToTime,
                taskRemindAt,
                taskNotes,
                taskTags,
                taskGoal)
        });
    }

    static edit(taskId) {
        return Base.get(`task/${taskId}/edit`);
    }

    static delete(taskId) {
        return Task.update(taskId, null, '3');
    }

    /**
     * @param {string} taskId
     * @param {string | null} taskTitle
     * @param {string | null} taskStatus
     * @param {string | null} taskAddToMyDay
     * @param {string | null} taskImportant
     * @param {string | null} taskDueDate
     * @param {string | null} taskFromTime
     * @param {string | null} taskToTime
     * @param {string | null} taskRemindAt
     * @param {string | null} taskNotes
     * @param {string[] | null} taskTags
     * @param {any | null} taskGoal
     * @param {string | null} taskStatusReason
     */
    static update(
        taskId,
        taskTitle,
        taskStatus = null,
        taskAddToMyDay = null,
        taskImportant = null,
        taskDueDate = null,
        taskFromTime = null,
        taskToTime = null,
        taskRemindAt = null,
        taskNotes = null,
        taskTags = null,
        taskGoal = null,
        taskStatusReason = null
    ) {
        let taskData = Task.formatTaskData(taskId,
            taskTitle,
            taskStatus,
            taskAddToMyDay,
            taskImportant,
            taskDueDate,
            taskFromTime,
            taskToTime,
            taskRemindAt,
            taskNotes,
            taskTags,
            taskGoal,
            taskStatusReason);

        return Base.patch(`task/${taskId}`, {
            task: taskData
        });
    }

    /**
     * @param {string | null} taskId
     * @param {string | null} taskTitle
     * @param {string | null} taskStatus
     * @param {string | null} taskAddToMyDay
     * @param {string | null} taskImportant
     * @param {string | null} taskDueDate
     * @param {string | null} taskFromTime
     * @param {string | null} taskToTime
     * @param {string | null} taskRemindAt
     * @param {string | null} taskNotes
     * @param {string[] | null} taskTags
     * @param {any | null} taskGoal
     * @param {string | null} taskStatusReason
     */
    static formatTaskData(taskId,
        taskTitle,
        taskStatus = null,
        taskAddToMyDay = null,
        taskImportant = null,
        taskDueDate = null,
        taskFromTime = null,
        taskToTime = null,
        taskRemindAt = null,
        taskNotes = null,
        taskTags = null,
        taskGoal = null,
        taskStatusReason = null) {
        var taskData = {};

        if (taskTitle != null) taskData['title'] = taskTitle;
        if (taskStatus != null) taskData['status'] = taskStatus;
        if (taskStatusReason != null) taskData['cancellation_reason'] = taskStatusReason;
        if (taskAddToMyDay != null) taskData['add_to_my_day'] = taskAddToMyDay;
        if (taskImportant != null) taskData['important_flag'] = taskImportant;
        if (taskDueDate != null) taskData['due_date'] = taskDueDate;
        if (taskFromTime != null) taskData['from_time'] = taskFromTime;
        if (taskToTime != null) taskData['to_time'] = taskToTime;
        if (taskRemindAt != null) taskData['reminder_date_time'] = taskRemindAt;
        if (taskNotes != null) taskData['notes'] = taskNotes;
        if (taskTags != null) taskData['tags'] = taskTags;
        if (taskGoal != null) {
            if (taskGoal.id !== undefined)
                taskData['goal'] = taskGoal.id;
        }

        return taskData;
    }

    static getTaskTimerStatus(taskId) {
        return Base.get(`task/${taskId}/timing`);
    }
    static taskTimerStatusUpdate(taskId, status) {
        return Base.post(`task/${taskId}/timing/update`, { status });
    }
    static getTaskTimingHistory(taskId) {
        return Base.get(`task/${taskId}/timing/history`);
    }
    static listTags() {
        return Base.get('tag/list');
    }
    static toggleTagHomePageOrder(tagName) {
        return Base.post(`tag/toggle-home-page`, { tag_name: tagName });
    }
    static listTags() {
        return Base.get('tag/list');
    }
}
