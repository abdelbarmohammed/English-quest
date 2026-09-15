from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import (
    Boss, ExerciseSet, Lesson, Progress, Question,
    School, SchoolClass, SchoolMembership, Student, Subject, Unit, UsageEvent,
)

User = get_user_model()


# ── Scoping helpers ───────────────────────────────────────────────────────────

def _membership(request):
    """Returns the SchoolMembership for the logged-in user, or None for superusers."""
    if request.user.is_superuser:
        return None
    try:
        return SchoolMembership.objects.select_related('school').get(user=request.user)
    except SchoolMembership.DoesNotExist:
        return None


def _school_and_role(request):
    """Returns (school, role) tuple. Both None for superusers / unmapped users."""
    m = _membership(request)
    if m is None:
        return None, None
    return m.school, m.role


# ── Base admin class ──────────────────────────────────────────────────────────

class SchoolScopedAdmin(admin.ModelAdmin):
    """
    Restricts every queryset to the requesting user's school.
    Subclasses implement `_school_qs` and may override `_scope_fk_fields`.
    """

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        school, role = _school_and_role(request)
        if school is None:
            return qs                           # superuser sees everything
        return self._school_qs(qs, school, role, request.user)

    def _school_qs(self, qs, school, role, user):
        """Return the queryset filtered to `school` (and optionally to `user`)."""
        raise NotImplementedError

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        school, role = _school_and_role(request)
        if school is not None:
            self._scope_fk_fields(db_field, school, role, request.user, kwargs)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        """Limit FK dropdown choices to school-scoped objects. Override per model."""


# ── Content hierarchy ─────────────────────────────────────────────────────────

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    """Schools are managed only by superusers; teachers/admins cannot add or edit them."""

    list_display  = ('name', 'country', 'paid_until')
    search_fields = ('name',)

    def get_model_perms(self, request):
        if request.user.is_superuser:
            return super().get_model_perms(request)
        return {}   # hidden from sidebar for non-superusers


