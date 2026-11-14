from django.db import migrations, models
from Points.models import new_id


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name='PointItem',
            fields=[
                ('id', models.CharField(default=new_id, editable=False, max_length=24, primary_key=True, serialize=False)),
                ('revisions', models.JSONField(default=list)),
            ],
        ),
        migrations.CreateModel(
            name='PointOccurrence',
            fields=[
                ('id', models.CharField(max_length=24, primary_key=True, serialize=False)),
                ('item_id', models.CharField(db_index=True, max_length=24)),
                ('period_start', models.CharField(max_length=10)),
                ('period_end', models.CharField(max_length=10)),
                ('achieved', models.BooleanField(default=False)),
                ('task_defaults', models.JSONField(default=dict)),
            ],
        ),
    ]
