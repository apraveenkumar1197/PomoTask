"""
URL configuration for PomoTask project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path

from General.views import GeneralView
from Goal.goal_views import GoalViews
from Task.activity_views import ActivityViews
from Task.services.task_editor import TaskEditor
from Task.task_views import TaskViews

urlpatterns = [
    path('auth/login', GeneralView.login, name='auth-login'),
    path('dashi/details', GeneralView.dashboard, name='dashi-details'),
    path('task/new', TaskViews.task_init_data, name='task-init-data'),
    path('task/create', TaskViews.create_task, name='create-task'),
    path('task/reorder', TaskViews.reorder_tasks, name='reorder-tasks'),
    path('task/<str:task_id>', TaskViews.update_task, name='update-task'),
    path('task/<str:task_id>/edit', TaskViews.edit_task, name='edit-task'),
    path('task', TaskViews.task_list, name='task-list'),
    path('tag/list', TaskViews.list_tags, name='list-tags'),
    path('tag/toggle-home-page', TaskViews.toggle_tag_home_page, name='toggle-tag-home-page'),

    path('task/<str:task_id>/timing', TaskViews.task_timing, name='get-task-timing'),
    path('task/<str:task_id>/timing/update', TaskViews.create_task_timing, name='update-task-timing'),
    path('task/<str:task_id>/timing/history', TaskViews.task_timing_history, name='task-timing-history'),
    path('calendar/task', TaskViews.calendar_task_list, name='calendar-task-list'),

    path('activity/create', ActivityViews.create_activity, name='create-activity'),
    path('activity/<str:activity_id>', ActivityViews.update_activity, name='update-activity'),

    path('goal/year', GoalViews.yearly_goal_fetcher, name='yearly-goal-list'),
    path('goal/month', GoalViews.monthly_goal_fetcher, name='monthly-goal-list'),
    path('goal/create', GoalViews.create_goal, name='create-goal'),
    path('goal/<str:goal_id>/edit', GoalViews.edit_yearly_goal, name='update-goal'),
    path('goal/<str:goal_id>/update', GoalViews.update_goal, name='delete-goal'),
    path('goal/<str:goal_id>/delete', GoalViews.delete_goal, name='delete-goal'),
]
