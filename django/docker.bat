
docker rm pomotask
docker rmi pomotask
docker build . -t pomotask:latest
docker run --name pomotask pomotask
