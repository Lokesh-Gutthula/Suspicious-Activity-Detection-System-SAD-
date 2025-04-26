from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

# Initialize admin instance (without app for now)
admin = Admin(name='Admin Panel', template_mode='bootstrap4')

# Custom Model Views


class UserAdmin(ModelView):
    column_list = ('id', 'username', 'email',
                   'phone_no', 'picture', 'address')
    column_searchable_list = ('username', 'email', 'phone_no')
    column_filters = ('username', 'email', 'phone_no')
    form_columns = ["videos"]
    form_excluded_columns = ('detections', )
    can_export = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, endpoint='admin_user', url='/admin/user', **kwargs)


class VideoAdmin(ModelView):
    column_list = ('id', 'filename', 'upload_time')
    column_searchable_list = ('filename', )
    column_filters = ('upload_time', 'user_id')
    can_export = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, endpoint='admin_video', url='/admin/video', **kwargs)


class DetectedFrameAdmin(ModelView):
    column_list = ('id', 'image_url', 'labels',
                   'confidence_score', 'timestamp')
    column_filters = ('labels', 'confidence_score', 'timestamp')
    can_export = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, endpoint='admin_detected_frame',
                         url='/admin/detected_frame', **kwargs)


class LiveStreamAdmin(ModelView):
    column_list = ('id', 'stream_name', 'stream_url',
                   'is_active', 'created_at')
    can_export = True

    def __init__(self, *args, **kwargs):
        super().__init__(*args, endpoint='admin_live_stream',
                         url='/admin/live_stream', **kwargs)
