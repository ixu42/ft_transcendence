
MSG="Activat ethe venv 'source venv/bin/activate' then run install etc"


all:
	echo $(MSG)

install:
	python3 -m venv venv
	venv/bin/pip install -r requirements.txt

migrate:
	venv/bin/python manage.py migrate

start:
	venv/bin/python manage.py runserver 0.0.0.0:8000

clean:
	rm -rf venv


