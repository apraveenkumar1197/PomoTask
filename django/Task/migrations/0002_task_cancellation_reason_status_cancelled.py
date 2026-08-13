from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Task', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='cancellation_reason',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.IntegerField(choices=[('0', 'ToDo'), ('1', 'Done'), ('2', 'In Progress'), ('3', 'Deleted'), ('4', 'Cancelled')], default='0'),
        ),
    ]