@admin.register(Subject)
class SubjectAdmin(SchoolScopedAdmin):
    list_display  = ('name', 'school')
    search_fields = ('name', 'school__name')
    list_filter   = ('school',)

    def _school_qs(self, qs, school, role, user):
        return qs.filter(school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'school':
            kwargs['queryset'] = School.objects.filter(pk=school.pk)


class LessonInline(admin.StackedInline):
    model        = Lesson
    extra        = 1
    fields       = ('order', 'title', 'body', 'audio_text')
    show_change_link = True


class ExerciseSetInline(admin.TabularInline):
    model  = ExerciseSet
    extra  = 1
    fields = ('title', 'kind')
    show_change_link = True


class BossInline(admin.StackedInline):
    model   = Boss
    extra   = 0
    max_num = 1
    fields  = ('name', 'template', 'floors', 'hearts', 'seconds_per_question')


@admin.register(Unit)
class UnitAdmin(SchoolScopedAdmin):
    list_display  = ('title', 'subject', 'order', 'is_free')
    list_filter   = ('subject__school', 'subject', 'is_free')
    search_fields = ('title', 'subject__name')
    inlines       = [LessonInline, ExerciseSetInline, BossInline]

    def _school_qs(self, qs, school, role, user):
        return qs.filter(subject__school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'subject':
            kwargs['queryset'] = Subject.objects.filter(school=school)
        elif db_field.name == 'unlock_requires':
            kwargs['queryset'] = Unit.objects.filter(subject__school=school)


@admin.register(Lesson)
class LessonAdmin(SchoolScopedAdmin):
    list_display  = ('title', 'unit', 'order')
    list_filter   = ('unit__subject__school', 'unit__subject')
    search_fields = ('title', 'unit__title')

    def _school_qs(self, qs, school, role, user):
        return qs.filter(unit__subject__school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'unit':
            kwargs['queryset'] = Unit.objects.filter(subject__school=school)


class QuestionInline(admin.StackedInline):
    model  = Question
    extra  = 2
    fields = (
        'prompt', 'sentence', 'audio_prompt',
        'correct_answer', 'choices', 'choice_emojis',
        'template_tag', 'difficulty', 'tip',
    )


@admin.register(ExerciseSet)
class ExerciseSetAdmin(SchoolScopedAdmin):
    list_display  = ('title', 'unit', 'kind')
    list_filter   = ('unit__subject__school', 'kind')
    search_fields = ('title', 'unit__title')
    inlines       = [QuestionInline]

    def _school_qs(self, qs, school, role, user):
        return qs.filter(unit__subject__school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'unit':
            kwargs['queryset'] = Unit.objects.filter(subject__school=school)


@admin.register(Question)
class QuestionAdmin(SchoolScopedAdmin):
    list_display  = ('prompt', 'exercise_set', 'template_tag', 'difficulty', 'correct_answer')
    list_filter   = ('exercise_set__unit__subject__school', 'template_tag', 'difficulty')
    search_fields = ('prompt', 'correct_answer', 'exercise_set__title')

    def _school_qs(self, qs, school, role, user):
        return qs.filter(exercise_set__unit__subject__school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'exercise_set':
            kwargs['queryset'] = ExerciseSet.objects.filter(unit__subject__school=school)


@admin.register(Boss)
class BossAdmin(SchoolScopedAdmin):
    list_display  = ('name', 'unit', 'template', 'floors', 'hearts', 'seconds_per_question')
    list_filter   = ('unit__subject__school', 'template')
    search_fields = ('name', 'unit__title')

    def _school_qs(self, qs, school, role, user):
        return qs.filter(unit__subject__school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'unit':
            kwargs['queryset'] = Unit.objects.filter(subject__school=school)


# ── People & progress ─────────────────────────────────────────────────────────

@admin.register(SchoolMembership)
class SchoolMembershipAdmin(SchoolScopedAdmin):
    list_display  = ('user', 'school', 'role')
    list_filter   = ('school', 'role')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')

    def get_model_perms(self, request):
        if request.user.is_superuser:
            return super().get_model_perms(request)
        _, role = _school_and_role(request)
        if role in (SchoolMembership.Role.OWNER, SchoolMembership.Role.ADMIN):
            return super().get_model_perms(request)
        return {}   # teachers cannot manage memberships

    def _school_qs(self, qs, school, role, user):
        return qs.filter(school=school)

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'school':
            kwargs['queryset'] = School.objects.filter(pk=school.pk)
        elif db_field.name == 'user':
            kwargs['queryset'] = User.objects.filter(school_memberships__school=school)


class StudentInline(admin.TabularInline):
    model           = Student
    extra           = 0
    fields          = ('nickname', 'real_name', 'pin', 'device_token')
    readonly_fields = ('device_token',)
    show_change_link = True


@admin.register(SchoolClass)
class SchoolClassAdmin(SchoolScopedAdmin):
    list_display    = ('name', 'school', 'subject', 'teacher', 'join_code', 'paid_until')
    list_filter     = ('school', 'subject')
    search_fields   = ('name', 'join_code', 'teacher__email', 'teacher__first_name')
    readonly_fields = ('join_code',)
    inlines         = [StudentInline]

    def _school_qs(self, qs, school, role, user):
        qs = qs.filter(school=school)
        if role == SchoolMembership.Role.TEACHER:
            qs = qs.filter(teacher=user)
        return qs

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'school':
            kwargs['queryset'] = School.objects.filter(pk=school.pk)
        elif db_field.name == 'subject':
            kwargs['queryset'] = Subject.objects.filter(school=school)
        elif db_field.name == 'teacher':
            kwargs['queryset'] = User.objects.filter(school_memberships__school=school)


@admin.register(Student)
class StudentAdmin(SchoolScopedAdmin):
    list_display    = ('nickname', 'real_name', 'school_class', 'pin')
    list_filter     = ('school_class__school', 'school_class')
    search_fields   = ('nickname', 'real_name', 'school_class__name')
    readonly_fields = ('device_token',)

    def _school_qs(self, qs, school, role, user):
        qs = qs.filter(school_class__school=school)
        if role == SchoolMembership.Role.TEACHER:
            qs = qs.filter(school_class__teacher=user)
        return qs

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'school_class':
            qs = SchoolClass.objects.filter(school=school)
            if role == SchoolMembership.Role.TEACHER:
                qs = qs.filter(teacher=user)
            kwargs['queryset'] = qs


@admin.register(Progress)
class ProgressAdmin(SchoolScopedAdmin):
    list_display      = ('student', 'unit', 'boss_defeated', 'golden_boss_defeated', 'total_xp')
    list_filter       = ('boss_defeated', 'golden_boss_defeated', 'unit__subject__school')
    search_fields     = ('student__nickname', 'unit__title')
    filter_horizontal = ('lessons_completed',)

    def has_add_permission(self, request):
        return False    # Progress rows are created/updated via API, not hand-entered

    def _school_qs(self, qs, school, role, user):
        qs = qs.filter(student__school_class__school=school)
        if role == SchoolMembership.Role.TEACHER:
            qs = qs.filter(student__school_class__teacher=user)
        return qs

    def _scope_fk_fields(self, db_field, school, role, user, kwargs):
        if db_field.name == 'student':
            qs = Student.objects.filter(school_class__school=school)
            if role == SchoolMembership.Role.TEACHER:
                qs = qs.filter(school_class__teacher=user)
            kwargs['queryset'] = qs
        elif db_field.name == 'unit':
            kwargs['queryset'] = Unit.objects.filter(subject__school=school)


@admin.register(UsageEvent)
class UsageEventAdmin(SchoolScopedAdmin):
    list_display   = ('student', 'event_type', 'duration_seconds', 'device_info', 'timestamp')
    list_filter    = ('event_type', 'student__school_class__school')
    search_fields  = ('student__nickname', 'event_type')
    date_hierarchy = 'timestamp'

    # Events are immutable log entries — no creation or editing via admin
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser

    def _school_qs(self, qs, school, role, user):
        qs = qs.filter(student__school_class__school=school)
        if role == SchoolMembership.Role.TEACHER:
            qs = qs.filter(student__school_class__teacher=user)
        return qs
