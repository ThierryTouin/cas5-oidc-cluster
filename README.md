# cas5-oidc-cluster

The goal of this project is to propose a complete stack to test a CAS cluster server built with the OIDC plugin.

The CAS server is built in overlay mode. The part of this project is inspired by the following git project https://github.com/nortal/cas5-oidc-example . You can find the readme of the project here https://github.com/ThierryTouin/cas5-oidc-cluster/tree/master/server

The client is a simple OIDC client. I was inspired by the following project https://github.com/VirginPulsePublic/openid-connect-tool. You can find the readme of the project here https://github.com/ThierryTouin/cas5-oidc-cluster/tree/master/client/openid-connect-tool

And finally, you will find a proxy project. It makes the link between the client and the two CAS nodes of the server. It avoids CORS problems. (so you will need to run 2 proxy servers).

To summarize, to launch the project, you must open 4 terminals :
(before you have to read the readme of the server and the client to install the applications, the commands below are only possible if the stack has already worked on the workstation)

1. Terminal for Server
```bash
$ cd cas5-oidc-cluster/server/docker/castom
$ docker-compose up --force-recreate
```
2. Proxy terminal 1
```bash
$ cd cas5-oidc-cluster/proxy/
$ node index.js
```
3. Proxy terminal 2
```bash
$ cd cas5-oidc-cluster/proxy/
$ node index2.js
```
4. Terminal for the customer
```bash
$ cd cas5-oidc-cluster/client/openid-connect-tool/
$ npm start
```
5. Terminal to update docker IP address
In the **/etc/hosts** file, you must update (or add) the following three lines:
```bash
172.18.0.3      cas1
172.18.0.5      cas2
172.18.0.6      casdb
```
To know the IP address of each container docker, you can execute the following lines:
```bash
$ cas5-oidc-cluster/server/docker/castom$ docker inspect castom_cas1_1 | grep IPAddress
            "SecondaryIPAddresses": null,
            "IPAddress": "",
                    "IPAddress": "172.18.0.3",
$ cas5-oidc-cluster/server/docker/castom$ docker inspect castom_cas2_1 | grep IPAddress
            "SecondaryIPAddresses": null,
            "IPAddress": "",
                    "IPAddress": "172.18.0.5",
$ cas5-oidc-cluster/server/docker/castom$ docker inspect castom_db_1 | grep IPAddress
            "SecondaryIPAddresses": null,
            "IPAddress": "",
                    "IPAddress": "172.18.0.6",
```
