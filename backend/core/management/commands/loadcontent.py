"""
Loads a complete demo unit (The Passive Voice) so the app can be tested end-to-end.

Usage:
    python manage.py loadcontent            # idempotent — safe to re-run
    python manage.py loadcontent --clear    # wipes existing demo data first
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rich.console import Console

from core.models import Boss, ExerciseSet, Lesson, Question, School, SchoolClass, Student, Subject, Unit

_console = Console(highlight=False)

User = get_user_model()

# ── Lesson content ─────────────────────────────────────────────────────────────

L1_TITLE = "What is the Passive Voice?"
L1_BODY  = """\
<p>In English, we can describe the same event in two ways, depending on what we want to emphasise.</p>

<p>The <strong>Active Voice</strong> puts the focus on the <em>doer</em> of the action:</p>
<blockquote>"The teacher <strong>explains</strong> the lesson every day."</blockquote>

<p>The <strong>Passive Voice</strong> shifts the focus to the <em>receiver</em>:</p>
<blockquote>"The lesson <strong>is explained</strong> by the teacher every day."</blockquote>

<h3>When do we use the Passive Voice?</h3>
<ul>
  <li>When the <strong>doer is unknown</strong>: <em>"The phone was stolen."</em></li>
  <li>When the <strong>doer is unimportant</strong>: <em>"A new road is being built."</em></li>
  <li>In <strong>formal or scientific writing</strong>: <em>"The experiment was conducted carefully."</em></li>
</ul>

<p>If you want to mention the doer, add <strong>by + agent</strong>. If the doer is unknown or obvious, you can leave it out.</p>"""

L1_AUDIO = (
    "In English, we can describe the same event in two ways. "
    "The active voice puts the focus on the doer of the action. "
    "For example: the teacher explains the lesson every day. "
    "The passive voice shifts the focus to the receiver of the action. "
    "For example: the lesson is explained by the teacher every day. "
    "We use the passive when the doer is unknown, unimportant, "
    "or when we want to write more formally."
)

L2_TITLE = "Forming the Passive Voice"
L2_BODY  = """\
<p>The passive voice follows one simple formula:</p>
<blockquote><strong>Subject + [to be — correct tense] + Past Participle (V3)</strong></blockquote>

<h3>Common Tenses</h3>
<ul>
  <li><strong>Present Simple</strong> — is / are + V3<br/>
      <em>"Letters <strong>are delivered</strong> every morning."</em></li>
  <li><strong>Past Simple</strong> — was / were + V3<br/>
      <em>"The letter <strong>was delivered</strong> yesterday."</em></li>
  <li><strong>Future Simple</strong> — will be + V3<br/>
      <em>"The results <strong>will be announced</strong> next week."</em></li>
</ul>

<h3>Key Irregular Past Participles</h3>
<ul>
  <li>write → <strong>written</strong></li>
  <li>build → <strong>built</strong></li>
  <li>choose → <strong>chosen</strong></li>
  <li>speak → <strong>spoken</strong></li>
  <li>break → <strong>broken</strong></li>
  <li>make → <strong>made</strong></li>
</ul>

