import Base from "./Base";

export default class Goal {
    static GOAL_TYPE_YEAR = '0'
    static GOAL_TYPE_MONTH = '1'
    static GOAL_TYPE_WEEK = '2'

    static listByYear(year, isMini = false) {
        return Base.get(`goal/year?year=${year}&mini=${isMini ? 'Y' : 'N'}`)
    }

    static listByYearAndMonth(year, month) {
        return Base.get(`goal/month?year=${year}&month=${month}`)
    }

    static createYearlyGoal(title, year, months) {
        return Goal.createGoal({
            title: title,
            year: year,
            months: months,
            type: Goal.GOAL_TYPE_YEAR,
        })
    }

    static createMonthlyGoal(year, month, title, linkedGoals) {
        return Goal.createGoal({
            title: title,
            linked_goals: linkedGoals,
            year: year,
            month: month,
            type: Goal.GOAL_TYPE_MONTH,
        })
    }

    static editGoal(goalId) {
        return Base.get(`goal/${goalId}/edit`)
    }

    static updateYearlyGoal(goalId, title, year, months) {
        return Goal.updateGoal(goalId, {
            title: title,
            year: year,
            months: months,
            type: Goal.GOAL_TYPE_YEAR,
        })
    }

    static updateMonthlyGoal(goalId, year, month, title, linkedGoals) {
        return Goal.updateGoal(goalId, {
            title: title,
            linked_goals: linkedGoals,
            year: year,
            month: month,
            type: Goal.GOAL_TYPE_MONTH,
        })
    }

    static updateYearlyGoalStatus(goalId, status) {
        return Goal.updateGoal(goalId, {
            status: status,
        })
    }

    static createGoal(body) {
        return Base.post(`goal/create`, {goal: body})
    }

    static updateGoal(goalId, body) {
        return Base.patch(`goal/${goalId}/update`, {goal: body})
    }

    static deleteGoal(goalId) {
        return Base.delete(`goal/${goalId}/delete`)
    }
}