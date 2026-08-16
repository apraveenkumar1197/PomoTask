from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Task', '0002_task_cancellation_reason_status_cancelled'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='view_order',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
