from django.shortcuts import render
from django.conf import settings
from django.core.files.storage import default_storage
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Paragraph, Phrase, ComparisonResult, Recommend
from .serializers import ParagraphSerializer, PhraseSerializer, UserSerializer, ComparisonResultSerializer, RecommendSerializer
import re
import jsonschema_specifications
from io import BytesIO
from dotenv import load_dotenv
import os
from gtts import gTTS
import spacy
import openai
from pytube import YouTube
import youtube_dl
from pydub import AudioSegment
import subprocess
import ssl

nlp = spacy.load('en_core_web_sm')
ssl._create_default_https_context = ssl._create_unverified_context
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class UrlToText(APIView):
    def post(self, request, *args, **kwargs):
        url = request.data.get('url')
        youtube_regex = (
            r'(https?://)?(www\.)?'
            '(youtube|youtu|youtube-nocookie)\.(com|be)/'
            '(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})'
        )

        if not re.match(youtube_regex, url):
            return Response({"error": "Invalid YouTube URL"}, status=status.HTTP_400_BAD_REQUEST)
        if url == '':
            return Response({'text': ''}, status=status.HTTP_200_OK)
        
        # video_length_seconds = get_youtube_video_length(url)
        # if video_length_seconds > 600: 
        #     return Response({"error": "Video length exceeds 10 minutes"}, status=status.HTTP_400_BAD_REQUEST)

        yt = YouTube(url)
        audio = yt.streams.filter().get_audio_only().download(filename=f'audio.mp3')
        audio = open(audio, 'rb')
        text = stt(request, audio)
        return Response({'text': text}, status=status.HTTP_200_OK)

class ParagraphViewSet(viewsets.ModelViewSet):
    queryset = Paragraph.objects.all()
    serializer_class = ParagraphSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Paragraph.objects.filter(user=user).order_by('-createDatetime')[:5]

    def create(self, request, *args, **kwargs):
        user = request.user

        if not user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=401)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        paragraph = serializer.save(user=user)

        phrases = self.split_into_phrases(paragraph.content)
        phrase_objects = [Phrase(paragraph=paragraph, content=phrase) for phrase in phrases]
        #Phrase.objects.bulk_create(phrase_objects)
        for phrase in phrase_objects:
            phrase.save()
        phrase_serializer = PhraseSerializer(phrase_objects, many=True)
        return Response({
            'paragraph': serializer.data,
            'phrases': phrase_serializer.data
        }, status=201)

    def split_into_phrases(self, content):
        try:
            doc = nlp(content)
            sentences = [sent.text for sent in doc.sents]
            return sentences
        except Exception as err:
            print(err)
        # phrases = re.split(r'(?<!\d)[.?!](?!\d)', content)
        # return [phrase.strip() for phrase in phrases if phrase.strip()]
        
class PhraseViewSet(viewsets.ModelViewSet):
    queryset = Phrase.objects.all()
    serializer_class = PhraseSerializer

    @action(detail=False, methods=['post'])
    def text_to_speech(self, request):
        phrase = request.data.get('phrase')
        langType = request.data.get('lang')
        text = phrase.replace('-', ' ')
        tts = gTTS(text=text, lang=langType)
        fp = BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)

        response = HttpResponse(fp.getvalue(), content_type='audio/mpeg')
        response['Content-Disposition'] = 'attachment; filename="speech.mp3"'
        return response
    
    @action(detail=False, methods=['post'])
    def chatgpt_text_to_speech(self, request):
        word = request.data.get('word')
        wordinfo = request.data.get('wordinfo')
        langType = request.data.get('lang')
        
        word_audio = gTTS(text=word, lang='en')
        wordinfo_audio = gTTS(text=wordinfo, lang='zh')
        fp = BytesIO()
        fp2 = BytesIO()
        word_audio.write_to_fp(fp)
        wordinfo_audio.write_to_fp(fp2)
        fp.seek(0)
        fp2.seek(0)

        word_audio_segment = AudioSegment.from_file(fp, format="mp3")
        wordinfo_audio_segment = AudioSegment.from_file(fp2, format="mp3")
        combined_audio = word_audio_segment + wordinfo_audio_segment
        combined_fp = BytesIO()
        combined_audio.export(combined_fp, format="mp3")
        combined_fp.seek(0)

        response = HttpResponse(combined_fp.getvalue(), content_type='audio/mpeg')
        response['Content-Disposition'] = 'attachment; filename="speech.mp3"'
        return response

