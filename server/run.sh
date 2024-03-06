export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
#eval "$(pyenv init -)"
pyenv local 3.11.2

export PATH=$PATH:$HOME/.local/bin

poetry install
poetry run python -m spacy download en_core_web_sm
poetry run python manage.py runserver