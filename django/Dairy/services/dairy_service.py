from datetime import datetime
from Dairy.models.dairy import Dairy
from Task.services.service_response import ServiceResponse


class DairyService:

    @staticmethod
    def get_by_date(date_str):
        try:
            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            entry = Dairy.objects.filter(date=parsed_date).first()
            if entry:
                return ServiceResponse().data(entry.to_dict())
            return ServiceResponse().data({
                'id': None,
                'date': date_str,
                'text': '',
                'created_at': None,
                'updated_at': None,
            })
        except ValueError:
            return ServiceResponse().msg(f'Invalid date format: {date_str}. Expected YYYY-MM-DD.').code(400)
        except Exception as e:
            return ServiceResponse().msg(str(e)).code(500).ex(e)

    @staticmethod
    def save_dairy(date_str, text):
        try:
            if not date_str:
                return ServiceResponse().msg('Date is required.').code(400)

            parsed_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            entry = Dairy.objects.filter(date=parsed_date).first()

            if entry:
                entry.text = text if text is not None else ''
                entry.save()
            else:
                entry = Dairy.objects.create(
                    date=parsed_date,
                    text=text if text is not None else '',
                )

            return ServiceResponse().data(entry.to_dict()).msg('Dairy entry saved successfully.')
        except ValueError:
            return ServiceResponse().msg(f'Invalid date format: {date_str}. Expected YYYY-MM-DD.').code(400)
        except Exception as e:
            return ServiceResponse().msg(str(e)).code(500).ex(e)
