from django.db import models
from django.contrib.auth.models import User

class Paragraph(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='paragraphs')
    content = models.TextField()
    createDatetime = models.DateTimeField(auto_now_add=True, blank=True, editable=False)
    link = models.CharField(max_length=200, blank=True)
    link_ID = models.CharField(max_length=11, blank=True)

    def __str__(self):
        return self.content[:50]

class Phrase(models.Model):
    paragraph = models.ForeignKey(Paragraph, on_delete=models.CASCADE, related_name='phrases')
    content = models.JSONField()

    def __str__(self):
        return self.content

class ComparisonResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    phrase = models.ForeignKey(Phrase, on_delete=models.CASCADE)
    correctPhrase = models.JSONField()
    wrongPhrase = models.JSONField()
    createDatetime = models.DateTimeField(auto_now_add=True, blank=True, editable=False)

    def __str__(self):
        return ''
    
class Recommend(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.TextField()
    link = models.CharField(max_length=200, blank=True)
    link_ID = models.CharField(max_length=11, blank=True)
    createDatetime = models.DateTimeField(auto_now_add=True, blank=True, editable=False)

    def __str__(self):
        return ''