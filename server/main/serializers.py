from rest_framework import serializers
from .models import Paragraph, Phrase, ComparisonResult
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class ParagraphSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paragraph
        fields = ['id', 'user', 'content', 'createDatetime']

class PhraseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Phrase
        fields = ['id', 'paragraph', 'content']

class ComparisonResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComparisonResult
        fields = ['id', 'user', 'phrase', 'correctPhrase', 'wrongPhrase', 'createDatetime' ]
