import secrets
import uuid

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


# ── Content hierarchy ─────────────────────────────────────────────────────────

class School(models.Model):
    name       = models.CharField(max_length=200)
    country    = models.CharField(max_length=100, default='MA', blank=True)
    paid_until = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Subject(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='subjects')
    name   = models.CharField(max_length=100)

    class Meta:
        ordering = ['school', 'name']
        unique_together = [('school', 'name')]

    def __str__(self):
        return f'{self.school.name} — {self.name}'


class Unit(models.Model):
    subject         = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='units')
    title           = models.CharField(max_length=200)
    order           = models.PositiveSmallIntegerField(default=0)
    unlock_requires = models.ForeignKey(
        'self', null=True, blank=True,
        on_delete=models.SET_NULL, related_name='unlocks',
    )
    is_free = models.BooleanField(
        default=False,
        help_text='Unit 1-style free sample: accessible without a paid_until date.',
    )

    class Meta:
        ordering = ['subject', 'order']

    def __str__(self):
        return f'{self.subject.name} — Unit {self.order}: {self.title}'


class Lesson(models.Model):
    unit       = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='lessons')
    order      = models.PositiveSmallIntegerField(default=0)
    title      = models.CharField(max_length=200)
    body       = models.TextField()
    audio_text = models.TextField(
        blank=True,
        help_text='What browser TTS reads aloud. Leave blank to use the body text.',
    )

    class Meta:
        ordering = ['unit', 'order']

    def __str__(self):
        return f'{self.unit.title} — Lesson {self.order}: {self.title}'


class ExerciseSet(models.Model):
    class Kind(models.TextChoices):
        MCQ   = 'mcq',   'Multiple choice'
        FILL  = 'fill',  'Fill in the blank'
        SPEAK = 'speak', 'Speaking'
        WRITE = 'write', 'Writing'

    unit  = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='exercise_sets')
    title = models.CharField(max_length=200)
    kind  = models.CharField(max_length=10, choices=Kind.choices, default=Kind.MCQ)

    class Meta:
        ordering = ['unit', 'title']

    def __str__(self):
        return f'{self.unit.title} — {self.get_kind_display()}: {self.title}'


class Question(models.Model):
    class TemplateTag(models.TextChoices):
        SHOOTER     = 'shooter',     'Template A — Correct-choice shooter'
        RUNNER      = 'runner',      'Template B — Two-lane runner'
        CATCH_SOUND = 'catch_sound', 'Template C — Catch the sound'
        DEFEND_LINE = 'defend_line', 'Template D — Defend the line'
        SPEED_QUIZ  = 'speed_quiz',  'Template E — Speed quiz'

    exercise_set   = models.ForeignKey(ExerciseSet, on_delete=models.CASCADE, related_name='questions')
    prompt         = models.CharField(max_length=500)
    sentence       = models.CharField(
        max_length=500, blank=True,
        help_text='Fill-in-the-blank stem; use ___ as the placeholder.',
    )
    audio_prompt   = models.CharField(max_length=500, blank=True)
    correct_answer = models.CharField(max_length=200)
    choices        = models.JSONField(default=list, help_text='Ordered list of answer strings.')
    choice_emojis  = models.JSONField(
        default=list, blank=True,
        help_text='Optional Material Symbol name for each choice (Template A shooter cards). Same length as choices.',
    )
    tip            = models.TextField(blank=True, help_text='Shown to the student after answering.')
    difficulty     = models.PositiveSmallIntegerField(default=1)
    template_tag   = models.CharField(
        max_length=20, choices=TemplateTag.choices, default=TemplateTag.SPEED_QUIZ,
    )

    class Meta:
        ordering = ['exercise_set', 'difficulty', 'id']

    def __str__(self):
        return f'{self.exercise_set.title}: {self.prompt[:60]}'


