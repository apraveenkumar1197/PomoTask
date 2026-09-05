import os
import subprocess
import tempfile
from datetime import datetime

import dropbox
from decouple import config
from dropbox.exceptions import ApiError, AuthError
from django.core.management import BaseCommand

DROPBOX_FOLDER = '/DB Backups/Pomotask'
CHUNK_SIZE = 8 * 1024 * 1024  # 8MB, matches Dropbox's chunked-upload threshold


class Command(BaseCommand):
    help = 'Dumps the MongoDB database via mongodump and uploads the archive to Dropbox'

    def handle(self, *args, **options):
        access_token = os.environ.get('DROPBOX_ACCESS_TOKEN')
        if not access_token:
            self.stdout.write('DROPBOX_ACCESS_TOKEN is not set, skipping backup.')
            return

        archive_path = self._dump_database()
        if archive_path is None:
            return

        try:
            self._upload_to_dropbox(archive_path, access_token)
        finally:
            os.remove(archive_path)

    def _dump_database(self):
        db_host = config('DB_HOST', default='localhost')
        db_name = config('DB_NAME', default='pomotask')
        db_user = config('DB_USER', default=None)
        db_password = config('DB_PASSWORD', default=None)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        archive_path = os.path.join(tempfile.gettempdir(), f'pomotask_{timestamp}.archive')

        # This mongodump build's argument parser requires --flag=value syntax;
        # space-separated --flag value breaks it (misparses a later argument
        # as a stray positional "connection string" argument) — verified
        # directly, don't revert to space-separated form.
        cmd = [
            'mongodump',
            f'--host={db_host}', '--port=27017',
            f'--db={db_name}',
            f'--archive={archive_path}',
        ]
        if db_user and db_password:
            cmd += [
                f'--username={db_user}',
                f'--password={db_password}',
                '--authenticationDatabase=admin',
                '--authenticationMechanism=SCRAM-SHA-1',
            ]

        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            self.stderr.write(f'mongodump failed: {result.stderr}')
            return None

        if not os.path.exists(archive_path) or os.path.getsize(archive_path) == 0:
            self.stderr.write('mongodump produced an empty file, aborting upload.')
            return None

        return archive_path

    def _upload_to_dropbox(self, file_path, access_token):
        dbx = dropbox.Dropbox(access_token)
        try:
            dbx.users_get_current_account()
        except AuthError:
            self.stderr.write('Invalid or expired DROPBOX_ACCESS_TOKEN.')
            return

        file_name = os.path.basename(file_path)
        dest_path = f"{DROPBOX_FOLDER}/{file_name}"
        file_size = os.path.getsize(file_path)

        with open(file_path, 'rb') as f:
            try:
                if file_size <= CHUNK_SIZE:
                    meta = dbx.files_upload(f.read(), dest_path, mode=dropbox.files.WriteMode.overwrite)
                else:
                    session_start = dbx.files_upload_session_start(f.read(CHUNK_SIZE))
                    cursor = dropbox.files.UploadSessionCursor(session_id=session_start.session_id, offset=f.tell())
                    commit = dropbox.files.CommitInfo(path=dest_path, mode=dropbox.files.WriteMode.overwrite)
                    while f.tell() < file_size:
                        remaining = file_size - f.tell()
                        if remaining <= CHUNK_SIZE:
                            meta = dbx.files_upload_session_finish(f.read(CHUNK_SIZE), cursor, commit)
                        else:
                            dbx.files_upload_session_append_v2(f.read(CHUNK_SIZE), cursor)
                            cursor.offset = f.tell()
            except ApiError as e:
                self.stderr.write(f'Dropbox upload failed: {e}')
                return

        self.stdout.write(f'Uploaded to Dropbox: {meta.path_display}')
