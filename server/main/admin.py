from django.contrib import admin
from .models import Paragraph, Phrase, ComparisonResult

class ParagraphAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'createDatetime')  

class PhraseAdmin(admin.ModelAdmin):
    list_display = ('paragraph', 'content')

class ComparisonResultAdmin(admin.ModelAdmin):
    list_display = ('phrase', 'correctPhrase', 'wrongPhrase', 'createDatetime')

admin.site.register(Paragraph, ParagraphAdmin)
admin.site.register(Phrase, PhraseAdmin)
admin.site.register(ComparisonResult, ComparisonResultAdmin)