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

from Goal.goal_views import GoalViews
from Task.services.task_editor import TaskEditor
from Task.task_views import TaskViews

urlpatterns = [
    path('task/create', TaskViews.create_task, name='create-task'),
    path('task/<str:task_id>', TaskViews.update_task, name='update-task'),
    path('task/<str:task_id>/edit', TaskViews.edit_task, name='edit-task'),
    path('task', TaskViews.task_list, name='task-list'),
    path('calendar/task', TaskViews.calendar_task_list, name='calendar-task-list'),

    path('goal/year', GoalViews.yearly_goal_fetcher, name='yearly-goal-list'),
    path('goal/month', GoalViews.monthly_goal_fetcher, name='monthly-goal-list'),
    path('goal/create', GoalViews.create_goal, name='create-goal'),
    path('goal/<str:goal_id>/edit', GoalViews.edit_yearly_goal, name='update-goal'),
    path('goal/<str:goal_id>/update', GoalViews.update_goal, name='delete-goal'),
    path('goal/<str:goal_id>/delete', GoalViews.delete_goal, name='delete-goal'),
]