class Boss(models.Model):
    class Template(models.TextChoices):
        SHOOTER     = 'shooter',     'Template A — Correct-choice shooter'
        RUNNER      = 'runner',      'Template B — Two-lane runner'
        CATCH_SOUND = 'catch_sound', 'Template C — Catch the sound'
        DEFEND_LINE = 'defend_line', 'Template D — Defend the line'
        SPEED_QUIZ  = 'speed_quiz',  'Template E — Speed quiz'

    unit                 = models.OneToOneField(Unit, on_delete=models.CASCADE, related_name='boss')
    name                 = models.CharField(max_length=100)
    template             = models.CharField(max_length=20, choices=Template.choices, default=Template.SPEED_QUIZ)
    floors               = models.PositiveSmallIntegerField(default=1)
    hearts               = models.PositiveSmallIntegerField(default=3)
    seconds_per_question = models.PositiveSmallIntegerField(default=8)

    class Meta:
        verbose_name_plural = 'Bosses'

    def __str__(self):
        return f'{self.name} ({self.unit.title})'


# ── People & progress ─────────────────────────────────────────────────────────

class SchoolMembership(models.Model):
    class Role(models.TextChoices):
        OWNER   = 'OWNER',   'Owner'
        ADMIN   = 'ADMIN',   'Admin'
        TEACHER = 'TEACHER', 'Teacher'

    user   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='school_memberships')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='memberships')
    role   = models.CharField(max_length=10, choices=Role.choices, default=Role.TEACHER)

    class Meta:
        unique_together = [('user', 'school')]

    def __str__(self):
        name = self.user.get_full_name() or self.user.email
        return f'{name} — {self.school.name} ({self.role})'


_JOIN_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # no 0/O or 1/I to avoid confusion


class SchoolClass(models.Model):
    school     = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classes')
    subject    = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='classes')
    teacher    = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name='classes',
    )
    name       = models.CharField(max_length=200)
    join_code  = models.CharField(max_length=10, unique=True, blank=True, editable=False)
    paid_until = models.DateField(
        null=True, blank=True,
        help_text='Per-class billing override. Leave blank to inherit from School.paid_until.',
    )

    class Meta:
        verbose_name_plural = 'School classes'
        ordering = ['school', 'name']

    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = self._unique_join_code()
        super().save(*args, **kwargs)

    @staticmethod
    def _unique_join_code() -> str:
        for _ in range(20):
            code = ''.join(secrets.choice(_JOIN_CODE_ALPHABET) for _ in range(6))
            if not SchoolClass.objects.filter(join_code=code).exists():
                return code
        raise RuntimeError('Could not generate a unique join_code after 20 attempts.')

    def __str__(self):
        return f'{self.school.name} — {self.name} [{self.join_code}]'


class Student(models.Model):
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='students')
    nickname     = models.CharField(max_length=50)
    real_name    = models.CharField(
        max_length=200, blank=True,
        help_text='NEVER expose in student-facing or leaderboard API responses. Teacher/admin views only.',
    )
    # PIN is stored in plain text per ARCHITECTURE.md: "re-entry proof, not real security"
    pin          = models.CharField(max_length=4)
    device_token = models.UUIDField(
        default=uuid.uuid4, unique=True,
        help_text='Rotated on re-authentication from a new device. Client caches locally; '
                  'Student/Progress rows in Postgres are always the source of truth.',
    )

    class Meta:
        ordering = ['school_class', 'nickname']
        unique_together = [('school_class', 'nickname')]

    def __str__(self):
        return f'{self.nickname} ({self.school_class.name})'


class Progress(models.Model):
    student              = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='progress')
    unit                 = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='progress')
    lessons_completed    = models.ManyToManyField(Lesson, blank=True, related_name='completions')
    boss_defeated        = models.BooleanField(default=False)
    golden_boss_defeated = models.BooleanField(
        default=False,
        help_text='Awarded for beating the boss with no mistakes.',
    )
    total_xp = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Progress'
        unique_together = [('student', 'unit')]
        ordering = ['student', 'unit']

    def __str__(self):
        return f'{self.student.nickname} — {self.unit.title}'


class UsageEvent(models.Model):
    student          = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='usage_events')
    event_type       = models.CharField(
        max_length=50,
        help_text='e.g. session_start, lesson_complete, boss_attempt, boss_win, boss_loss',
    )
    device_info      = models.CharField(max_length=200, blank=True, help_text='User-agent or device class string.')
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    timestamp        = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.student.nickname} — {self.event_type} @ {self.timestamp:%Y-%m-%d %H:%M}'
