export PYENV_ROOT="$HOME/.pyenv"
command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"
#eval "$(pyenv init -)"
pyenv local 3.11.4

export PATH=$PATH:$HOME/.local/bin

poetry run python manage.py runserver