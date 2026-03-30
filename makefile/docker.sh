
#1. Make build : membuat docker image dari project
build:
	docker build -t myapp .

#2. make run : menjalankan aplikasi dari docker image
run:
	docker run -p 8000:8000 myapp

#3. make push : mengirim image ke repository docker
push:
	docker push myapp

#4. make clean : menghapus image supaya tidak menumpuk
clean:
	docker rmi myapp