class ComparisonResultViewSet(viewsets.ModelViewSet):
    queryset = ComparisonResult.objects.all()
    serializer_class = ComparisonResultSerializer

class RecommendViewSet(viewsets.ModelViewSet):
    queryset = Recommend.objects.all()
    serializer_class = RecommendSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.queryset.order_by('-createDatetime')[:5]


class WordInfoView(APIView):
    def get(self, request, format=None):
        word = request.query_params.get('word', None)
        if word is None:
            return Response({"error": "No word provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        word_info = self.get_word_info(word)
        if word_info is None:
            return Response({"error": "Word not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(word_info)
    
    def get_word_info(self, word):
        prompt=f"Please use 20 characters in Traditional Chinese to explain the words.: 「{word}」"
        client = openai.OpenAI(api_key=OPENAI_API_KEY)
        chat_completion = client.chat.completions.create(
                messages=[{
                            "role": "user",
                            "content": f"{prompt}",
                        }],
                model="gpt-3.5-turbo",
                max_tokens=80
                )
        print(chat_completion.choices[0].message.content)
        return chat_completion.choices[0].message.content

class AudioToResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        audio = request.FILES.get('audio')
        # phrase = request.POST.get('phrase')
        phraseId = int(request.POST.get('phraseId'))
        phrase = Phrase.objects.get(id=phraseId)
        user = request.user

        if audio:
            file_path = os.path.join(settings.MEDIA_ROOT, audio.name)
            file_path = default_storage.save('uploads/' + audio.name, audio)
            file_path_full = default_storage.path(file_path)
            audio = AudioSegment.from_file(file_path_full)
            wav_path = os.path.splitext(file_path_full)[0] + '.wav'
            audio.export(wav_path, format="wav")
            audio = open(wav_path, 'rb')
            results = stt(request, audio=audio)

            question = str_clean(phrase.content)
            answer = str_clean(results)
            print('phrase: ', phrase)
            print('results: ', results)
            print('question: ', question)
            print('answer: ', answer)
            
            corr_list = lcs_corrected(question, answer)
            wrong_list = [word for word in question if word not in corr_list]
            print(corr_list)
            print(wrong_list)
            comparison_result = ComparisonResult(
                user=user,
                phrase=phrase,
                correctPhrase=corr_list,
                wrongPhrase=wrong_list,
            )
            comparison_result.save()

            return Response({'message': 'Audio file received successfully', 'corr_list': corr_list, 'wrong_list': wrong_list}, status=status.HTTP_200_OK)
        return Response({'error': 'No audio file received'}, status=400)
    
def get_youtube_video_length(url):
    yt = YouTube(url)
    length_seconds = yt.length
    return length_seconds

def stt(request, audio):
    client = openai.OpenAI(api_key=OPENAI_API_KEY)
    text = client.audio.transcriptions.create(model="whisper-1", file=audio, response_format="text")
    return text

def str_clean(string):
    string = string.replace(".", "")
    string = string.replace(",", "")
    string = string.replace("!", "")
    string = string.replace("?", "")
    string = string.replace("-", " ")
    string = string.lower().split()
    return string

def lcs_corrected(X, Y):
    """
    Corrected function to find the longest common subsequence between two sequences.
    """
    m = len(X)
    n = len(Y)
    L = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if X[i - 1] == Y[j - 1]:
                L[i][j] = L[i - 1][j - 1] + 1
            else:
                L[i][j] = max(L[i - 1][j], L[i][j - 1])

    index = L[m][n]
    lcs = [""] * index

    i, j = m, n
    while i > 0 and j > 0:
        if X[i - 1] == Y[j - 1]:
            lcs[index - 1] = X[i - 1]
            i -= 1
            j -= 1
            index -= 1
        elif L[i - 1][j] > L[i][j - 1]:
            i -= 1
        else:
            j -= 1

    return lcs

#-------------------------------------------------------------------------------------------------

@csrf_exempt  
def my_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        content = data.get('content')
        return JsonResponse({'message': '成功收到資料', 'received_content': content})
    return JsonResponse({'message': '只接受 POST 請求'})