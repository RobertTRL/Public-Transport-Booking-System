from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource
from marshmallow import ValidationError

from config import db
from models import User
from schemas import UserSchema


user_schema = UserSchema()
users_schema = UserSchema(many=True)


def get_requesting_user_or_error():
    """Look up the User row for the current JWT identity.
    Returns (user, None) or (None, (error_dict, status_code))."""
    current_id = get_jwt_identity()
    user = User.query.get(current_id)
    if not user:
        return None, ({"error": "Requesting user not found."}, 404)
    return user, None


class ListCreateUserResource(Resource):
    @jwt_required()
    def get(self):
        requester, error = get_requesting_user_or_error()
        if error:
            return error

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        pagination = User.query.filter_by(
            sacco_id=requester.sacco_id
        ).paginate(page=page, per_page=per_page, error_out=False)

        return {
            "users": users_schema.dump(pagination.items),
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }, 200

    @jwt_required()
    def post(self):
        requester, error = get_requesting_user_or_error()
        if error:
            return error

        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = user_schema.load(data)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        # sacco_id always comes from the requester, never trusted from the client
        validated_data["sacco_id"] = requester.sacco_id

        new_user = User(**validated_data)
        db.session.add(new_user)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to create user. Name or email may already be in use."
            }, 400

        return user_schema.dump(new_user), 201


class UpdateDeleteUserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        requester, error = get_requesting_user_or_error()
        if error:
            return error

        target_user = User.query.filter_by(
            id=user_id,
            sacco_id=requester.sacco_id
        ).first()

        if not target_user:
            return {
                "error": "User not found."
            }, 404

        return user_schema.dump(target_user), 200

    @jwt_required()
    def patch(self, user_id):
        requester, error = get_requesting_user_or_error()
        if error:
            return error

        target_user = User.query.filter_by(
            id=user_id,
            sacco_id=requester.sacco_id
        ).first()

        if not target_user:
            return {
                "error": "User not found."
            }, 404

        data = request.get_json()

        if not data:
            return {
                "error": "Request body is required."
            }, 400

        try:
            validated_data = user_schema.load(data, partial=True)
        except ValidationError as err:
            return {
                "errors": err.messages
            }, 400

        # sacco_id is never editable through this endpoint
        validated_data.pop("sacco_id", None)

        for key, value in validated_data.items():
            setattr(target_user, key, value)

        try:
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to update user."
            }, 400

        return user_schema.dump(target_user), 200

    @jwt_required()
    def delete(self, user_id):
        requester, error = get_requesting_user_or_error()
        if error:
            return error

        target_user = User.query.filter_by(
            id=user_id,
            sacco_id=requester.sacco_id
        ).first()

        if not target_user:
            return {
                "error": "User not found."
            }, 404

        try:
            db.session.delete(target_user)
            db.session.commit()
        except Exception:
            db.session.rollback()
            return {
                "error": "Unable to delete user."
            }, 400

        return {
            "message": "User deleted successfully."
        }, 200


class SearchUsersResource(Resource):
    @jwt_required()
    def get(self):
        requester, error = get_requesting_user_or_error()
        if error:
            return error

        name = request.args.get('name')
        email = request.args.get('email')

        if not name and not email:
            return {
                "error": "At least one of 'name' or 'email' query params is required."
            }, 400

        # Always scoped to the requester's own sacco — same tenancy rule
        # as every other endpoint in this file.
        query = User.query.filter_by(sacco_id=requester.sacco_id)

        # Partial, case-insensitive matches. If both are given, results
        # must match both (AND), not either (OR) — narrows the search
        # rather than broadening it.
        if name:
            query = query.filter(User.name.ilike(f"%{name}%"))
        if email:
            query = query.filter(User.email.ilike(f"%{email}%"))

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)

        return {
            "users": users_schema.dump(pagination.items),
            "page": pagination.page,
            "per_page": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        }, 200