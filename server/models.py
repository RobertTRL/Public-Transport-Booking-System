from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData


metadata = MetaData()

db = SQLAlchemy(metadata=metadata)


class Route(db.Model):

    __tablename__ = 'routes'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    color = db.Column(db.String, unique=True, nullable=False)

class Operator(db.Model):

    __tablename__ = 'operators'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    address = db.Column(db.String)
    contact = db.Column(db.String, nullable=False)