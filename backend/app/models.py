from app.database import db
from sqlalchemy import CheckConstraint, Index


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(80), unique=True, nullable=False)

    email = db.Column(db.String(120), unique=True, nullable=False)

    password = db.Column(db.String(200), nullable=False)

    phone_no = db.Column(db.String(10), nullable=False, unique=True)

    picture = db.Column(db.String(255), nullable=True)

    address = db.Column(db.Text, nullable=True)

    videos = db.relationship(
        'Video', back_populates='user', cascade='all, delete')
    detections = db.relationship(
        'DetectedFrame', back_populates='user', cascade='all, delete')

    __table_args__ = (
        CheckConstraint(
            "length(phone_no) = 10 AND phone_no REGEXP '^[0-9]+$'", name='check_phone_no_10_digits'),
        CheckConstraint("length(password) >= 10",
                        name='check_password_min_length'),
        CheckConstraint("email LIKE '%@gmail.com'", name='check_email_format'),
    )


class Video(db.Model):
    __tablename__ = 'videos'

    id = db.Column(db.Integer, primary_key=True)

    filename = db.Column(db.String(255), nullable=False)

    upload_time = db.Column(db.DateTime, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), nullable=False, index=True)
    user = db.relationship('User', back_populates='videos')

    detections = db.relationship(
        'DetectedFrame', back_populates='video', cascade='all, delete')


class DetectedFrame(db.Model):
    __tablename__ = 'detected_frames'

    id = db.Column(db.Integer, primary_key=True)

    image_url = db.Column(db.String(255), nullable=False)

    labels = db.Column(db.String(255), nullable=False)

    confidence_score = db.Column(db.Float, nullable=False)

    timestamp = db.Column(db.String(50), nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), nullable=False, index=True)
    user = db.relationship('User', back_populates='detections')

    video_id = db.Column(db.Integer, db.ForeignKey(
        'videos.id'), nullable=False, index=True)
    video = db.relationship('Video', back_populates='detections')

    __table_args__ = (
        Index('ix_video_label', 'video_id', 'labels'),
    )


class LiveStream(db.Model):
    __tablename__ = 'live_streams'

    id = db.Column(db.Integer, primary_key=True)

    stream_name = db.Column(db.String(100), nullable=False)
    stream_url = db.Column(db.Text, nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, nullable=False, default=db.func.now())

    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), nullable=False, index=True)
    user = db.relationship('User', backref=db.backref(
        'live_streams', cascade='all, delete'))

    def __repr__(self):
        return f"<LiveStream {self.stream_name}>"


class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)

    time = db.Column(db.DateTime, nullable=False, default=db.func.now())
    label = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    frame_id = db.Column(db.Integer, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey(
        'users.id'), nullable=False, index=True)
    user = db.relationship('User', backref=db.backref(
        'alerts', cascade='all, delete'))

    def __repr__(self):
        return f"<Alert {self.label} at {self.location}>"
