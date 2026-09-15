from rest_framework import serializers

from .models import Boss, ExerciseSet, Lesson, Progress, Question, Unit


# ── Request / input serializers ───────────────────────────────────────────────

class JoinClassSerializer(serializers.Serializer):
    join_code = serializers.CharField(max_length=10)
    nickname  = serializers.CharField(max_length=50)
    pin       = serializers.CharField(min_length=4, max_length=4)

    def validate_pin(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('PIN must be exactly 4 digits.')
        return value

    def validate_nickname(self, value):
        stripped = value.strip()
        if not stripped:
            raise serializers.ValidationError('Nickname cannot be blank.')
        return stripped


class LessonCompleteSerializer(serializers.Serializer):
    student_id = serializers.IntegerField()
    lesson_id  = serializers.IntegerField()


class BossResultSerializer(serializers.Serializer):
    student_id  = serializers.IntegerField()
    unit_id     = serializers.IntegerField()
    xp          = serializers.IntegerField(min_value=0)
    hearts_left = serializers.IntegerField(min_value=0)
    won         = serializers.BooleanField()


class UsageEventSerializer(serializers.Serializer):
    event_type       = serializers.CharField(max_length=50)
    device_info      = serializers.CharField(max_length=200, required=False, allow_blank=True, default='')
    duration_seconds = serializers.IntegerField(min_value=0, required=False, allow_null=True, default=None)


# ── Response / output serializers ─────────────────────────────────────────────

class BossConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Boss
        fields = ['id', 'name', 'template', 'floors', 'hearts', 'seconds_per_question']


class UnitSerializer(serializers.ModelSerializer):
    """Lightweight unit listing — locked state derived from student's progress_map in context."""

    is_locked = serializers.SerializerMethodField()
    boss      = BossConfigSerializer(read_only=True)

    class Meta:
        model  = Unit
        fields = ['id', 'title', 'order', 'is_free', 'unlock_requires_id', 'is_locked', 'boss']

    def get_is_locked(self, unit):
        if unit.unlock_requires_id is None:
            return False
        progress_map = self.context.get('progress_map', {})
        prereq = progress_map.get(unit.unlock_requires_id)
        # Locked if there's no progress row for the prerequisite or boss isn't defeated yet
        return prereq is None or not prereq.boss_defeated


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Lesson
        fields = ['id', 'order', 'title', 'body', 'audio_text']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Question
        fields = [
            'id', 'prompt', 'sentence', 'audio_prompt',
            'correct_answer', 'choices', 'choice_emojis',
            'tip', 'difficulty', 'template_tag',
        ]


class ExerciseSetSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model  = ExerciseSet
        fields = ['id', 'title', 'kind', 'questions']


class LeaderboardEntrySerializer(serializers.Serializer):
    """One row in the class leaderboard. Nickname only — real_name is never included."""
    rank         = serializers.IntegerField()
    nickname     = serializers.CharField()
    total_xp     = serializers.IntegerField()
    boss_defeats = serializers.IntegerField()
    is_me        = serializers.BooleanField()


class UnitWithProgressSerializer(serializers.ModelSerializer):
    """
    Full unit representation used by GET /api/progress/<student_id>/.
    Includes locked state and per-unit progress.
    Context must contain:
      progress_map:     {unit_id -> Progress}  (Progress rows prefetch_related lessons_completed)
      lesson_count_map: {unit_id -> int}
    """

    is_locked = serializers.SerializerMethodField()
    boss      = BossConfigSerializer(read_only=True)
    progress  = serializers.SerializerMethodField()

    class Meta:
        model  = Unit
        fields = ['id', 'title', 'order', 'is_free', 'unlock_requires_id',
                  'is_locked', 'boss', 'progress']

    def get_is_locked(self, unit):
        if unit.unlock_requires_id is None:
            return False
        progress_map = self.context.get('progress_map', {})
        prereq = progress_map.get(unit.unlock_requires_id)
        return prereq is None or not prereq.boss_defeated

    def get_progress(self, unit):
        progress_map     = self.context.get('progress_map', {})
        lesson_count_map = self.context.get('lesson_count_map', {})
        total_lessons    = lesson_count_map.get(unit.id, 0)
        prog             = progress_map.get(unit.id)

        if prog is None:
            return {
                'lessons_completed':      [],
                'lessons_completed_count': 0,
                'total_lessons':          total_lessons,
                'boss_defeated':          False,
                'golden_boss_defeated':   False,
                'total_xp':               0,
            }

        # Use .all() so Django serves results from the prefetch cache (no extra query)
        completed_ids = sorted(l.id for l in prog.lessons_completed.all())
        return {
            'lessons_completed':      completed_ids,
            'lessons_completed_count': len(completed_ids),
            'total_lessons':          total_lessons,
            'boss_defeated':          prog.boss_defeated,
            'golden_boss_defeated':   prog.golden_boss_defeated,
            'total_xp':               prog.total_xp,
        }