<p>The past participle (V3) never changes — only the form of <strong>to be</strong> changes to match the tense and subject.</p>"""

L2_AUDIO = (
    "The passive voice follows one simple formula: "
    "subject, plus the correct form of to be, plus the past participle, also called V3. "
    "In the present simple, use is or are followed by the past participle. "
    "For example: letters are delivered every morning. "
    "In the past simple, use was or were. For example: the letter was delivered yesterday. "
    "In the future simple, use will be. For example: the results will be announced next week. "
    "Remember: the past participle never changes — only to be changes."
)

# ── Questions ──────────────────────────────────────────────────────────────────

SPEED_QUIZ_QS = [
    dict(
        prompt='Choose the correct passive form:',
        sentence='The window ___ broken last night.',
        choices=['is', 'was', 'will be', 'has'],
        correct_answer='was',
        tip='Past simple passive: was/were + past participle.',
        difficulty=1,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='English ___ spoken all over the world.',
        choices=['is', 'are', 'was', 'were'],
        correct_answer='is',
        tip='Present simple passive: is/are + past participle.',
        difficulty=1,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='The new hospital ___ built next year.',
        choices=['is', 'was', 'will be', 'were'],
        correct_answer='will be',
        tip='Future simple passive: will be + past participle.',
        difficulty=1,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='Two students ___ chosen for the competition.',
        choices=['was', 'is', 'will be', 'were'],
        correct_answer='were',
        tip='Past passive with a plural subject uses were.',
        difficulty=2,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='This book ___ written by a famous Moroccan author.',
        choices=['is', 'was', 'will be', 'are'],
        correct_answer='was',
        tip='Past simple passive: was + written.',
        difficulty=2,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='The injured player ___ taken to hospital.',
        choices=['is', 'was', 'will be', 'are'],
        correct_answer='was',
        tip='Past simple passive: was + taken (irregular V3).',
        difficulty=2,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='New trees ___ planted in the city every year.',
        choices=['is', 'was', 'are', 'were'],
        correct_answer='are',
        tip='Present simple passive: are + planted (plural subject).',
        difficulty=2,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='The exam results ___ announced online tomorrow.',
        choices=['were', 'are', 'will be', 'is'],
        correct_answer='will be',
        tip='Future passive: will be + announced.',
        difficulty=3,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='The homework ___ not finished by all the students.',
        choices=['is', 'was', 'will be', 'were'],
        correct_answer='was',
        tip='Singular subject with past negative: was not + finished.',
        difficulty=3,
        template_tag='speed_quiz',
    ),
    dict(
        prompt='Choose the correct passive form:',
        sentence='A prize ___ given to the best student each year.',
        choices=['was', 'were', 'will', 'is'],
        correct_answer='is',
        tip='Present simple passive: is + given (habitual action).',
        difficulty=3,
        template_tag='speed_quiz',
    ),
]

SHOOTER_QS = [
    dict(
        prompt='Tap the passive sentence.',
        choices=['She wrote the letter.', 'The letter was written.', 'Writing the letter.'],
        correct_answer='The letter was written.',
        choice_emojis=['edit', 'mail', 'article'],
        tip='Passive: subject + was/were + V3.',
        difficulty=1,
        template_tag='shooter',
    ),
    dict(
        prompt="Tap the past participle of 'break'.",
        choices=['Break', 'Broke', 'Broken'],
        correct_answer='Broken',
        choice_emojis=['hardware', 'flash_on', 'window'],
        tip="Irregular: break → broke → broken.",
        difficulty=1,
        template_tag='shooter',
    ),
    dict(
        prompt='Tap the passive sentence.',
        choices=['They built the bridge.', 'The bridge was built.', 'Building bridges.'],
        correct_answer='The bridge was built.',
        choice_emojis=['construction', 'architecture', 'build'],
        tip='Passive: subject + was + built (irregular V3).',
        difficulty=2,
        template_tag='shooter',
    ),
    dict(
        prompt="Tap the past participle of 'speak'.",
        choices=['Spoke', 'Speaking', 'Spoken'],
        correct_answer='Spoken',
        choice_emojis=['chat', 'mic', 'campaign'],
        tip="Irregular: speak → spoke → spoken.",
        difficulty=2,
        template_tag='shooter',
    ),
    dict(
        prompt='Tap the passive sentence.',
        choices=['Our teacher explains grammar.', 'Grammar is explained here.', 'Explaining grammar.'],
        correct_answer='Grammar is explained here.',
        choice_emojis=['school', 'menu_book', 'draw'],
        tip='Present passive: is + explained.',
        difficulty=2,
        template_tag='shooter',
    ),
    dict(
        prompt="Tap the correct 'to be' for Past Passive.",
        choices=['is / are', 'was / were', 'will be'],
        correct_answer='was / were',
        choice_emojis=['hourglass_empty', 'hourglass_bottom', 'auto_awesome'],
        tip='Past passive uses was (singular) or were (plural).',
        difficulty=3,
        template_tag='shooter',
    ),
]


class Command(BaseCommand):
    help = 'Load the demo English unit (The Passive Voice) with lessons, questions and a boss.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Delete existing demo content before reloading.',
        )

    def handle(self, *args, **options):
        if options['clear']:
            School.objects.filter(name='Demo School').delete()
            self.stdout.write(self.style.WARNING('Cleared existing demo content.'))

        # ── School & subject ───────────────────────────────────────────────────
        school, _ = School.objects.get_or_create(
            name='Demo School',
            defaults={'country': 'MA'},
        )
        subject, _ = Subject.objects.get_or_create(
            school=school,
            name='English',
        )

        # ── Unit ──────────────────────────────────────────────────────────────
        unit, _ = Unit.objects.get_or_create(
            subject=subject,
            order=1,
            defaults={
                'title':   'The Passive Voice',
                'is_free': True,
            },
        )

        # ── Lessons ───────────────────────────────────────────────────────────
        l1, _ = Lesson.objects.get_or_create(
            unit=unit,
            order=1,
            defaults={
                'title':      L1_TITLE,
                'body':       L1_BODY,
                'audio_text': L1_AUDIO,
            },
        )
        l2, _ = Lesson.objects.get_or_create(
            unit=unit,
            order=2,
            defaults={
                'title':      L2_TITLE,
                'body':       L2_BODY,
                'audio_text': L2_AUDIO,
            },
        )

        # ── Exercise sets ─────────────────────────────────────────────────────
        eq_set, _ = ExerciseSet.objects.get_or_create(
            unit=unit,
            title='Passive Voice — Boss Questions',
            defaults={'kind': ExerciseSet.Kind.MCQ},
        )

        ex_set, _ = ExerciseSet.objects.get_or_create(
            unit=unit,
            title='Passive Voice — Practice Shooter',
            defaults={'kind': ExerciseSet.Kind.MCQ},
        )

        # ── Questions (skip if already populated) ─────────────────────────────
        if not eq_set.questions.exists():
            for q in SPEED_QUIZ_QS:
                Question.objects.create(exercise_set=eq_set, **q)
            self.stdout.write(f'  Created {len(SPEED_QUIZ_QS)} speed-quiz questions.')
        else:
            self.stdout.write('  Speed-quiz questions already exist — skipped.')

        if not ex_set.questions.exists():
            for q in SHOOTER_QS:
                Question.objects.create(exercise_set=ex_set, **q)
            self.stdout.write(f'  Created {len(SHOOTER_QS)} shooter questions.')
        else:
            self.stdout.write('  Shooter questions already exist — skipped.')

        # ── Boss ──────────────────────────────────────────────────────────────
        boss, created = Boss.objects.get_or_create(
            unit=unit,
            defaults={
                'name':                 'Grammar Golem',
                'template':             'speed_quiz',
                'floors':               1,
                'hearts':               3,
                'seconds_per_question': 10,
            },
        )
        if created:
            self.stdout.write('  Created boss: Grammar Golem.')

        # ── School class (needs a teacher — uses first superuser if available) ─
        # join_code is forced to TEST01 on first creation and pinned thereafter
        # so the code never changes between loadcontent runs. The model's save()
        # auto-generates a random code only when join_code is blank; we bypass
        # that by writing directly via update() after get_or_create.
        superuser = User.objects.filter(is_superuser=True).first()
        sc, sc_created = SchoolClass.objects.get_or_create(
            school=school,
            subject=subject,
            name='English Class 2A',
            defaults={'teacher': superuser, 'paid_until': None},
        )
        if sc_created:
            SchoolClass.objects.filter(pk=sc.pk).update(join_code='TEST01')
            sc.join_code = 'TEST01'

        # ── Fixed test student ────────────────────────────────────────────────
        test_student, ts_created = Student.objects.get_or_create(
            school_class=sc,
            nickname='TestHero',
            defaults={'pin': '1234'},
        )
        if ts_created:
            self.stdout.write('  Created test student: TestHero / PIN 1234.')

        # ── Summary ───────────────────────────────────────────────────────────
        _console.print('')
        _console.print(f'[bold green]{"━" * 50}[/bold green]')
        _console.print('[bold green]  Demo content loaded successfully[/bold green]')
        _console.print(f'[bold green]{"━" * 50}[/bold green]')
        _console.print(f'   School:       {school.name}')
        _console.print(f'   Subject:      {subject.name}')
        _console.print(f'   Unit:         {unit.title}')
        _console.print(f'   Lessons:      {l1.title!r}, {l2.title!r}')
        _console.print(f'   Boss:         {boss.name}')
        _console.print(f'   Class:        {sc.name}')
        _console.print(f'[green]   Join code:    {sc.join_code}[/green]')
        _console.print('   Test student: TestHero / PIN 1234')
        if not superuser:
            _console.print(
                '\n[bold yellow]WARNING[/bold yellow] No superuser found. '
                'Run [bold]python manage.py createsuperuser[/bold] and then '
                'assign them as teacher in Django admin → School Classes.',
            )
        _console.print('')
        _console.print('   Students can join with:')
        _console.print(f'     Class code : {sc.join_code}')
        _console.print('     Nickname   : TestHero  (or any new nickname)')
        _console.print('     PIN        : 1234      (or any 4 digits for a new student)')
