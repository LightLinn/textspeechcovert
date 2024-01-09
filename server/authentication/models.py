from django.db import models

class BlacklistedToken(models.Model):
    token = models.CharField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.token