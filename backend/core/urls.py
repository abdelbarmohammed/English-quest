from django.urls import path

from .views import (
    BossResultView,
    JoinClassView,
    LeaderboardView,
    LessonCompleteView,
    StudentProgressView,
    UnitExerciseSetListView,
    UnitLessonListView,
    UnitListView,
    UsageEventCreateView,
)

urlpatterns = [
    # Auth
    path('classes/join/',                  JoinClassView.as_view()),

    # Content
    path('units/',                         UnitListView.as_view()),
    path('units/<int:pk>/lessons/',        UnitLessonListView.as_view()),
    path('units/<int:pk>/exercise-sets/',  UnitExerciseSetListView.as_view()),

    # Progress
    path('progress/lesson-complete/',      LessonCompleteView.as_view()),
    path('progress/boss-result/',          BossResultView.as_view()),
    path('progress/<int:student_id>/',     StudentProgressView.as_view()),

    # Social / leaderboard
    path('leaderboard/',                   LeaderboardView.as_view()),

    # Analytics
    path('events/',                        UsageEventCreateView.as_view()),
]
