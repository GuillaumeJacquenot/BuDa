# creer un repertoire holiship

Creer un repertoire holiship et dezipper l'archive dans ce repertoire

mkdir $HOME/holiship
cd holiship
tar xzf holiship-bin_20180604_10h47.tar.gz

# construction des images docker

make build

# creation du network

docker network create hnet

# demarrage du systeme

make run

# arret du systeme

make stop

# addresses des pages

graphTool : localhost/graphTool/
scenariotool : http://localhost:8050/
rabbitmq: http://localhost:15672/
neo4j : http://localhost:7474
