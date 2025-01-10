
MSG="Activat ethe venv 'source venv/bin/activate' then run install etc"


all:
	echo $(MSG)

home-install:
	python3 -m venv venv
	venv/bin/pip install -r requirements.txt
	echo -e "\n\n $(MSG) \n\n"

school-install:
	pip3 install --user virtualenv
	python3 -m virtualenv venv
	venv/bin/pip install -r requirements.txt
	echo -e "\n\n $(MSG) \n\n"

migrate:
	venv/bin/python manage.py migrate

start:
	venv/bin/python manage.py migrate
	venv/bin/python manage.py runserver

clean:
	rm -rf venv


.PHONY: start migrate clean school-install home-install

