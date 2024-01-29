from django.contrib import admin
from .models import Paragraph, Phrase, ComparisonResult, Recommend

class ParagraphAdmin(admin.ModelAdmin):
    list_display = ('user', 'content', 'createDatetime')  

class PhraseAdmin(admin.ModelAdmin):
    list_display = ('paragraph', 'content')

class ComparisonResultAdmin(admin.ModelAdmin):
    list_display = ('phrase', 'correctPhrase', 'wrongPhrase', 'createDatetime')

class RecommendAdmin(admin.ModelAdmin):
    list_display = ('title', 'content', 'link')

admin.site.register(Paragraph, ParagraphAdmin)
admin.site.register(Phrase, PhraseAdmin)
admin.site.register(ComparisonResult, ComparisonResultAdmin)
admin.site.register(Recommend, RecommendAdmin)